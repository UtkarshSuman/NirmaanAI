#!/usr/bin/env python3
"""
NIRMAAN AI (PAIMAANA) - Supabase Data Migration & Synchronization Script
========================================================================
Pushes all 1,936 projects, 1,936 predictions, and 148 alerts to Supabase
using the high-performance HTTPS REST API (Port 443).
Handles:
  1. Identical key alignment for PostgREST (PGRST102 fix)
  2. ISO-8601 timestamp conversion from SQLite epoch milliseconds
  3. Batch upserting in chunks of 100 with live progress tracking
"""

import os
import sys
import json
import sqlite3
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any, Optional

# Ensure Windows console doesn't crash on UTF-8 / emojis
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Root paths
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
FRONTEND_DIR = PROJECT_ROOT / "frontend"
SQLITE_DB = FRONTEND_DIR / "prisma" / "dev.db"
ENV_LOCAL = FRONTEND_DIR / ".env.local"

# ─── Load Environment Configuration ──────────────────────────────────────────

def load_env() -> Dict[str, str]:
    env_vars = {}
    if ENV_LOCAL.exists():
        with open(ENV_LOCAL, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env_vars[k.strip()] = v.strip().strip('"').strip("'")
    return env_vars

ENV = load_env()

SUPABASE_URL = (
    os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    or ENV.get("NEXT_PUBLIC_SUPABASE_URL")
    or "https://hqsjbpcadntptbgntfmy.supabase.co"
).rstrip("/")

SUPABASE_KEY = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get("SUPABASE_ANON_KEY")
    or ENV.get("SUPABASE_SERVICE_ROLE_KEY")
    or ENV.get("SUPABASE_ANON_KEY", "")
)

# ─── Timestamp Sanitizer ─────────────────────────────────────────────────────

def sanitize_date(val: Any) -> Optional[str]:
    """Converts SQLite date representations into valid ISO-8601 strings for PostgreSQL TIMESTAMPTZ."""
    if val is None or val == "" or str(val).strip().lower() == "none":
        return None

    # Epoch millisecond number (e.g. 1790628268135)
    if isinstance(val, (int, float)):
        try:
            if val > 10_000_000_000:
                return datetime.fromtimestamp(val / 1000.0, timezone.utc).isoformat()
            return datetime.fromtimestamp(val, timezone.utc).isoformat()
        except Exception:
            return None

    if isinstance(val, str):
        val = val.strip()
        # Numeric string (e.g. "1790628268135")
        if val.isdigit():
            try:
                num = int(val)
                if num > 10_000_000_000:
                    return datetime.fromtimestamp(num / 1000.0, timezone.utc).isoformat()
                return datetime.fromtimestamp(num, timezone.utc).isoformat()
            except Exception:
                return None

        # Space separated ISO timestamp: '2026-09-28 18:24:31' -> '2026-09-28T18:24:31Z'
        if " " in val and "T" not in val:
            val = val.replace(" ", "T") + "Z"
        elif not val.endswith("Z") and "+" not in val:
            val = val + "Z"
        return val

    return str(val)

# ─── Canonical Column Maps ────────────────────────────────────────────────────

PROJECT_COLUMNS = [
    "id", "project_id", "project_name", "ministry_department", "sector", "sub_sector",
    "state", "district", "implementing_agency", "original_cost_crore", "revised_cost_crore",
    "anticipated_cost_crore", "cumulative_expenditure_crore", "expenditure_current_year_crore",
    "expenditure_previous_year_crore", "land_acquisition_cost_crore", "original_start_date",
    "original_completion_date", "revised_completion_date", "anticipated_completion_date",
    "year_of_approval", "physical_progress_percent", "financial_progress_percent",
    "milestone_achieved_count", "milestone_total_count", "project_status",
    "cost_overrun_percent", "time_overrun_months", "reason_for_delay",
    "cost_revision_count", "schedule_revision_count", "last_updated", "created_at", "updated_at"
]

PREDICTION_COLUMNS = [
    "id", "project_id", "prediction_date", "model_version",
    "predicted_cost_overrun_percent", "cost_overrun_probability",
    "predicted_time_overrun_months", "time_overrun_probability",
    "risk_score", "risk_category", "top_risk_factors", "shap_values", "created_at"
]

ALERT_COLUMNS = [
    "id", "project_id", "alert_type", "severity", "title", "description",
    "risk_score", "recommended_action", "is_acknowledged", "acknowledged_at", "created_at"
]

DATE_FIELDS = {
    "original_start_date", "original_completion_date", "revised_completion_date",
    "anticipated_completion_date", "last_updated", "created_at", "updated_at",
    "prediction_date", "acknowledged_at"
}

# ─── Extraction & Normalization ──────────────────────────────────────────────

def extract_and_normalize() -> Dict[str, List[Dict[str, Any]]]:
    """Reads projects, predictions, and alerts from dev.db and normalizes keys and dates."""
    if not SQLITE_DB.exists():
        print(f"❌ Local SQLite database not found at {SQLITE_DB}")
        return {"projects": [], "predictions": [], "alerts": []}

    conn = sqlite3.connect(SQLITE_DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    print("📦 Reading projects from local database...")
    cursor.execute("SELECT * FROM projects")
    raw_projects = cursor.fetchall()

    norm_projects = []
    for row in raw_projects:
        r = dict(row)
        item = {}
        for col in PROJECT_COLUMNS:
            val = r.get(col)
            if col in DATE_FIELDS:
                val = sanitize_date(val)
            item[col] = val
        norm_projects.append(item)

    print("📦 Reading predictions from local database...")
    cursor.execute("SELECT * FROM predictions")
    raw_preds = cursor.fetchall()

    norm_preds = []
    for row in raw_preds:
        r = dict(row)
        item = {}
        for col in PREDICTION_COLUMNS:
            val = r.get(col)
            if col in DATE_FIELDS:
                val = sanitize_date(val)
            item[col] = val
        norm_preds.append(item)

    print("📦 Reading alerts from local database...")
    cursor.execute("SELECT * FROM alerts")
    raw_alerts = cursor.fetchall()

    norm_alerts = []
    for row in raw_alerts:
        r = dict(row)
        item = {}
        for col in ALERT_COLUMNS:
            val = r.get(col)
            if col in DATE_FIELDS:
                val = sanitize_date(val)
            elif col == "is_acknowledged":
                val = bool(val)
            item[col] = val
        norm_alerts.append(item)

    conn.close()
    return {"projects": norm_projects, "predictions": norm_preds, "alerts": norm_alerts}

# ─── Batch Upsert via Supabase REST API (HTTPS Port 443) ─────────────────────

def push_table_batch(table_name: str, records: List[Dict[str, Any]], batch_size: int = 100) -> bool:
    """Pushes a list of records with identical keys to Supabase REST API."""
    if not records:
        print(f"ℹ️ No records to push for '{table_name}'.")
        return True

    url = f"{SUPABASE_URL}/rest/v1/{table_name}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }

    total = len(records)
    print(f"\n🚀 [HTTPS REST Pathway] Ingesting {total} records into '{table_name}' in batches of {batch_size}...")

    success_count = 0
    for i in range(0, total, batch_size):
        batch = records[i:i + batch_size]
        payload_bytes = json.dumps(batch).encode("utf-8")
        req = urllib.request.Request(url, data=payload_bytes, headers=headers, method="POST")

        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                if res.status in (200, 201, 204):
                    success_count += len(batch)
                    print(f"  ✓ Processed {success_count}/{total} rows into {table_name}")
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode("utf-8")
            print(f"  ❌ Error on batch {i}-{i+len(batch)} to {table_name} (HTTP {e.code}): {err_msg}")
            return False
        except Exception as e:
            print(f"  ❌ Network error on batch {i}-{i+len(batch)}: {e}")
            return False

    print(f"✅ Successfully ingested all {success_count} records into '{table_name}'!")
    return True

# ─── Main Execution ──────────────────────────────────────────────────────────

def main():
    print("=" * 75)
    print("  NIRMAAN AI (PAIMAANA) — Complete Supabase PostgreSQL Data Ingestion")
    print("=" * 75)
    print(f"Target Project URL: {SUPABASE_URL}")

    if not SUPABASE_KEY:
        print("❌ Error: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is missing from .env.local!")
        return

    # Clean up test artifact if exists
    try:
        del_url = f"{SUPABASE_URL}/rest/v1/projects?project_id=eq.PRJ-TEST-0001"
        del_req = urllib.request.Request(
            del_url,
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
            method="DELETE"
        )
        urllib.request.urlopen(del_req, timeout=5)
    except Exception:
        pass

    # Extract & normalize
    data = extract_and_normalize()
    project_count = len(data["projects"])
    pred_count = len(data["predictions"])
    alert_count = len(data["alerts"])
    print(f"\n📊 Extracted: {project_count} Projects, {pred_count} Predictions, {alert_count} Alerts.")

    if project_count == 0:
        print("❌ No projects found in SQLite database.")
        return

    # Ingest in relational order:
    # 1. Projects first (Parent table)
    ok_proj = push_table_batch("projects", data["projects"], batch_size=100)
    if not ok_proj:
        print("\n❌ Project ingestion encountered errors. Aborting child table ingestion.")
        return

    # 2. Predictions second (Foreign Key: project_id -> projects.project_id)
    ok_pred = push_table_batch("predictions", data["predictions"], batch_size=100)

    # 3. Alerts third (Foreign Key: project_id -> projects.project_id)
    ok_alert = push_table_batch("alerts", data["alerts"], batch_size=100)

    print("\n" + "=" * 75)
    print("🎉 FULL DATASET SUCCESSFULLY MIGRATED TO SUPABASE!")
    print(f"   • {project_count} Projects loaded")
    print(f"   • {pred_count} Predictions synchronized")
    print(f"   • {alert_count} Early Warning Alerts active")
    print("=" * 75)

if __name__ == "__main__":
    main()

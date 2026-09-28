# ⚙️ Backend & API Data-Shaping Blueprint

> **Problem Statement ID:** 26103 | MoSPI Integrated Infrastructure Project Monitoring Platform  
> **Target Scope:** Next.js API Routes (`frontend/src/app/api/`) & FastAPI ML Service (`ml-service/app/`)  
> **Guiding Principle:** Support the enhanced UI/UX visual components (EVM S-Curves, 2x2 Risk Scatter Matrix, Humanized SHAP, Policy Briefing Cards) through clean, robust data contracts without introducing functional feature creep.

---

## 1. Overview of Backend Support Requirements

To power the refined visual components outlined in the Frontend Blueprint, the backend and API layer needs the following data-shaping updates:

```
┌──────────────────────────────────────────────┐
│ Enhanced Frontend Design Components          │
├──────────────────────────────────────────────┤
│ 1. EVM S-Curve Chart                         │ ◀─── GET /api/projects/[id]/evm-curve
│ 2. 2x2 Risk Scatter Triage Matrix            │ ◀─── GET /api/analytics/risk-matrix
│ 3. Humanized Root-Cause Risk Drivers (SHAP)  │ ◀─── Humanized Feature Mapping Dictionary
│ 4. Executive Pulse Hero Banner               │ ◀─── GET /api/kpi/executive-pulse
│ 5. Structured Cabinet Briefing Cards         │ ◀─── POST /api/chat (Structured Schema)
└──────────────────────────────────────────────┘
```

---

## 2. API Contract Specifications

### A. EVM S-Curve Time-Series Endpoint
* **Route:** `GET /api/projects/[id]/evm-curve` (in `frontend/src/app/api/projects/[id]/evm-curve/route.ts` or FastAPI ML service)
* **Purpose:** Returns monthly time-series points to feed the `EvmSCurveChart.tsx` component.
* **Response Payload Contract:**
  ```json
  {
    "projectId": "MOSPI-RLW-0192",
    "projectName": "Rishikesh - Karanprayag New Broad Gauge Rail Link",
    "sanctionedCostCrore": 16216.0,
    "revisedCostCrore": 24425.0,
    "dataPoints": [
      {
        "month": "2024-01",
        "plannedBcwsPercent": 42.0,
        "actualBcwpPercent": 39.5,
        "expenditureAcwpPercent": 44.0,
        "isForecast": false
      },
      {
        "month": "2026-04",
        "plannedBcwsPercent": 85.0,
        "actualBcwpPercent": 58.0,
        "expenditureAcwpPercent": 74.0,
        "isForecast": false,
        "fiscalDivergencePercent": 16.0
      },
      {
        "month": "2027-06",
        "plannedBcwsPercent": 100.0,
        "actualBcwpPercent": null,
        "expenditureAcwpPercent": null,
        "forecastP50Percent": 82.0,
        "forecastP95Percent": 96.0,
        "isForecast": true
      }
    ],
    "summaryMetrics": {
      "scheduleVarianceMonths": 28,
      "costVarianceCrore": 8209.0,
      "currentDivergenceZone": "CRITICAL_BLEED"
    }
  }
  ```

---

### B. 2x2 Risk Scatter Triage Matrix Endpoint
* **Route:** `GET /api/analytics/risk-matrix` (in `frontend/src/app/api/analytics/risk-matrix/route.ts`)
* **Purpose:** Returns lightweight scatter coordinates for all 1,981 projects to plot them without client-side lag.
* **Response Payload Contract:**
  ```json
  {
    "totalProjects": 1981,
    "quadrantCounts": {
      "crisisZone": 148,
      "budgetBleeders": 86,
      "bottlenecked": 608,
      "onTrack": 1139
    },
    "projects": [
      {
        "id": "cm123456",
        "projectId": "MOSPI-RLW-0192",
        "projectName": "Rishikesh - Karanprayag Rail Link",
        "sector": "Railways",
        "ministry": "Ministry of Railways",
        "sanctionedCostCrore": 16216,
        "revisedCostCrore": 24425,
        "costOverrunPercent": 50.6,
        "timeOverrunMonths": 38,
        "riskScore": 92,
        "riskTier": "CRITICAL",
        "quadrant": "CRISIS_ZONE"
      }
    ]
  }
  ```

---

### C. Executive Pulse Aggregate Banner Endpoint
* **Route:** `GET /api/kpi/executive-pulse` (in `frontend/src/app/api/kpi/route.ts`)
* **Purpose:** Provides the single-source-of-truth high-level numbers for the top dashboard banner.
* **Response Payload Contract:**
  ```json
  {
    "activeProjects": 1981,
    "totalCapitalOutlayLakhCrore": 42.78,
    "netEscalationLakhCrore": 5.65,
    "capitalAtCriticalRiskLakhCrore": 1.42,
    "projectsRequiringImmediatePrcReview": 148,
    "projectsWithScheduleSlippageOver12Mo": 842,
    "mlModelAccuracy": {
      "costF1Score": 0.994,
      "aucRoc": 0.9997,
      "earlyWarningLeadMonths": 6
    },
    "lastUpdated": "2026-04-15T00:00:00Z"
  }
  ```

---

## 3. Explainable AI Feature Mapping Dictionary

### Affected File:
- `ml-service/app/main.py` (or a dedicated helper `ml-service/app/services/feature_dictionary.py`)

### The Problem:
Raw SHAP calculations output feature names derived from ML training columns (e.g., `exp_phys_gap_ratio`, `land_acq_lag_idx`, `milestone_achieve_rate`). When serialized to JSON and shown in the UI, non-technical evaluators cannot interpret them.

### Implementation:
Create a centralized **Humanized Feature Translator** that maps internal model features to plain administrative descriptions, units, and directional risk categories:

```python
# ml-service/app/services/feature_dictionary.py

FEATURE_DICTIONARY = {
    "exp_phys_gap_ratio": {
        "title": "Disproportionate Capital Expenditure vs. Physical Work Delivered",
        "category": "FISCAL_DISCIPLINE",
        "unit": "Percentage Gap",
        "description": "Financial burn rate is outstripping completed ground physical progress, indicating potential claim inflation or front-loading.",
        "prescribed_action": "Audit package contractor running account bills before releasing next fiscal tranche."
    },
    "land_acq_lag_idx": {
        "title": "Right-of-Way (RoW) & Land Compensation Disbursement Lag",
        "category": "CLEARANCE_BOTTLENECK",
        "unit": "Months Behind Schedule",
        "description": "Critical linear parcels have not been handed over to EPC contractors within the stipulated contract window.",
        "prescribed_action": "Convene Joint State Coordination Committee with District Collectors."
    },
    "milestone_achieve_rate": {
        "title": "Chronic Milestone Slippage in Structural & Civil Packages",
        "category": "EXECUTION_VELOCITY",
        "unit": "Milestones Overdue",
        "description": "Project has missed 3 or more consecutive critical-path target milestones.",
        "prescribed_action": "Mandate fortnightly site-level milestone monitoring through PMC."
    },
    "revision_count": {
        "title": "Frequent Estimate Revisions (Scope Creep Indicator)",
        "category": "GOVERNANCE",
        "unit": "Revision Iterations",
        "description": "Project has undergone repeated revised cost estimates (RCE), signaling unstable technical scope.",
        "prescribed_action": "Refer to Revised Cost Committee (RCC) for definitive scope freeze."
    }
}

def humanize_shap_factors(raw_shap_list):
    """
    Transforms raw ML SHAP factors into humanized, UI-ready cards.
    """
    humanized = []
    for item in raw_shap_list:
        feat_name = item.get("feature")
        meta = FEATURE_DICTIONARY.get(feat_name, {
            "title": feat_name.replace("_", " ").title(),
            "category": "GENERAL",
            "unit": "",
            "description": "Operational variance impacting project delivery trajectory.",
            "prescribed_action": "Review with implementing agency."
        })
        
        impact_value = item.get("value", 0.0)
        humanized.append({
            "featureKey": feat_name,
            "title": meta["title"],
            "category": meta["category"],
            "impactDirection": "ACCELERATOR" if impact_value > 0 else "MITIGATOR",
            "impactPercentage": round(abs(impact_value) * 100, 1),
            "estimatedCostImpactCrore": round(abs(impact_value) * item.get("baseCost", 1000) * 0.15, 1),
            "description": meta["description"],
            "prescribedAction": meta["prescribed_action"]
        })
    return humanized
```

---

## 4. Policy Assistant Structured Output Formatting

### Affected Files:
- `frontend/src/app/api/chat/route.ts`
- `ml-service/app/main.py` (LLM processing pipeline)

### The Problem:
Returning raw, unstructured Markdown strings causes the UI to look like an arbitrary chat log, preventing interactive cards, table filtering, or clean printing.

### Implementation:
Ensure the assistant API outputs a structured JSON response schema (or parseable delimited blocks):

```json
{
  "subject": "Executive Brief: High-Risk Rail Corridors in Northern Region",
  "securityClassification": "OFFICIAL USE ONLY",
  "generatedAt": "2026-04-15T10:30:00Z",
  "executiveSummary": [
    "4 ongoing railway projects in the Northern region exceed 30 months delay.",
    "Cumulative sanctioned cost: ₹42,800 Cr; Cumulative revised cost: ₹68,400 Cr (+60% overrun).",
    "Primary root cause across all 4 corridors is geological surprises in tunneling packages."
  ],
  "referencedProjects": [
    {
      "projectId": "MOSPI-RLW-0192",
      "projectName": "Rishikesh - Karanprayag Rail Link",
      "costOverrunPercent": 50.6,
      "timeOverrunMonths": 38,
      "riskScore": 92
    },
    {
      "projectId": "MOSPI-RLW-0104",
      "projectName": "Udhampur-Srinagar-Baramulla Rail Link (USBRL)",
      "costOverrunPercent": 1380.0,
      "timeOverrunMonths": 180,
      "riskScore": 98
    }
  ],
  "prescribedInterventions": [
    "Schedule Special Review with Railway Board and Ministry of Environment.",
    "Authorize geological re-profiling for Tunnel 7 and Tunnel 8."
  ],
  "downloadableCabinetNoteId": "CAB-NOTE-2026-RLW-09"
}
```

---

## 5. Backend Implementation Checklist

- [ ] **EVM Curve Generator:** Create route `GET /api/projects/[id]/evm-curve` returning monthly planned, actual, and forecast arrays.
- [ ] **Risk Matrix Route:** Implement `GET /api/analytics/risk-matrix` returning the 2x2 coordinate array.
- [ ] **Feature Translation Helper:** Integrate `FEATURE_DICTIONARY` in `ml-service` to humanize SHAP outputs before returning to the frontend.
- [ ] **Executive Pulse API:** Ensure `GET /api/kpi` returns the top-line triage figures (`capitalAtCriticalRiskLakhCrore`, `projectsRequiringImmediatePrcReview`).
- [ ] **Structured Assistant Pipeline:** Update the LLM prompt/response handler to emit structured JSON sections for executive briefings.

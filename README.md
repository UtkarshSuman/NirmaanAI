# NIRMAAN AI

## Predictive Infrastructure Intelligence

A full-stack infrastructure intelligence platform for monitoring Central Sector Infrastructure Projects, identifying cost and schedule risk, and surfacing early warnings through a machine-learning ensemble pipeline.

> **Platform type:** Infrastructure Intelligence Research & Demonstration Platform
> **Data:** Synthetic development dataset — not live government data

---

## Table of Contents

1. [Overview](#1-overview)
2. [Problem](#2-problem)
3. [Solution](#3-solution)
4. [Current Capabilities](#4-current-capabilities)
5. [System Architecture](#5-system-architecture)
6. [Data Architecture](#6-data-architecture)
7. [ML Architecture](#7-ml-architecture)
8. [Risk Engine](#8-risk-engine)
9. [Priority Engine](#9-priority-engine)
10. [AI Officer](#10-ai-officer)
11. [Interactive India Map](#11-interactive-india-map)
12. [Data Provenance](#12-data-provenance)
13. [Local Setup](#13-local-setup)
14. [Environment Variables](#14-environment-variables)
15. [Database Setup](#15-database-setup)
16. [ML Service Setup](#16-ml-service-setup)
17. [Testing and Build](#17-testing-and-build)
18. [Repository Structure](#18-repository-structure)
19. [Development Workflow](#19-development-workflow)
20. [Known Limitations](#20-known-limitations)
21. [Future Production Architecture](#21-future-production-architecture)
22. [License](#22-license)
23. [SIH Context](#23-sih-context)

---

## 1. Overview

NIRMAAN AI is a predictive infrastructure monitoring platform built to demonstrate how machine learning can improve project oversight across India's central-sector infrastructure portfolio. It provides:

- A **national portfolio dashboard** with live database-backed statistics
- A **project directory** with search, filter, and individual project dossiers
- A **risk radar** based on ML ensemble predictions (Critical / High / Moderate / Low / Unclassified)
- A **composite priority engine** that scores all active projects before selecting top-N
- A **geographic map** visualising risk concentration by state
- An **analytics module** comparing ML ensemble performance against conventional baselines
- An **AI Officer** assistant for natural-language portfolio queries

---

## 2. Problem

Large-scale infrastructure projects frequently experience cost escalation and schedule slippage. Traditional project monitoring systems report what has already happened — they do not flag emerging risk before it materialises.

Key challenges:
- Cost overruns identified only after budget revisions are submitted
- Schedule slippage visible only months after it begins accumulating
- No early-warning mechanism correlating multiple risk signals simultaneously
- No machine-learning baseline comparison to demonstrate improvement over rule-based heuristics

---

## 3. Solution

NIRMAAN AI transforms project monitoring from descriptive to predictive:

| Capability | Description |
|---|---|
| **Cost Overrun Prediction** | ML ensemble classifies projects as likely to overrun before it is formally reported |
| **Time Overrun Prediction** | Forecasts schedule slippage using 47 engineered CUF features |
| **Composite Risk Score** | 0-100 score per project derived from model output or category heuristic |
| **Early Warning Alerts** | Automatically generated alerts with severity levels and recommended actions |
| **SHAP Explainability** | Feature contribution values stored per prediction for interpretability |
| **Priority Ranking** | All active projects scored; top-N selected by composite score |
| **AI Officer** | Natural-language query interface over the live portfolio database |
| **India Geo-Map** | State-level choropleth visualising project count and risk concentration |

---

## 4. Current Capabilities

All capabilities listed below are implemented and active in the current codebase:

- Next.js 16 full-stack application with TypeScript
- Prisma ORM backed by SQLite (development) database
- Portfolio service returning live database-backed KPIs
- Prediction service with per-project latest-prediction resolution
- Priority engine scoring all active projects (not just top 50 by cost)
- Risk distribution with CRITICAL / HIGH / MODERATE / LOW / UNCLASSIFIED
- Data freshness bar showing actual DB timestamps and model artifact timestamps
- Interactive SVG-based India map with state-level data from the API
- AI Officer assistant with live database context
- Alerts page with severity filtering and acknowledgement state
- Analytics page with ML vs conventional benchmark comparison
- FastAPI ML service for model training and SHAP inference
- Synthetic data generator (development data only)

---

## 5. System Architecture

```
Browser
  |
Next.js 16 Application (localhost:3000)
  |-- App Router pages (/, /projects, /analytics, /alerts, /map, /assistant)
  |-- Next.js API Routes (/api/kpi, /api/projects, /api/states, /api/alerts, /api/chat)
  |-- Server Components + Client Components
          |
     Prisma ORM
          |
     SQLite Database (frontend/prisma/dev.db)

ML Evaluation Path (optional):
  FastAPI ML Service (localhost:8000)
    |
  ml-service/data/models/training_results.json  [artifact]
    |
  Next.js modelService.ts reads artifact for analytics display
```

**Service layer** (`frontend/src/lib/services/`):

| Service | Role |
|---|---|
| `portfolioService.ts` | Aggregate KPIs, risk distribution, recent updates, alerts |
| `predictionService.ts` | Latest valid prediction per project (current model output) |
| `priorityEngine.ts` | Composite priority score across all active projects |
| `freshnessService.ts` | Database and artifact timestamps for the freshness bar |
| `modelService.ts` | Reads and validates `training_results.json` model artifact |

---

## 6. Data Architecture

```
data-generator/
  generate_projects.py   -->  data/raw/projects.csv (synthetic)
  seed_db.py             -->  frontend/prisma/dev.db (destructive seed)

frontend/prisma/
  schema.prisma          -->  SQLite schema: Project, Prediction, Alert
  dev.db                 -->  SQLite database (development)
```

**Prisma models:**

- `Project` — project master data including cost, timeline, progress, and status fields
- `Prediction` — ML model output per project (risk score, risk category, SHAP values)
- `Alert` — Early warning signals linked to projects with severity and acknowledgement state

> **Important:** All project data in `dev.db` is synthetic. It was generated by `data-generator/generate_projects.py` and seeded by `data-generator/seed_db.py`. It does not represent live or official government project records.

---

## 7. ML Architecture

```
Raw project CSV (synthetic dataset)
        |
Feature Engineering (47 CUF-aligned features)
        |
Train/Test Split + 5-Fold Stratified Cross-Validation
        |
  XGBoost Classifier + LightGBM Classifier + Random Forest Classifier
        |
  Stacking Meta-Learner (Logistic Regression)
        |
  training_results.json  (model evaluation artifact)
```

**Tech stack:** Python 3.10+, FastAPI 0.115, scikit-learn 1.5, XGBoost 2.1, LightGBM 4.5, SHAP 0.46, Optuna 4.0

The ML service is **optional for running the application**. The frontend reads pre-computed predictions stored in the database and reads the model artifact for the analytics page.

---

## 8. Risk Engine

Each project's risk is determined from its current prediction (latest prediction record by `createdAt DESC`):

```
riskScore (0-100)          -> CURRENT_MODEL_OUTPUT
  |
  if null:
    riskCategory string    -> CATEGORY_HEURISTIC
      (CRITICAL=90, HIGH=70, MODERATE=40, LOW=15)
      |
      if null:
        Score = 0          -> UNAVAILABLE
```

Risk distribution across the portfolio satisfies the invariant:

```
CRITICAL + HIGH + MODERATE + LOW + UNCLASSIFIED = totalProjects
```

Projects with no prediction record are counted as UNCLASSIFIED, not silently classified.

---

## 9. Priority Engine

The priority engine evaluates **every active project** before selecting top-N:

```
ALL ACTIVE PROJECTS (projectStatus = "Under Implementation")
        |
LATEST VALID PREDICTION PER PROJECT  (predictionService)
        |
CURRENT UNACKNOWLEDGED ALERTS        (Prisma)
        |
COMPOSITE PRIORITY SCORE (0-100)
  = 35% x Risk Score
  + 25% x Cost Overrun Factor
  + 20% x Schedule Delay Factor
  + 10% x Capital Exposure Factor
  + 10% x Alert Distress Factor
        |
SORT DESCENDING BY COMPOSITE SCORE
        |
TAKE TOP N (default: 6)
```

This eliminates historical bias where only the top-50 most expensive projects were considered.

---

## 10. AI Officer

The AI Officer (`/assistant`) is a rule-augmented assistant that:

1. Detects state, sector, or agency keywords in the query
2. Executes a focused Prisma query against the live database
3. Returns a formatted summary with per-project risk context

The assistant does not use a third-party LLM API in the current implementation — all responses are generated from live database queries with structured formatting. The Gemini API integration is optional and environment-variable controlled.

---

## 11. Interactive India Map

The India map (`/map` and homepage hero) is an SVG-based choropleth:

- State paths sourced from `frontend/src/lib/indiaMapPaths.ts` (static geometry)
- All project counts, financial outlays, risk tiers, and state dossiers loaded dynamically from `/api/states`
- Clicking a state opens a sidebar dossier with live data for that state
- Risk colouring is derived from the state's aggregate risk tier

---

## 12. Data Provenance

| Data source | Classification |
|---|---|
| `data/raw/projects.csv` | Synthetic — procedurally generated |
| `frontend/prisma/dev.db` | Synthetic development dataset |
| `ml-service/data/models/training_results.json` | ML evaluation artifact from training on synthetic data |
| External reference URLs (MoSPI, GatiShakti, NITI, data.gov.in) | External reference portals only |

The platform is a research and demonstration system. It does not ingest, store, or represent live government project data.

---

## 13. Local Setup

### Prerequisites

- Node.js 20+ and npm
- Python 3.10+
- Windows (PowerShell) or Linux/macOS

### Step 1 — Install frontend dependencies

```powershell
cd frontend
npm install
# This also runs `prisma generate` via the postinstall script
```

### Step 2 — Configure environment

```powershell
copy .env.example .env.local
```

Minimum required values in `.env.local`:

```
DATABASE_URL="file:./dev.db"
ML_SERVICE_URL="http://127.0.0.1:8000"
```

### Step 3 — Verify database

The `dev.db` SQLite file is included with pre-seeded development data. No migration or seed step is required to run the application.

> **Warning:** Do NOT run `prisma migrate reset` or `data-generator/seed_db.py` unless you specifically need to rebuild the database from scratch. Both operations are **destructive** and will delete all existing records.

```powershell
# Verify the database is present:
Get-Item frontend\prisma\dev.db
```

### Step 4 — Start the development server

```powershell
cd frontend
npm run dev
```

Open http://localhost:3000

### Step 5 — ML service (optional)

```powershell
cd ml-service
# Activate the virtual environment:
.venv\Scripts\Activate.ps1

# Or create a fresh environment:
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Start the FastAPI server:
uvicorn app.main:app --reload --port 8000
```

---

## 14. Environment Variables

All environment variables are configured in `frontend/.env.local` (not committed to version control):

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | `file:./dev.db` | Prisma database connection string |
| `ML_SERVICE_URL` | No | `http://127.0.0.1:8000` | FastAPI ML service base URL |
| `GEMINI_API_KEY` | No | (empty) | Gemini API key for AI Officer (optional) |
| `NODE_ENV` | No | `development` | Node environment |

The example file (`frontend/.env.example`) contains placeholder values only and is safe to commit.

---

## 15. Database Setup

### Normal operation

The `dev.db` file is pre-seeded. No action required — just run `npm run dev`.

### Rebuilding from scratch (destructive)

> **Warning:** This deletes ALL existing records. Only proceed if you specifically need to regenerate the dataset.

```powershell
# Step 1: Regenerate synthetic CSV data
cd data-generator
python generate_projects.py

# Step 2: Run the destructive seeder (DELETES ALL EXISTING RECORDS)
python seed_db.py

# Step 3: Verify record count
python -c "import sqlite3; conn = sqlite3.connect('../frontend/prisma/dev.db'); print(conn.execute('SELECT COUNT(*) FROM projects').fetchone())"
```

### Schema migrations

If you modify `frontend/prisma/schema.prisma`:

```powershell
cd frontend
npx prisma migrate dev --name <migration_name>
```

---

## 16. ML Service Setup

### Retraining models

```powershell
cd ml-service
.venv\Scripts\Activate.ps1
python -m app.pipeline.training_pipeline
```

This trains XGBoost, LightGBM, and Random Forest classifiers and regressors, builds a stacking ensemble, evaluates with 5-fold cross-validation, and saves `data/models/training_results.json`.

The analytics page reads this artifact to display benchmark results. If the artifact is missing, the analytics page shows "Artifact Missing" instead of metric values.

---

## 17. Testing and Build

### Type check

```powershell
cd frontend
npm run type-check
```

### Production build

```powershell
cd frontend
npm run build
```

### Python syntax check

```powershell
python -m compileall ml-service data-generator
```

### End-to-end test suite (requires running server)

```powershell
# Start the frontend first (npm run dev), then:
python run_50_tests.py
```

---

## 18. Repository Structure

```
SIH2/
|-- README.md                    <- This file
|-- docker-compose.yml           <- Docker wrapper for frontend container
|-- run_50_tests.py              <- End-to-end test suite (requires running server)
|-- .gitignore
|
|-- frontend/                    <- Next.js 16 application
|   |-- src/
|   |   |-- app/                 <- App Router pages and API routes
|   |   |   |-- page.tsx         <- National overview dashboard
|   |   |   |-- layout.tsx       <- Root layout
|   |   |   |-- projects/        <- Project directory + dossier pages
|   |   |   |-- analytics/       <- ML benchmark and forecasting analytics
|   |   |   |-- alerts/          <- Early warning alert console
|   |   |   |-- map/             <- Interactive India geo-map
|   |   |   |-- assistant/       <- AI Officer chat interface
|   |   |   `-- api/             <- Next.js API routes
|   |   |       |-- kpi/
|   |   |       |-- projects/
|   |   |       |-- states/
|   |   |       |-- alerts/
|   |   |       |-- analytics/
|   |   |       `-- chat/
|   |   |-- components/          <- Shared UI components
|   |   |   |-- dashboard/       <- Dashboard section components
|   |   |   |-- DataFreshnessBar.tsx
|   |   |   |-- GovHeader.tsx
|   |   |   |-- GovFooter.tsx
|   |   |   |-- TopNav.tsx
|   |   |   |-- IndiaMap.tsx
|   |   |   `-- ...
|   |   `-- lib/
|   |       |-- services/        <- Business logic service layer
|   |       |   |-- portfolioService.ts
|   |       |   |-- predictionService.ts
|   |       |   |-- priorityEngine.ts
|   |       |   |-- freshnessService.ts
|   |       |   `-- modelService.ts
|   |       |-- prisma.ts        <- Prisma client singleton
|   |       |-- types.ts         <- Shared TypeScript types
|   |       `-- indiaMapPaths.ts <- Static SVG map geometry
|   |-- prisma/
|   |   |-- schema.prisma        <- Database schema
|   |   `-- dev.db               <- SQLite database (development)
|   |-- public/                  <- Static assets
|   |-- package.json
|   |-- next.config.ts
|   `-- .env.example             <- Environment variable template
|
|-- ml-service/                  <- FastAPI ML service
|   |-- app/
|   |   |-- main.py              <- FastAPI application and inference endpoints
|   |   `-- pipeline/
|   |       |-- feature_engineering.py  <- 47+ CUF feature transformations
|   |       `-- training_pipeline.py    <- End-to-end training pipeline
|   |-- data/
|   |   `-- models/              <- Trained artifacts + training_results.json
|   |-- requirements.txt
|   `-- .venv/                   <- Python virtual environment (not committed)
|
|-- data-generator/              <- Synthetic data generation scripts
|   |-- generate_projects.py     <- Generates synthetic project CSV
|   `-- seed_db.py               <- Loads CSV into SQLite (DESTRUCTIVE)
|
|-- data/
|   `-- raw/                     <- Generated CSV files
|
`-- docs/                        <- Architecture and development documentation
    |-- README.md                <- Documentation index
    |-- architecture/            <- System architecture and ML methodology
    |-- development/             <- API documentation and build steps
    `-- product/                 <- Requirements, roadmap, and UI/UX design
```

---

## 19. Development Workflow

### Adding a new API route

1. Create `frontend/src/app/api/<route>/route.ts`
2. Use service functions from `lib/services/` for business logic
3. Avoid direct Prisma calls in API routes — delegate to the service layer

### Modifying the database schema

1. Edit `frontend/prisma/schema.prisma`
2. Run `cd frontend && npx prisma migrate dev --name <name>`
3. Update relevant TypeScript types in `lib/types.ts`

### Adding a new dashboard section

1. Create a component in `frontend/src/components/dashboard/`
2. Import and use in `frontend/src/app/page.tsx`
3. Ensure all data is passed as props from the server component — do not fetch in client components unless necessary

---

## 20. Known Limitations

| Limitation | Detail |
|---|---|
| Synthetic data | All project records are procedurally generated. Numbers do not represent actual government project data. |
| SQLite in development | SQLite does not support `DISTINCT ON` or concurrent writes at scale. A production system would use PostgreSQL. |
| ML service optional | The application works without the FastAPI service. Pre-computed predictions in `dev.db` are used. |
| AI Officer uses keyword matching | The current AI Officer uses keyword detection and Prisma queries, not a full LLM integration. Gemini integration is optional. |
| No authentication | The platform has no login or access control. |
| Model artifact required for analytics | The analytics page shows "Artifact Missing" if `training_results.json` does not exist. Run the training pipeline to generate it. |

---

## 21. Future Production Architecture

```
Load Balancer (Nginx / Cloud LB)
        |
Next.js Application (PM2 or Kubernetes)
        |
PostgreSQL (replacing SQLite)
        |
FastAPI ML Service (dedicated pods)
        |
Redis (caching KPI and freshness responses)
        |
MLflow (model registry and experiment tracking)
        |
ChromaDB (vector store for AI Officer context)
```

Changes required for production:
- Update `DATABASE_URL` to a PostgreSQL connection string
- `predictionService` would use `DISTINCT ON (project_id)` for efficient current-prediction queries
- The AI Officer would integrate with Gemini or Claude via `GEMINI_API_KEY`
- Prediction records would be served from a materialized view for performance

---

## 22. License

Open Source — built with open-source tools.

---

## 23. SIH Context

This platform was developed as part of the Smart India Hackathon (SIH) research track, exploring AI-assisted infrastructure project monitoring.

The platform is a **research and demonstration system**, not an official government tool. All data is synthetic. External reference portals (MoSPI, PM GatiShakti, NITI Aayog, data.gov.in) are linked as information references only and do not imply any official affiliation or endorsement.

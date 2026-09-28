# NIRMAAN AI — PAIMANA Predictive Infrastructure Intelligence Platform

> **SIH 2024 Submission** | Problem Statement: AI for Infrastructure Monitoring — IPMD/MoSPI PAIMANA  
> **Team:** NIRMAAN AI  
> **Platform:** PAIMANA (Project Assessment, Infrastructure Monitoring and Analytics for Nation-building)  

[![Build](https://img.shields.io/badge/build-passing-brightgreen)](.) [![Tests](https://img.shields.io/badge/tests-49%2F50-brightgreen)](.) [![ML F1](https://img.shields.io/badge/cost_overrun_F1-99.48%25-blue)](.) [![License](https://img.shields.io/badge/license-MIT-blue)](.)

---

## 🎯 What This Platform Does

NIRMAAN AI transforms India's PAIMANA infrastructure monitoring from **descriptive reporting** to **predictive and prescriptive decision-support**. It analyzes 1,931 Central Sector Infrastructure Projects (≥₹150 Crore) across 17 Ministries using a 3-model ML stacking ensemble to:

- **Predict** cost overrun probability before formal budget revision submissions
- **Forecast** schedule delay months in advance of milestone breaches
- **Score** each project with a composite 0–100 risk index
- **Alert** monitoring officers with actionable early warning signals
- **Explain** predictions using SHAP feature attribution
- **Answer** natural language queries via the AI Officer (Gemini LLM)
- **Simulate** risk for new/hypothetical projects via the What-If Predictor

---

## 📊 SIH Outcome Coverage

| Outcome | Description | Status |
|---|---|---|
| **a** | Cost Overrun Prediction Model | ✅ XGBoost + LightGBM + RF Ensemble. F1: 99.48%, AUC-ROC: 1.0 |
| **b** | Time Overrun Prediction Model | ✅ Time Ensemble F1: 91.26%. XGBoost regressor RMSE: 9.83 months |
| **c** | Project Risk Scoring Framework | ✅ 0–100 composite score. CRITICAL/HIGH/MODERATE/LOW tiers |
| **d** | Early Warning Alert System | ✅ 142 alerts. 4 alert types. Acknowledgement tracking |
| **e** | Benchmarking & Comparative Analytics | ✅ Cross-ministry scorecard. ML vs Conventional benchmark table |
| **f** | Cost Escalation Driver Analysis | ✅ SHAP decomposition. Delay reason frequency breakdown |
| **g** | AI-powered Monitoring Dashboard | ✅ Full Next.js 16 dashboard with live DB-backed KPIs |
| **h** | LLM-enabled Project Intelligence | ✅ Gemini 2.0 Flash integration with live DB context injection |
| **i** | Documentation & Deployment | ✅ Docker Compose (frontend + ML service). This README. |

**Technical Dimensions:**
- **Dim A:** 47 CUF-aligned features. XGBoost + LightGBM + RF + Stacking Meta-Learner. 5-fold Stratified CV.
- **Dim B:** Rule-based baseline F1: 79.67% → Ensemble F1: 99.48% (+24.9% relative gain)
- **Dim C:** CUF vs External feature taxonomy. Policy recommendations for 4 schema enhancements.

---

## 🏗 System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         Web Browser                              │
└────────────────────────┬─────────────────────────────────────────┘
                         │ HTTP
┌────────────────────────▼─────────────────────────────────────────┐
│              Next.js 16 Application (Port 3000)                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Pages: / | /projects | /map | /alerts | /analytics      │    │
│  │          /assistant | /predict | /projects/[id]           │    │
│  └──────────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  API Routes: /api/kpi | /api/projects | /api/states       │    │
│  │              /api/alerts | /api/analytics | /api/chat     │    │
│  │              /api/predict                                  │    │
│  └──────────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Services: portfolioService | predictionService           │    │
│  │            priorityEngine | freshnessService | modelService│   │
│  └──────────────────────────────────────────────────────────┘    │
│                    │ Prisma ORM                │ HTTP             │
└────────────────────┼───────────────────────────┼─────────────────┘
                     │                           │
          ┌──────────▼────────┐    ┌─────────────▼───────────┐
          │   SQLite dev.db   │    │  FastAPI ML Service      │
          │  • 1,931 Projects │    │  (Port 8000 — Optional)  │
          │  • 1,931 Preds    │    │  • 10 trained models     │
          │  • 142 Alerts     │    │  • SHAP TreeExplainer    │
          └───────────────────┘    │  • Optuna HPO            │
                                   └─────────────────────────┘
                                              │ External API
                                   ┌──────────▼──────────────┐
                                   │   Gemini 2.0 Flash API  │
                                   │   (GEMINI_API_KEY req.)  │
                                   └─────────────────────────┘
```

---

## 🤖 ML Architecture

```
Raw Projects CSV (1,959 records, 47 CUF-derived features)
         │
Feature Engineering (FeatureEngineer class)
  ├─ Basic Derived Features (12): cost ratio, delay months, progress lag
  ├─ Statistical Aggregation Features (10): sector/ministry/agency baselines
  ├─ Temporal/Lag Features (15): snapshot velocity, acceleration rates
  └─ Interaction Features (10): compound risk indicators
         │
5-Fold Stratified Cross-Validation
         │
  ┌──────┼──────┬─────────────┐
  │      │      │             │
XGBoost LightGBM Random Forest Baseline Models
  │      │      │             (Logistic Reg, Decision Tree, Rule-based)
  └──────┴──────┘
         │
Stacking Meta-Learner (Logistic Regression)
         │
  ┌──────┴──────────┐
  │                 │
Cost Overrun     Time Overrun
F1: 99.48%       F1: 91.26%
AUC: 1.000       AUC: 0.979
         │
SHAP TreeExplainer → top_risk_factors per prediction
         │
training_results.json (model evaluation artifact)
```

---

## 📁 Repository Structure

```
PAIMAANA/
├── README.md                          # This file
├── docker-compose.yml                 # Full stack deployment
├── run_50_tests.py                    # End-to-end test suite (49/50 pass)
│
├── data/
│   └── raw/
│       ├── projects.csv               # 1,959 synthetic projects
│       ├── project_snapshots.csv      # 52,421 monthly snapshots
│       ├── project_milestones.csv     # Milestone achievement records
│       └── data_summary.json
│
├── data-generator/
│   ├── generate_projects.py           # Synthetic data generator
│   └── seed_db.py                     # Database seeder (DESTRUCTIVE)
│
├── ml-service/
│   ├── Dockerfile                     # ML service container
│   ├── requirements.txt               # Python dependencies
│   ├── app/
│   │   ├── main.py                    # FastAPI endpoints
│   │   └── pipeline/
│   │       ├── feature_engineering.py # 47-feature FeatureEngineer
│   │       └── training_pipeline.py   # ModelTrainer (XGBoost+LGB+RF)
│   └── data/models/
│       ├── training_results.json      # Model evaluation artifact
│       ├── cost_overrun_xgboost.pkl
│       ├── cost_overrun_lightgbm.pkl
│       ├── cost_overrun_rf.pkl
│       ├── cost_overrun_meta_learner.pkl
│       ├── time_overrun_xgboost.pkl
│       └── ... (10 model files total)
│
└── frontend/
    ├── .env.local                     # Environment configuration
    ├── prisma/
    │   ├── schema.prisma              # DB schema: Project, Prediction, Alert
    │   └── dev.db                     # SQLite database (seeded)
    └── src/
        ├── app/
        │   ├── page.tsx               # / — National Portfolio Console
        │   ├── projects/              # /projects — Directory + /projects/[id]
        │   ├── map/                   # /map — India Geo-Spatial Explorer
        │   ├── analytics/             # /analytics — ML Benchmarks + CUF
        │   ├── alerts/                # /alerts — Early Warning Console
        │   ├── assistant/             # /assistant — AI Officer (Gemini LLM)
        │   ├── predict/               # /predict — What-If Risk Predictor
        │   └── api/                   # All API routes
        ├── components/
        │   ├── Sidebar.tsx
        │   ├── IndiaMap.tsx           # SVG choropleth (36 states)
        │   ├── dashboard/             # Dashboard component modules
        │   └── ...
        └── lib/
            ├── services/
            │   ├── portfolioService.ts
            │   ├── predictionService.ts
            │   ├── priorityEngine.ts  # 5-factor composite scoring
            │   ├── freshnessService.ts
            │   └── modelService.ts
            └── types.ts
```

---

## 🚀 Local Setup (Windows PowerShell)

### Prerequisites
- Node.js 20+ and npm
- Python 3.10+

### Step 1 — Install Frontend Dependencies
```powershell
cd frontend
npm install
# This also runs `prisma generate` via postinstall
```

### Step 2 — Configure Environment
```powershell
# Create .env.local in frontend/ with:
DATABASE_URL="file:./dev.db"
ML_SERVICE_URL="http://127.0.0.1:8000"
GEMINI_API_KEY="your-gemini-api-key-here"  # Optional, enables LLM responses
```

### Step 3 — Initialize Database
```powershell
# Schema is pre-seeded. If dev.db is missing, run:
cd frontend
npx prisma db push
cd ..
python data-generator/seed_db.py
```

> ⚠️ **Warning:** `seed_db.py` is DESTRUCTIVE — it wipes all existing data.

### Step 4 — Start Frontend (Primary Service)
```powershell
cd frontend
npm run dev
```
Open: http://localhost:3000

### Step 5 — Start ML Service (Optional, for live inference)
```powershell
cd ml-service
python -m uvicorn app.main:app --reload --port 8000
```
Swagger UI: http://127.0.0.1:8000/docs

### Step 6 — Verify with Test Suite
```powershell
# With both services running:
python run_50_tests.py
# Expected: 49/50 PASS
```

---

## 🐳 Docker Deployment

```powershell
# Build and run full stack:
docker-compose up --build

# With Gemini API key:
$env:GEMINI_API_KEY="your-key"; docker-compose up --build
```

Services:
- Frontend: http://localhost:3000
- ML Service: http://localhost:8000

---

## 🔧 API Reference

### Frontend API Routes (Next.js)

| Endpoint | Method | Description |
|---|---|---|
| `/api/kpi` | GET | National portfolio KPIs (18 metrics) |
| `/api/projects` | GET | Paginated project list with filters |
| `/api/projects/[id]` | GET | Single project dossier with predictions |
| `/api/states` | GET | State-level aggregations (31 states) |
| `/api/alerts` | GET | Early warning alerts with severity filter |
| `/api/analytics` | GET | ML benchmark + sector/ministry stats |
| `/api/chat` | POST | AI Officer (Gemini LLM + DB context) |
| `/api/predict` | POST | What-If prediction proxy to ML service |

### ML Service API Routes (FastAPI)

| Endpoint | Method | Description |
|---|---|---|
| `/ml/health` | GET | Service health + loaded models list |
| `/ml/predict` | POST | Predict risk for existing project by ID |
| `/ml/predict/custom` | POST | Predict risk for new/hypothetical project |
| `/docs` | GET | Swagger UI with all endpoint schemas |

---

## 🌡 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | **Yes** | Prisma SQLite connection: `file:./dev.db` |
| `ML_SERVICE_URL` | No | FastAPI service URL (default: `http://127.0.0.1:8000`) |
| `GEMINI_API_KEY` | No | Enables Gemini 2.0 Flash LLM responses in AI Officer |
| `NODE_ENV` | No | `development` or `production` |

---

## 🧠 Retrain ML Models

```powershell
cd ml-service
python -c "from app.pipeline.training_pipeline import ModelTrainer; ModelTrainer().run_pipeline()"
```

This retrains all 10 models with Optuna hyperparameter optimization (50 trials each) and updates `training_results.json`.

---

## ⚠️ Data Provenance

| Data | Classification |
|---|---|
| `data/raw/projects.csv` | **Synthetic** — procedurally generated to mirror PAIMANA CUF schema |
| `frontend/prisma/dev.db` | **Synthetic** — seeded from CSV |
| `ml-service/data/models/*.pkl` | Model artifacts trained on synthetic data |

This is a research and demonstration platform. It does not ingest, store, or represent live government project records.

---

## 📚 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript, TailwindCSS, Framer Motion |
| **Database** | Prisma ORM, SQLite (dev), compatible with PostgreSQL (prod) |
| **ML/AI** | Python 3.11, XGBoost, LightGBM, scikit-learn, SHAP, Optuna |
| **API** | FastAPI, Uvicorn, Pydantic |
| **LLM** | Google Gemini 2.0 Flash (optional) |
| **Charts** | Recharts, D3.js, SVG |
| **Deployment** | Docker, Docker Compose |

---

## 🏆 SIH 2024 Alignment

> **Problem Statement PS-Code:** IPMD/MoSPI — AI for Infrastructure Monitoring  
> **Theme:** Smart Automation  
> **Organisation:** Ministry of Statistics and Programme Implementation  

The solution directly addresses all 3 technical dimensions (a, b, c) and all 9 expected outcomes (a–i) of the problem statement using open-source tools exclusively (Python, Node.js, SQLite, XGBoost, LightGBM, scikit-learn, FastAPI, Next.js, Prisma).

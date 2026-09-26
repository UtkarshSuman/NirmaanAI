# PAIMANA AI — Project Architecture

> **System Architecture Document**
> AI-Powered Predictive Analytics & Early Warning System for Infrastructure Project Monitoring

---

## 1. High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PAIMANA AI — System Architecture                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                        PRESENTATION LAYER (Next.js)                      │   │
│  │  ┌─────────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────────────┐  │   │
│  │  │  Dashboard   │ │  Analytics   │ │  Alerts    │ │  LLM Assistant   │  │   │
│  │  │  Module      │ │  Module      │ │  Console   │ │  (Chat UI)       │  │   │
│  │  └─────────────┘ └──────────────┘ └────────────┘ └──────────────────┘  │   │
│  │  ┌─────────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────────────┐  │   │
│  │  │  Risk        │ │  Project     │ │  Sector    │ │  Benchmarking    │  │   │
│  │  │  Heatmap     │ │  Detail      │ │  Drill-down│ │  Module          │  │   │
│  │  └─────────────┘ └──────────────┘ └────────────┘ └──────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                        │
│                                   [REST API]                                    │
│                                        │                                        │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                    APPLICATION LAYER (Next.js API + FastAPI)              │   │
│  │  ┌────────────────────────────┐  ┌──────────────────────────────────┐   │   │
│  │  │    Next.js API Routes      │  │       FastAPI ML Service         │   │   │
│  │  │  ┌──────────────────────┐  │  │  ┌────────────────────────────┐ │   │   │
│  │  │  │ Project CRUD API     │  │  │  │ Prediction Endpoints       │ │   │   │
│  │  │  │ Dashboard Aggregation│  │  │  │ Model Training Pipeline    │ │   │   │
│  │  │  │ Alert Management     │  │  │  │ SHAP Explainability API    │ │   │   │
│  │  │  │ User/Auth API        │  │  │  │ Benchmarking Engine        │ │   │   │
│  │  │  │ Data Upload API      │  │  │  │ LLM/RAG Pipeline           │ │   │   │
│  │  │  └──────────────────────┘  │  │  └────────────────────────────┘ │   │   │
│  │  └────────────────────────────┘  └──────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                        │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          DATA & ML LAYER                                 │   │
│  │  ┌──────────────┐ ┌────────────┐ ┌───────────┐ ┌────────────────────┐  │   │
│  │  │  PostgreSQL   │ │  Redis     │ │  MLflow   │ │  Vector Store      │  │   │
│  │  │  (Projects,   │ │  (Cache,   │ │  (Model   │ │  (ChromaDB for     │  │   │
│  │  │   History,    │ │   Alerts,  │ │   Registry,│ │   LLM embeddings) │  │   │
│  │  │   Users)      │ │   Queue)   │ │   Metrics) │ │                    │  │   │
│  │  └──────────────┘ └────────────┘ └───────────┘ └────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                       ML MODEL PIPELINE                                  │   │
│  │  ┌────────┐  ┌──────────┐  ┌───────────┐  ┌─────────┐  ┌───────────┐  │   │
│  │  │ Data   │→ │ Feature  │→ │  Model    │→ │ Ensemble│→ │ Prediction│  │   │
│  │  │ Ingest │  │ Engineer │  │  Training │  │ Scorer  │  │ API       │  │   │
│  │  └────────┘  └──────────┘  └───────────┘  └─────────┘  └───────────┘  │   │
│  │       ↓            ↓             ↓              ↓             ↓        │   │
│  │  ┌────────┐  ┌──────────┐  ┌───────────┐  ┌─────────┐  ┌───────────┐  │   │
│  │  │ CUF    │  │ 47+      │  │ XGBoost   │  │ Weighted│  │ SHAP      │  │   │
│  │  │ Parser │  │ Engineered│  │ LightGBM  │  │ Voting  │  │ Explain-  │  │   │
│  │  │        │  │ Features │  │ RF, LSTM  │  │ Stacking│  │ ability   │  │   │
│  │  └────────┘  └──────────┘  └───────────┘  └─────────┘  └───────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
paimana-ai/
├── frontend/                          # Next.js Application
│   ├── public/
│   │   ├── assets/
│   │   │   ├── icons/
│   │   │   ├── images/
│   │   │   └── india-geojson/         # GeoJSON for India map
│   │   └── fonts/
│   ├── src/
│   │   ├── app/                       # Next.js App Router
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── layout.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── page.tsx           # National Overview Dashboard
│   │   │   │   ├── analytics/
│   │   │   │   │   ├── page.tsx       # Analytics Overview
│   │   │   │   │   ├── cost-overrun/
│   │   │   │   │   ├── time-overrun/
│   │   │   │   │   └── benchmarking/
│   │   │   │   ├── projects/
│   │   │   │   │   ├── page.tsx       # Project List
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx   # Project Detail
│   │   │   │   ├── sectors/
│   │   │   │   │   ├── page.tsx       # Sector Overview
│   │   │   │   │   └── [sector]/
│   │   │   │   │       └── page.tsx   # Sector Detail
│   │   │   │   ├── alerts/
│   │   │   │   │   └── page.tsx       # Early Warning Console
│   │   │   │   ├── risk-map/
│   │   │   │   │   └── page.tsx       # Risk Heatmap
│   │   │   │   ├── assistant/
│   │   │   │   │   └── page.tsx       # LLM Chat Assistant
│   │   │   │   ├── reports/
│   │   │   │   │   └── page.tsx       # Report Generator
│   │   │   │   └── layout.tsx         # Dashboard Layout (sidebar, nav)
│   │   │   ├── api/                   # Next.js API Routes
│   │   │   │   ├── projects/
│   │   │   │   ├── analytics/
│   │   │   │   ├── alerts/
│   │   │   │   ├── predictions/
│   │   │   │   ├── assistant/
│   │   │   │   └── auth/
│   │   │   ├── layout.tsx             # Root Layout
│   │   │   ├── page.tsx               # Landing Page
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/                    # Base UI Components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── Skeleton.tsx
│   │   │   │   └── ...
│   │   │   ├── charts/                # Visualization Components
│   │   │   │   ├── CostOverrunChart.tsx
│   │   │   │   ├── TimeOverrunChart.tsx
│   │   │   │   ├── RiskGaugeChart.tsx
│   │   │   │   ├── SectorDistribution.tsx
│   │   │   │   ├── ExpenditureTrend.tsx
│   │   │   │   ├── MilestoneTracker.tsx
│   │   │   │   ├── IndiaRiskMap.tsx
│   │   │   │   └── SHAPWaterfallChart.tsx
│   │   │   ├── dashboard/             # Dashboard-specific Components
│   │   │   │   ├── KPICard.tsx
│   │   │   │   ├── ProjectTable.tsx
│   │   │   │   ├── AlertFeed.tsx
│   │   │   │   ├── SectorSummary.tsx
│   │   │   │   └── RiskDistribution.tsx
│   │   │   ├── assistant/             # LLM Assistant Components
│   │   │   │   ├── ChatWindow.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   └── SuggestedQueries.tsx
│   │   │   └── layout/                # Layout Components
│   │   │       ├── Sidebar.tsx
│   │   │       ├── TopNav.tsx
│   │   │       ├── Breadcrumb.tsx
│   │   │       └── Footer.tsx
│   │   ├── hooks/                     # Custom Hooks
│   │   │   ├── useProjects.ts
│   │   │   ├── usePredictions.ts
│   │   │   ├── useAlerts.ts
│   │   │   └── useAnalytics.ts
│   │   ├── lib/                       # Utilities
│   │   │   ├── api.ts                 # API client
│   │   │   ├── constants.ts
│   │   │   ├── utils.ts
│   │   │   └── formatters.ts
│   │   ├── store/                     # Zustand State Management
│   │   │   ├── projectStore.ts
│   │   │   ├── alertStore.ts
│   │   │   └── filterStore.ts
│   │   └── types/                     # TypeScript Types
│   │       ├── project.ts
│   │       ├── prediction.ts
│   │       ├── alert.ts
│   │       └── analytics.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── next.config.ts
│   ├── tailwind.config.ts             # If using Tailwind (optional)
│   ├── tsconfig.json
│   └── package.json
│
├── ml-service/                        # FastAPI ML Service
│   ├── app/
│   │   ├── main.py                    # FastAPI entry point
│   │   ├── config.py                  # Configuration
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes/
│   │   │   │   ├── predictions.py     # Prediction endpoints
│   │   │   │   ├── training.py        # Model training endpoints
│   │   │   │   ├── explainability.py  # SHAP/feature importance
│   │   │   │   ├── benchmarking.py    # Benchmarking analytics
│   │   │   │   └── assistant.py       # LLM assistant endpoints
│   │   │   └── dependencies.py
│   │   ├── models/                    # ML Model Definitions
│   │   │   ├── __init__.py
│   │   │   ├── cost_overrun_model.py
│   │   │   ├── time_overrun_model.py
│   │   │   ├── risk_scoring_model.py
│   │   │   ├── ensemble_model.py
│   │   │   └── lstm_forecaster.py
│   │   ├── pipeline/                  # Data & Training Pipeline
│   │   │   ├── __init__.py
│   │   │   ├── data_ingestion.py
│   │   │   ├── feature_engineering.py
│   │   │   ├── preprocessing.py
│   │   │   ├── training_pipeline.py
│   │   │   └── evaluation.py
│   │   ├── services/                  # Business Logic
│   │   │   ├── __init__.py
│   │   │   ├── prediction_service.py
│   │   │   ├── alert_service.py
│   │   │   ├── benchmark_service.py
│   │   │   └── llm_service.py
│   │   ├── llm/                       # LLM & RAG Pipeline
│   │   │   ├── __init__.py
│   │   │   ├── rag_pipeline.py
│   │   │   ├── embeddings.py
│   │   │   ├── prompts.py
│   │   │   └── chains.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── data_validator.py
│   │       └── helpers.py
│   ├── data/
│   │   ├── raw/                       # Raw synthetic data
│   │   ├── processed/                 # Processed features
│   │   └── models/                    # Saved model artifacts
│   ├── notebooks/                     # Jupyter Notebooks (EDA, experiments)
│   │   ├── 01_data_exploration.ipynb
│   │   ├── 02_feature_engineering.ipynb
│   │   ├── 03_model_training.ipynb
│   │   ├── 04_model_evaluation.ipynb
│   │   └── 05_shap_analysis.ipynb
│   ├── tests/
│   │   ├── test_predictions.py
│   │   ├── test_pipeline.py
│   │   └── test_api.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── pyproject.toml
│
├── data-generator/                    # Synthetic Data Generation
│   ├── generate_projects.py           # Main data generator
│   ├── sector_distributions.py        # Sector-specific distributions
│   ├── agency_database.py             # Agency name database
│   └── README.md
│
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── nginx/
│   │   └── nginx.conf
│   └── postgres/
│       └── init.sql
│
├── docs/
│   ├── REQUIREMENTS.md                # This file
│   ├── PROJECTARCHITECTURE.md         # Architecture document
│   ├── BUILDINGSTEPS.md               # Step-by-step build guide
│   ├── PROJECTPHASE.md                # Phase tracking
│   ├── API_DOCUMENTATION.md           # API specs
│   └── ML_MODEL_DOCUMENTATION.md      # ML model details
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 3. Component Architecture

### 3.1 Frontend Architecture (Next.js App Router)

```
┌─────────────────────────────────────────────────────┐
│                   Root Layout                        │
│  ┌───────────────────────────────────────────────┐  │
│  │              Dashboard Layout                  │  │
│  │  ┌────────┐  ┌─────────────────────────────┐  │  │
│  │  │Sidebar │  │      Main Content Area       │  │  │
│  │  │        │  │  ┌─────────────────────────┐ │  │  │
│  │  │ • Home │  │  │     TopNav + Breadcrumb │ │  │  │
│  │  │ • Anlys│  │  ├─────────────────────────┤ │  │  │
│  │  │ • Prjts│  │  │                         │ │  │  │
│  │  │ • Sctrs│  │  │     Page Content         │ │  │  │
│  │  │ • Alert│  │  │     (Server/Client       │ │  │  │
│  │  │ • Map  │  │  │      Components)         │ │  │  │
│  │  │ • Chat │  │  │                         │ │  │  │
│  │  │ • Rprts│  │  │                         │ │  │  │
│  │  │        │  │  └─────────────────────────┘ │  │  │
│  │  └────────┘  └─────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Rendering Strategy:**
- **Server Components (RSC)**: Dashboard aggregations, project lists, sector overviews (data-heavy, SEO-friendly)
- **Client Components**: Charts, interactive filters, real-time alerts, chat interface, maps
- **Streaming SSR**: Dashboard page with `Suspense` boundaries for progressive loading

### 3.2 ML Model Architecture

```
                        ┌──────────────────────────────┐
                        │     ENSEMBLE PREDICTOR        │
                        │  (Weighted Voting/Stacking)   │
                        └──────────┬───────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                     │
    ┌─────────▼────────┐  ┌───────▼──────────┐  ┌──────▼────────────┐
    │   COST OVERRUN    │  │  TIME OVERRUN     │  │   RISK SCORING    │
    │   PREDICTOR       │  │  PREDICTOR        │  │   FRAMEWORK       │
    └──────┬───────────┘  └──────┬───────────┘  └──────┬────────────┘
           │                      │                      │
    ┌──────▼──────┐       ┌──────▼──────┐       ┌──────▼──────┐
    │  XGBoost    │       │  XGBoost    │       │  Weighted   │
    │  LightGBM   │       │  LightGBM   │       │  Composite  │
    │  Random     │       │  Random     │       │  Score      │
    │  Forest     │       │  Forest     │       │  (0-100)    │
    │  LSTM       │       │  LSTM       │       │             │
    └─────────────┘       └─────────────┘       └─────────────┘

    Features Used:                               Risk Components:
    ┌─────────────────────────┐                  ┌────────────────────┐
    │ • cost_ratio            │                  │ • Cost Risk (30%)  │
    │ • expenditure_rate      │                  │ • Time Risk (30%)  │
    │ • duration_ratio        │                  │ • Milestone Risk   │
    │ • physical_progress     │                  │   (20%)            │
    │ • financial_progress    │                  │ • Sector Risk      │
    │ • milestone_completion  │                  │   (10%)            │
    │ • sector_avg_overrun    │                  │ • Agency Risk      │
    │ • agency_track_record   │                  │   (10%)            │
    │ • project_age           │                  └────────────────────┘
    │ • revision_frequency    │
    │ • lag_features (t-1..t-6)│
    └─────────────────────────┘
```

### 3.3 Feature Engineering Pipeline

```
Raw CUF Data → ┌─────────────────────────────────────────────┐
               │           FEATURE ENGINEERING                │
               │                                              │
               │  ┌──────────────────────────────────────┐   │
               │  │ Basic Derived Features               │   │
               │  │ • cost_overrun_ratio = revised/orig  │   │
               │  │ • expenditure_rate = exp/elapsed_time│   │
               │  │ • physical_financial_gap             │   │
               │  │ • milestone_completion_rate          │   │
               │  │ • project_age_months                 │   │
               │  │ • remaining_budget_ratio             │   │
               │  └──────────────────────────────────────┘   │
               │                                              │
               │  ┌──────────────────────────────────────┐   │
               │  │ Statistical Aggregation Features     │   │
               │  │ • sector_avg_cost_overrun            │   │
               │  │ • ministry_avg_delay_months          │   │
               │  │ • agency_historical_performance      │   │
               │  │ • state_project_success_rate         │   │
               │  │ • sector_completion_benchmark        │   │
               │  └──────────────────────────────────────┘   │
               │                                              │
               │  ┌──────────────────────────────────────┐   │
               │  │ Temporal / Lag Features               │   │
               │  │ • expenditure_growth_rate_3m         │   │
               │  │ • progress_velocity_6m               │   │
               │  │ • cost_revision_acceleration         │   │
               │  │ • milestone_achievement_trend        │   │
               │  │ • seasonal_expenditure_pattern       │   │
               │  └──────────────────────────────────────┘   │
               │                                              │
               │  ┌──────────────────────────────────────┐   │
               │  │ Interaction Features                 │   │
               │  │ • sector × project_size              │   │
               │  │ • agency_type × cost_category        │   │
               │  │ • state × sector performance         │   │
               │  └──────────────────────────────────────┘   │
               └──────────────────────────────────────────────┘
                                    │
                                    ▼
                          47+ Engineered Features
```

### 3.4 LLM/RAG Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    LLM INTELLIGENCE ASSISTANT                 │
│                                                              │
│  User Query: "Which railway projects are at highest risk?"   │
│                          │                                    │
│                    ┌─────▼─────┐                             │
│                    │  LangChain │                             │
│                    │  Router    │                             │
│                    └─────┬─────┘                             │
│              ┌───────────┼───────────┐                       │
│              │           │           │                       │
│     ┌────────▼──┐  ┌─────▼────┐ ┌───▼──────────┐           │
│     │  SQL Agent │  │ RAG      │ │ Analytics    │           │
│     │  (Direct   │  │ Pipeline │ │ Agent        │           │
│     │   DB Query)│  │ (Vector  │ │ (Run ML      │           │
│     │           │  │  Search) │ │  predictions)│           │
│     └────────┬──┘  └─────┬────┘ └───┬──────────┘           │
│              │           │           │                       │
│              └───────────┼───────────┘                       │
│                    ┌─────▼─────┐                             │
│                    │  Response  │                             │
│                    │  Generator │                             │
│                    │  (LLM)    │                             │
│                    └─────┬─────┘                             │
│                          │                                    │
│  Response: "Based on analysis, 3 railway projects show..."   │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema (PostgreSQL)

```sql
-- Core Tables
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id VARCHAR(20) UNIQUE NOT NULL,
    project_name TEXT NOT NULL,
    ministry_department VARCHAR(200) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    sub_sector VARCHAR(100),
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    implementing_agency VARCHAR(300) NOT NULL,
    
    -- Financial
    original_cost_crore DECIMAL(12,2) NOT NULL,
    revised_cost_crore DECIMAL(12,2),
    anticipated_cost_crore DECIMAL(12,2),
    cumulative_expenditure_crore DECIMAL(12,2),
    expenditure_current_year_crore DECIMAL(12,2),
    expenditure_previous_year_crore DECIMAL(12,2),
    land_acquisition_cost_crore DECIMAL(12,2),
    
    -- Timeline
    original_start_date DATE,
    original_completion_date DATE,
    revised_completion_date DATE,
    anticipated_completion_date DATE,
    year_of_approval INTEGER,
    
    -- Progress
    physical_progress_percent DECIMAL(5,2),
    financial_progress_percent DECIMAL(5,2),
    milestone_achieved_count INTEGER DEFAULT 0,
    milestone_total_count INTEGER DEFAULT 0,
    
    -- Status
    project_status VARCHAR(30) NOT NULL DEFAULT 'Under Implementation',
    cost_overrun_percent DECIMAL(8,2) DEFAULT 0,
    time_overrun_months INTEGER DEFAULT 0,
    reason_for_delay TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_cuf_update DATE
);

-- Historical Snapshots (Monthly)
CREATE TABLE project_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id VARCHAR(20) REFERENCES projects(project_id),
    snapshot_date DATE NOT NULL,
    revised_cost_crore DECIMAL(12,2),
    cumulative_expenditure_crore DECIMAL(12,2),
    physical_progress_percent DECIMAL(5,2),
    financial_progress_percent DECIMAL(5,2),
    milestone_achieved_count INTEGER,
    project_status VARCHAR(30),
    cost_overrun_percent DECIMAL(8,2),
    time_overrun_months INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Predictions
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id VARCHAR(20) REFERENCES projects(project_id),
    prediction_date TIMESTAMP DEFAULT NOW(),
    model_version VARCHAR(50),
    
    -- Cost Overrun Prediction
    predicted_cost_overrun_percent DECIMAL(8,2),
    cost_overrun_probability DECIMAL(5,4),
    cost_overrun_confidence VARCHAR(10),
    
    -- Time Overrun Prediction
    predicted_time_overrun_months INTEGER,
    time_overrun_probability DECIMAL(5,4),
    time_overrun_confidence VARCHAR(10),
    
    -- Risk Score
    risk_score DECIMAL(5,2),
    risk_category VARCHAR(20),
    
    -- Explainability
    top_risk_factors JSONB,
    shap_values JSONB,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id VARCHAR(20) REFERENCES projects(project_id),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    risk_score DECIMAL(5,2),
    recommended_action TEXT,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID,
    acknowledged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Model Registry
CREATE TABLE model_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    model_type VARCHAR(50),
    metrics JSONB,
    parameters JSONB,
    artifact_path TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    trained_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'viewer',
    ministry_scope VARCHAR(200),
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. API Architecture

### 5.1 Next.js API Routes (Data & Dashboard)

| Method | Endpoint | Purpose |
|--------|---------|---------|
| GET | `/api/projects` | List projects with filtering, sorting, pagination |
| GET | `/api/projects/:id` | Get single project with predictions |
| POST | `/api/projects/upload` | Upload CUF data (CSV/Excel) |
| GET | `/api/dashboard/overview` | National overview KPIs |
| GET | `/api/dashboard/sector-summary` | Sector-wise aggregations |
| GET | `/api/alerts` | List alerts with severity filtering |
| PATCH | `/api/alerts/:id/acknowledge` | Acknowledge an alert |
| GET | `/api/analytics/cost-overrun` | Cost overrun analytics data |
| GET | `/api/analytics/time-overrun` | Time overrun analytics data |
| GET | `/api/analytics/benchmarking` | Benchmarking comparisons |

### 5.2 FastAPI Endpoints (ML Service)

| Method | Endpoint | Purpose |
|--------|---------|---------|
| POST | `/ml/predict` | Generate predictions for a project |
| POST | `/ml/predict/batch` | Batch prediction for all projects |
| POST | `/ml/train` | Trigger model training pipeline |
| GET | `/ml/explain/:project_id` | Get SHAP explainability for a prediction |
| GET | `/ml/feature-importance` | Global feature importance rankings |
| GET | `/ml/model-metrics` | Current model performance metrics |
| POST | `/ml/benchmark` | Run benchmarking analysis |
| POST | `/ml/assistant/chat` | LLM assistant conversation |
| GET | `/ml/risk-scores` | Get risk scores for all projects |

---

## 6. Data Flow Architecture

```
┌───────────┐     ┌──────────────┐     ┌────────────────┐     ┌────────────┐
│  CSV/Excel │ ──→ │  Upload API   │ ──→ │  Data Validator │ ──→ │ PostgreSQL │
│  (CUF Data)│     │  (Next.js)   │     │  & Normalizer  │     │  (Store)   │
└───────────┘     └──────────────┘     └────────────────┘     └─────┬──────┘
                                                                      │
                                           ┌──────────────────────────┘
                                           │
                                    ┌──────▼──────┐
                                    │   Feature    │
                                    │  Engineering │
                                    │  Pipeline    │
                                    └──────┬──────┘
                                           │
                                    ┌──────▼──────┐
                                    │   ML Model   │
                                    │  Inference   │
                                    └──────┬──────┘
                                           │
                        ┌──────────────────┼──────────────────┐
                        │                  │                   │
                 ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
                 │ Predictions  │   │ Risk Scores  │   │   Alerts    │
                 │ Table        │   │ Update       │   │ Generator   │
                 └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
                        │                  │                  │
                        └──────────────────┼──────────────────┘
                                           │
                                    ┌──────▼──────┐
                                    │  Dashboard   │
                                    │  (Next.js)   │
                                    │  Real-time   │
                                    └─────────────┘
```

---

## 7. Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Docker Compose                           │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Nginx     │  │  Next.js   │  │  FastAPI   │            │
│  │  :80/:443  │→ │  :3000     │  │  :8000     │            │
│  │  (Reverse  │  │  (Frontend │  │  (ML       │            │
│  │   Proxy)   │  │   + API)   │  │   Service) │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ PostgreSQL │  │  Redis     │  │  MLflow    │            │
│  │  :5432     │  │  :6379     │  │  :5001     │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                              │
│  ┌────────────┐                                             │
│  │  ChromaDB  │                                             │
│  │  :8001     │                                             │
│  └────────────┘                                             │
└──────────────────────────────────────────────────────────────┘
```

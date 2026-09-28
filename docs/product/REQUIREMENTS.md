# PAIMANA AI — Requirements Specification

> **AI-Powered Predictive Analytics & Early Warning System for Infrastructure Project Monitoring**
> SIH Problem Statement: Web-based Integrated Project-Monitoring Platform

---

## 1. Functional Requirements

### 1.1 Core Prediction & Analytics Engine

| ID | Requirement | Priority | Module |
|----|------------|----------|--------|
| FR-01 | **Cost Overrun Prediction Model** — Predict whether a project will exceed its approved cost, and by how much (%), using historical CUF fields (approved cost, revised cost, expenditure, sector, agency, state, timelines). | P0 | ML Engine |
| FR-02 | **Time Overrun Prediction Model** — Predict whether a project will be delayed beyond its scheduled completion date, and estimate the delay duration (months). | P0 | ML Engine |
| FR-03 | **Project Risk Scoring Framework** — Generate a composite risk score (0–100) for each project combining cost risk, time risk, milestone risk, and sector-specific risk factors. | P0 | ML Engine |
| FR-04 | **Early Warning Alert System** — Trigger automated alerts when a project's risk score crosses configurable thresholds (e.g., Yellow > 40, Orange > 60, Red > 80). | P0 | Alert System |
| FR-05 | **Cost Escalation Driver Analysis** — Identify and rank the top contributing factors driving cost escalation for individual projects and across sectors using SHAP/LIME explainability. | P1 | Explainability |
| FR-06 | **Benchmarking & Comparative Analytics** — Compare project performance against sector averages, historical baselines, and peer projects to identify outliers. | P1 | Analytics |
| FR-07 | **LLM-Enabled Project Intelligence Assistant** — Natural language interface for querying project data, generating summaries, and getting AI-driven recommendations. | P1 | LLM Assistant |

### 1.2 Data Management

| ID | Requirement | Priority |
|----|------------|----------|
| FR-08 | Ingest and normalize project data from CSV/Excel uploads (simulating PAIMANA CUF data). | P0 |
| FR-09 | Support monthly data refresh cycles with version tracking. | P1 |
| FR-10 | Maintain a synthetic/augmented dataset of ~2000 projects across 22 sectors and 17 ministries matching PAIMANA specifications. | P0 |
| FR-11 | Store historical snapshots for time-series analysis and trend detection. | P1 |

### 1.3 Dashboard & Visualization

| ID | Requirement | Priority |
|----|------------|----------|
| FR-12 | **National Overview Dashboard** — Aggregate metrics: total projects, total cost, total expenditure, overrun statistics, sector distribution. | P0 |
| FR-13 | **Sector-wise Analytics** — Drill-down views per sector with cost/time overrun trends, risk distribution, and comparative KPIs. | P0 |
| FR-14 | **Project Detail View** — Individual project page with predicted risk, historical trend, milestone tracker, and AI-generated narrative summary. | P0 |
| FR-15 | **Risk Heatmap** — Geographic/sector heatmap showing risk concentration across India. | P1 |
| FR-16 | **Early Warning Console** — Real-time alert feed with severity levels, affected projects, and recommended actions. | P0 |
| FR-17 | **Trend Analysis Charts** — Time-series visualizations of cost escalation, expenditure burn rate, and milestone achievement rates. | P1 |

### 1.4 User & Access Management

| ID | Requirement | Priority |
|----|------------|----------|
| FR-18 | Role-based access control (Admin, Analyst, Viewer). | P1 |
| FR-19 | Ministry/Department-level data scoping. | P2 |

---

## 2. Non-Functional Requirements

| ID | Requirement | Category |
|----|------------|----------|
| NFR-01 | Response time < 2s for dashboard loads, < 5s for prediction queries. | Performance |
| NFR-02 | Support concurrent usage by 50+ users. | Scalability |
| NFR-03 | All ML models must provide explainability (SHAP values, feature importance). | Transparency |
| NFR-04 | System must use **only open-source tools and software**. | Compliance |
| NFR-05 | Responsive design supporting desktop (1920x1080) and tablet (1024x768). | Usability |
| NFR-06 | API-first architecture with documented REST endpoints. | Maintainability |
| NFR-07 | Model accuracy: Cost overrun prediction >= 85% F1-score, Time overrun >= 82% F1-score. | Accuracy |
| NFR-08 | All predictions must be reproducible with versioned model artifacts. | Reproducibility |

---

## 3. Technical Stack Requirements

### 3.1 Frontend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Next.js 14+** | React framework with App Router, SSR, RSC | Latest |
| **TypeScript** | Type safety | 5.x |
| **Recharts / Nivo** | Data visualization & charting | Latest |
| **D3.js** | Advanced/custom visualizations | v7 |
| **Framer Motion** | Animations & transitions | Latest |
| **Zustand** | State management | Latest |
| **React Query (TanStack)** | Server state & data fetching | v5 |

### 3.2 Backend (API Layer)
| Technology | Purpose |
|-----------|---------|
| **Next.js API Routes** | REST API endpoints |
| **FastAPI (Python)** | ML model serving, heavy analytics |
| **Prisma** | ORM & database access |
| **PostgreSQL** | Primary data store |
| **Redis** | Caching & real-time alert queue |

### 3.3 ML/AI Pipeline
| Technology | Purpose |
|-----------|---------|
| **scikit-learn** | Classical ML models (Random Forest, Gradient Boosting) |
| **XGBoost / LightGBM** | Gradient boosting for tabular data |
| **TensorFlow / PyTorch** | Deep learning models (LSTM for time-series) |
| **SHAP** | Model explainability |
| **Pandas / NumPy** | Data processing |
| **Optuna** | Hyperparameter optimization |
| **MLflow** | Model versioning & experiment tracking |
| **Hugging Face Transformers** | LLM integration (Mistral/Llama) |
| **LangChain** | LLM orchestration & RAG pipeline |

### 3.4 Infrastructure
| Technology | Purpose |
|-----------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-service orchestration |
| **Nginx** | Reverse proxy |

---

## 4. Data Schema — Common Upload Form (CUF) Fields

The following fields simulate the PAIMANA CUF structure:

```typescript
interface ProjectCUF {
  // Identification
  project_id: string;
  project_name: string;
  ministry_department: string;
  sector: string;
  sub_sector: string;
  state: string;
  district: string;
  implementing_agency: string;

  // Financial
  original_cost_crore: number;
  revised_cost_crore: number;
  anticipated_cost_crore: number;
  cumulative_expenditure_crore: number;
  expenditure_current_year_crore: number;
  expenditure_previous_year_crore: number;
  land_acquisition_cost_crore: number;

  // Timeline
  original_start_date: Date;
  original_completion_date: Date;
  revised_completion_date: Date;
  anticipated_completion_date: Date;
  year_of_approval: number;

  // Progress
  physical_progress_percent: number;
  financial_progress_percent: number;
  milestone_achieved_count: number;
  milestone_total_count: number;

  // Status
  project_status: 'Not Started' | 'Under Implementation' | 'Completed' | 'Shelved' | 'Stalled';
  cost_overrun_percent: number;
  time_overrun_months: number;
  reason_for_delay: string;
  last_updated: Date;

  // Derived (for ML)
  project_duration_months: number;
  expenditure_rate: number;
  cost_revision_count: number;
  schedule_revision_count: number;
}
```

---

## 5. Sectors Covered (22 Sectors)

| # | Sector | Ministry/Department |
|---|--------|-------------------|
| 1 | National Highways | Ministry of Road Transport & Highways |
| 2 | Railways | Ministry of Railways |
| 3 | Ports & Shipping | Ministry of Ports, Shipping & Waterways |
| 4 | Civil Aviation | Ministry of Civil Aviation |
| 5 | Power Generation | Ministry of Power |
| 6 | Power Transmission | Ministry of Power |
| 7 | Renewable Energy | Ministry of New & Renewable Energy |
| 8 | Petroleum Refining | Ministry of Petroleum & Natural Gas |
| 9 | Oil & Gas Pipelines | Ministry of Petroleum & Natural Gas |
| 10 | Telecom | Ministry of Communications |
| 11 | Urban Infrastructure | Ministry of Housing & Urban Affairs |
| 12 | Water Resources | Ministry of Jal Shakti |
| 13 | Irrigation | Ministry of Jal Shakti |
| 14 | Drinking Water & Sanitation | Ministry of Jal Shakti |
| 15 | Coal | Ministry of Coal |
| 16 | Steel | Ministry of Steel |
| 17 | Mining | Ministry of Mines |
| 18 | Atomic Energy | Department of Atomic Energy |
| 19 | Space | Department of Space |
| 20 | Defence Infrastructure | Ministry of Defence |
| 21 | Health Infrastructure | Ministry of Health & Family Welfare |
| 22 | Education Infrastructure | Ministry of Education |

---

## 6. Evaluation Criteria Alignment

| SIH Evaluation Criteria | How We Address It |
|------------------------|------------------|
| **Innovation** | Multi-model ensemble with explainable AI, LLM-powered assistant, predictive + prescriptive analytics |
| **Technical Complexity** | ML pipeline with 6+ models, RAG-based LLM, real-time alerting, time-series analysis |
| **Feasibility** | Built entirely on open-source stack, modular architecture, works with existing CUF schema |
| **Impact** | Proactive risk identification saving potential crores in cost overruns, evidence-based decision making |
| **Scalability** | Containerized microservices, API-first design, supports 2000+ projects |
| **Presentation** | Interactive dashboard with stunning visualizations, live demo capabilities |

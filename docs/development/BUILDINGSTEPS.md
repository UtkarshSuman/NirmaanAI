# PAIMANA AI — Building Steps

> **Step-by-Step Implementation Guide**
> AI-Powered Predictive Analytics & Early Warning System for Infrastructure Project Monitoring

---

## Phase 1: Project Foundation & Data Layer (Days 1–3)

### Step 1.1 — Initialize Next.js Project
```bash
npx -y create-next-app@latest ./ --typescript --app --src-dir --eslint --no-tailwind --import-alias "@/*"
```

**Post-init setup:**
- Install dependencies:
  ```bash
  npm install recharts @nivo/core @nivo/bar @nivo/line @nivo/pie @nivo/heatmap
  npm install framer-motion zustand @tanstack/react-query
  npm install d3 @types/d3
  npm install prisma @prisma/client
  npm install lucide-react clsx date-fns
  npm install react-hot-toast
  ```

### Step 1.2 — Set Up Design System & Global Styles
- Create `globals.css` with CSS custom properties (design tokens)
- Define color palette: Dark theme with government-blue accent (#1a56db, #0e7490)
- Typography: Import Inter + JetBrains Mono from Google Fonts
- Create base UI components: Button, Card, Badge, Input, Select, Modal, DataTable, Skeleton

### Step 1.3 — Initialize PostgreSQL with Prisma
```bash
npx prisma init
```
- Define Prisma schema with all tables from PROJECTARCHITECTURE.md
- Generate Prisma client
- Create seed script for initial data

### Step 1.4 — Synthetic Data Generation
Create `data-generator/generate_projects.py`:
- Generate 1,981 projects matching PAIMANA specifications
- Distribute across 22 sectors and 17 ministries/departments
- Generate realistic financial data (original cost ₹150Cr+)
- Create historical snapshots (monthly data for 3+ years)
- Inject realistic cost/time overrun patterns based on sector averages
- Generate milestone data and delay reasons

**Key data distributions to model:**
| Metric | Value |
|--------|-------|
| Total original cost | ~₹37.13 lakh crore |
| Total revised cost | ~₹42.78 lakh crore |
| Total expenditure | ~₹20.36 lakh crore |
| Average cost overrun | ~15.2% |
| Projects with time overrun | ~45% |
| Average time overrun | 32 months |

### Step 1.5 — Set Up Docker Compose
- PostgreSQL container
- Redis container
- Create `init.sql` for database initialization

---

## Phase 2: ML Pipeline & Model Training (Days 3–6)

### Step 2.1 — Set Up FastAPI ML Service
```bash
cd ml-service
python -m venv venv
pip install fastapi uvicorn pandas numpy scikit-learn xgboost lightgbm shap optuna mlflow
pip install langchain chromadb sentence-transformers
pip install torch torchvision  # For LSTM
```

Create FastAPI application structure:
```
ml-service/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── api/routes/
│   ├── models/
│   ├── pipeline/
│   ├── services/
│   └── llm/
```

### Step 2.2 — Feature Engineering Pipeline
Implement `pipeline/feature_engineering.py`:

**47+ engineered features across 4 categories:**

1. **Basic Derived Features (12 features):**
   - `cost_revision_ratio` = revised_cost / original_cost
   - `expenditure_ratio` = cumulative_expenditure / revised_cost
   - `burn_rate` = cumulative_expenditure / elapsed_months
   - `budget_remaining_ratio` = (revised_cost - expenditure) / revised_cost
   - `physical_financial_gap` = physical_progress - financial_progress
   - `milestone_completion_rate` = achieved / total milestones
   - `project_age_months` = months since original_start_date
   - `planned_duration_months` = original_completion - original_start
   - `elapsed_ratio` = elapsed_time / planned_duration
   - `land_cost_ratio` = land_cost / original_cost
   - `annual_expenditure_growth` = current_year_exp / previous_year_exp
   - `cost_per_month` = revised_cost / planned_duration

2. **Statistical Aggregation Features (10 features):**
   - `sector_avg_cost_overrun` — Average cost overrun in the same sector
   - `sector_avg_time_overrun` — Average time overrun in the same sector
   - `ministry_avg_overrun` — Ministry-level average overrun
   - `agency_historical_performance` — Implementing agency's track record
   - `state_project_success_rate` — State-level project success rate
   - `sector_completion_rate` — % of completed projects in sector
   - `sector_median_duration` — Median project duration in sector
   - `agency_project_count` — Number of projects by agency
   - `cost_category_overrun_avg` — Average overrun by cost category
   - `year_of_approval_cohort_performance` — Performance of approval-year cohort

3. **Temporal / Lag Features (15 features):**
   - `expenditure_growth_3m` — 3-month expenditure growth rate
   - `expenditure_growth_6m` — 6-month expenditure growth rate
   - `progress_velocity_3m` — 3-month physical progress velocity
   - `progress_velocity_6m` — 6-month physical progress velocity
   - `cost_revision_count` — Number of cost revisions
   - `schedule_revision_count` — Number of schedule revisions
   - `cost_revision_acceleration` — Rate of increase in cost revisions
   - `milestone_achievement_trend` — Trend in milestone achievement rate
   - `expenditure_seasonality` — Seasonal expenditure pattern (Q4 spike)
   - `progress_stagnation_months` — Months with < 1% progress
   - `months_since_last_revision` — Time since last cost/schedule revision
   - `expenditure_lag_1m` through `expenditure_lag_3m` — Lagged expenditure
   - `progress_lag_1m` through `progress_lag_3m` — Lagged progress

4. **Interaction Features (10 features):**
   - `sector_x_cost_category` — Sector × project cost category interaction
   - `agency_type_x_sector` — Agency type × sector
   - `state_x_sector` — State × sector historical performance
   - `project_size_x_duration` — Project size × planned duration
   - `age_x_progress` — Project age × physical progress
   - `cost_ratio_x_progress` — Cost revision ratio × progress
   - `sector_risk_x_agency_risk` — Sector risk × agency risk
   - `expenditure_rate_x_remaining` — Burn rate × remaining budget
   - `milestone_gap_x_time_remaining` — Milestone gap × time remaining
   - `financial_gap_x_cost_overrun` — Financial gap × cost overrun trend

### Step 2.3 — Cost Overrun Prediction Model
Implement `models/cost_overrun_model.py`:

**Model Training Pipeline:**
1. **Data Preparation**: Train/validation/test split (70/15/15) stratified by sector
2. **Preprocessing**: StandardScaler for numerical, OneHotEncoder for categorical
3. **Models to Train:**
   - XGBoost Classifier (binary: overrun yes/no) + Regressor (overrun %)
   - LightGBM Classifier + Regressor
   - Random Forest Classifier + Regressor
   - LSTM (on time-series snapshots)
4. **Hyperparameter Optimization**: Optuna with 100 trials per model
5. **Ensemble**: Stacking with logistic regression meta-learner
6. **Evaluation Metrics**: F1, Precision, Recall, AUC-ROC, RMSE, MAE

**Target Variables:**
- `will_have_cost_overrun` (binary classification)
- `cost_overrun_percentage` (regression)

### Step 2.4 — Time Overrun Prediction Model
Implement `models/time_overrun_model.py`:

**Same pipeline as cost overrun with:**
- `will_have_time_overrun` (binary classification)
- `time_overrun_months` (regression)

### Step 2.5 — Risk Scoring Framework
Implement `models/risk_scoring_model.py`:

**Composite Risk Score (0–100):**
```python
risk_score = (
    cost_risk_score * 0.30 +      # From cost overrun probability
    time_risk_score * 0.30 +       # From time overrun probability
    milestone_risk_score * 0.20 +  # From milestone completion gap
    sector_risk_score * 0.10 +     # From sector historical risk
    agency_risk_score * 0.10       # From agency track record
)
```

**Risk Categories:**
| Score | Category | Color | Action |
|-------|----------|-------|--------|
| 0–25 | Low | Green | Monitor |
| 26–50 | Moderate | Yellow | Review |
| 51–75 | High | Orange | Intervene |
| 76–100 | Critical | Red | Escalate |

### Step 2.6 — SHAP Explainability
Implement explainability for every prediction:
- SHAP TreeExplainer for XGBoost/LightGBM/RF
- Global feature importance rankings
- Per-project waterfall charts showing top risk drivers
- Feature interaction plots

### Step 2.7 — Model Evaluation & Selection
- Compare all models on test set
- Select best-performing ensemble configuration
- Register final models in MLflow
- Save model artifacts to `data/models/`

---

## Phase 3: Frontend Dashboard (Days 5–9)

### Step 3.1 — Layout & Navigation
- Implement `Sidebar.tsx` with route links and active state
- Implement `TopNav.tsx` with search, notifications, user menu
- Implement `Breadcrumb.tsx` for navigation context
- Set up dashboard layout with responsive sidebar

### Step 3.2 — National Overview Dashboard (`/dashboard`)
- **KPI Cards**: Total projects, total cost, total expenditure, % with cost overrun, % with time overrun, avg risk score
- **Sector Distribution Chart**: Nivo/Recharts bar chart showing project count by sector
- **Risk Distribution**: Donut chart showing Low/Moderate/High/Critical distribution
- **Cost Overrun Trend**: Line chart showing cost overrun trends over time
- **Recent Alerts**: Alert feed showing latest early warnings
- **Top At-Risk Projects**: Table of top 10 highest-risk projects

### Step 3.3 — Analytics Pages
**Cost Overrun Analytics (`/analytics/cost-overrun`):**
- Sector-wise cost overrun comparison
- Cost overrun distribution histogram
- Top cost escalation drivers (from SHAP)
- Predicted vs actual cost overrun scatter plot

**Time Overrun Analytics (`/analytics/time-overrun`):**
- Sector-wise delay analysis
- Time overrun distribution
- Delay reason categorization
- Timeline deviation trends

**Benchmarking (`/analytics/benchmarking`):**
- Cross-sector performance comparison
- Ministry-wise project delivery efficiency
- Agency performance rankings
- Year-of-approval cohort analysis

### Step 3.4 — Project Views
**Project List (`/projects`):**
- Filterable/sortable data table with 20+ columns
- Filters: sector, ministry, status, risk level, state
- Search by project name/ID
- Bulk risk score visualization
- Export to CSV functionality

**Project Detail (`/projects/[id]`):**
- Project overview card with all CUF fields
- Risk gauge chart (0–100 with needle)
- SHAP waterfall chart showing risk drivers
- Historical snapshot timeline (cost, expenditure, progress)
- Milestone tracker with completion status
- AI-generated project narrative summary
- Similar projects comparison
- Recommended interventions

### Step 3.5 — Early Warning Console (`/alerts`)
- Real-time alert feed with severity badges
- Filter by severity (Critical, High, Moderate, Low)
- Alert detail expansion with:
  - Affected project details
  - Risk score trend
  - Top contributing factors
  - Recommended actions
- Alert acknowledgment workflow
- Alert statistics summary

### Step 3.6 — Risk Heatmap (`/risk-map`)
- India map visualization using D3.js + GeoJSON
- State-level risk aggregation with color intensity
- Sector-wise risk overlay
- Click-to-drill into state/sector details
- Tooltip with project count, avg risk, top risk projects

### Step 3.7 — Sector Drill-down (`/sectors/[sector]`)
- Sector overview with KPIs
- Project list within sector
- Sector-specific trends
- Comparison with national averages
- Risk distribution within sector

---

## Phase 4: LLM Intelligence Assistant (Days 8–10)

### Step 4.1 — RAG Pipeline Setup
- Set up ChromaDB vector store
- Embed project data and documentation using sentence-transformers
- Create LangChain document loaders for project data
- Build retrieval pipeline with similarity search

### Step 4.2 — LLM Integration
- Integrate with open-source LLM (Mistral-7B or Llama-3-8B via Ollama or Hugging Face)
- Create specialized prompts for:
  - Project risk summarization
  - Comparative analysis queries
  - Recommendation generation
  - Natural language data exploration
- Build conversation memory with context window management

### Step 4.3 — Chat Interface (`/assistant`)
- Implement chat window with message bubbles
- Streaming response display
- Suggested query buttons for common questions:
  - "Which projects are most at risk of cost overrun?"
  - "Compare railway sector performance with highways"
  - "What interventions could reduce risk for Project X?"
  - "Summarize the current state of all critical projects"
- Query results with embedded charts/tables
- Conversation history

---

## Phase 5: Integration, Polish & Testing (Days 10–12)

### Step 5.1 — API Integration
- Connect all frontend components to backend APIs
- Implement React Query hooks for data fetching
- Set up optimistic updates and cache invalidation
- Error handling and loading states

### Step 5.2 — Real-time Features
- Redis pub/sub for alert notifications
- WebSocket connection for live updates
- Auto-refresh dashboard every 30 seconds

### Step 5.3 — Performance Optimization
- Server-side rendering for initial dashboard load
- Image optimization with next/image
- Code splitting and lazy loading for chart components
- Database query optimization with proper indexing

### Step 5.4 — UI Polish
- Smooth page transitions with Framer Motion
- Skeleton loaders for all data-dependent components
- Dark/light theme toggle
- Responsive design testing
- Micro-animations on hover/click for interactive elements
- Glassmorphism effects on cards and panels

### Step 5.5 — Documentation & Deployment
- API documentation with examples
- ML model documentation (methodology, metrics, limitations)
- README with setup instructions
- Docker Compose for one-command deployment
- Environment variable management

---

## Phase 6: Hackathon Presentation Prep (Day 12)

### Step 6.1 — Demo Script
- Prepare live demo flow:
  1. Landing page → Dashboard overview (10 seconds)
  2. Show national KPIs and risk distribution (30 seconds)
  3. Drill into highest-risk sector (30 seconds)
  4. Open specific at-risk project, show SHAP explanation (45 seconds)
  5. Show early warning alert console (30 seconds)
  6. Interact with LLM assistant (60 seconds)
  7. Show risk heatmap (20 seconds)
  8. Highlight ML model metrics and explainability (30 seconds)

### Step 6.2 — Presentation Slides
- Problem statement and impact
- Solution architecture
- ML methodology and results
- Live demo screenshots
- Innovation highlights
- Scalability and future roadmap

---

## Quick Reference: Key Commands

```bash
# Start development
docker-compose -f docker/docker-compose.dev.yml up -d   # Start DB + Redis
cd frontend && npm run dev                                # Start Next.js
cd ml-service && uvicorn app.main:app --reload           # Start ML service

# Database operations
cd frontend && npx prisma migrate dev                    # Run migrations
cd frontend && npx prisma db seed                        # Seed data

# ML operations
cd ml-service && python -m app.pipeline.training_pipeline  # Train models
cd ml-service && python -m app.pipeline.evaluation         # Evaluate models

# Generate synthetic data
cd data-generator && python generate_projects.py           # Generate data
```

# NIRMAAN AI — Frontend Application

Next.js 16 App Router interface for **NIRMAAN AI** (Predictive Infrastructure Intelligence), providing real-time portfolio monitoring, risk analytics, geographic visualization, and natural-language assistance for Central Sector Infrastructure Projects.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.3.6 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **UI Library** | React 19.2.8 |
| **Styling** | Tailwind CSS 3.4 + Custom Government Design Tokens |
| **Data Layer** | Prisma ORM 6.4.1 + SQLite (`prisma/dev.db`) |
| **Visualizations** | Recharts 3.10 + Custom SVG Interactive Map |
| **Icons & Motion** | Lucide React + Framer Motion |
| **State & Query** | Zustand 5.0 + TanStack React Query 5.104 |

---

## Directory Structure

```
frontend/
|-- src/
|   |-- app/                         # App Router pages and API routes
|   |   |-- page.tsx                 # National Overview Dashboard
|   |   |-- layout.tsx               # Root Layout with GovHeader and Sidebar
|   |   |-- projects/                # Project Directory & Dossiers
|   |   |   |-- page.tsx             # Paginated & Filterable Project Directory
|   |   |   `-- [id]/page.tsx        # Comprehensive Project Dossier & Risk Breakdown
|   |   |-- analytics/page.tsx       # ML vs Benchmark Model Analytics
|   |   |-- alerts/page.tsx          # Early Warning Alerts Console
|   |   |-- map/page.tsx             # Interactive India Geographic Risk Map
|   |   |-- assistant/page.tsx       # AI Officer Interface
|   |   `-- api/                     # Next.js API Routes (delegate to services)
|   |       |-- kpi/route.ts         # Portfolio summary KPI metrics
|   |       |-- projects/route.ts    # Paginated project listings & filters
|   |       |-- states/route.ts      # State-wise project & risk aggregations
|   |       |-- alerts/route.ts      # Early warning alert queries
|   |       |-- analytics/route.ts   # ML training benchmark metrics
|   |       `-- chat/route.ts        # AI Officer query endpoint
|   |-- components/                  # UI Components
|   |   |-- dashboard/               # Dashboard sections (Hero, Sector, etc.)
|   |   |-- DataFreshnessBar.tsx     # Dynamic DB & model freshness indicator
|   |   |-- GovHeader.tsx            # Standard institutional header
|   |   |-- GovFooter.tsx            # Standard institutional footer
|   |   |-- IndiaMap.tsx             # SVG choropleth map
|   |   |-- Sidebar.tsx              # Main navigation sidebar
|   |   `-- TopNav.tsx               # Header utility navigation
|   `-- lib/
|       |-- services/                # Business Logic Service Layer
|       |   |-- portfolioService.ts  # Portfolio aggregates & sector metrics
|       |   |-- predictionService.ts # Per-project ML predictions & risk bands
|       |   |-- priorityEngine.ts    # Composite priority score across all projects
|       |   |-- freshnessService.ts  # Live database & model artifact freshness
|       |   `-- modelService.ts      # Benchmark loader from training_results.json
|       |-- prisma.ts                # PrismaClient singleton
|       |-- types.ts                 # Shared TypeScript interfaces
|       `-- indiaMapPaths.ts         # SVG path coordinates for Indian states/UTs
|-- prisma/
|   |-- schema.prisma                # Database schema
|   `-- dev.db                       # Local SQLite database (synthetic development data)
|-- public/                          # Static assets
|-- package.json
|-- tsconfig.json
`-- next.config.ts
```

---

## Service Architecture

All database queries and business logic reside in `src/lib/services/`. API routes and Server Components call these services directly:

1. **`portfolioService.ts`**: Aggregates national KPIs (total projects, sanctioned budget, total expenditure, cost escalation, schedule delay, sector breakdowns).
2. **`predictionService.ts`**: Fetches and joins predictions with projects; assigns composite risk bands (`CRITICAL`, `HIGH`, `MODERATE`, `LOW`, `UNCLASSIFIED`).
3. **`priorityEngine.ts`**: Evaluates all active projects across multiple weighted dimensions (cost ratio, delay severity, risk score) to produce actionable intervention rankings.
4. **`freshnessService.ts`**: Inspects the latest record in `dev.db` and the filesystem `mtime` of `training_results.json` to compute dynamic freshness telemetry.
5. **`modelService.ts`**: Reads model training results and cross-validation metrics for the ML analytics view.

---

## Available Scripts

### Development Server
```bash
npm run dev
```
Starts the Next.js development server at `http://localhost:3000`.

### Type Checking
```bash
npm run type-check
```
Executes `tsc --noEmit` across all TypeScript files.

### Production Build
```bash
npm run build
```
Compiles and generates the optimized production build with Turbopack.

### Production Start
```bash
npm start
```
Runs the compiled production server.

---

## Environment Variables

Copy `.env.example` to `.env` if not already present:

```env
DATABASE_URL="file:./dev.db"
ML_SERVICE_URL="http://localhost:8000"
```

> **Warning:** Do not run `prisma migrate reset` or `prisma db push --force-reset` on an active environment, as this will destroy the local development dataset.

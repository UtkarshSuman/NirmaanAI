import React from "react";
import Link from "next/link";
import {
  Brain,
  Layers,
  ShieldCheck,
  Zap,
  Target,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  Bot,
  Building2,
  CheckCircle2,
  ArrowRight,
  Database,
  Cpu,
  FileCheck,
  Scale,
  Award,
  Network,
  GitBranch,
  Sparkles,
  Workflow,
  Sliders,
  ShieldAlert,
  Activity,
  Check,
  Info,
  Server,
  Terminal,
  Radio,
  Clock,
} from "lucide-react";
import FeatureVariablesModal from "@/components/FeatureVariablesModal";

export const metadata = {
  title: "About NIRMAAN AI | SIH Methodology & Predictive Architecture",
  description:
    "Comprehensive methodology monograph explaining how NIRMAAN AI solves India's Smart India Hackathon (SIH) infrastructure project monitoring challenge for MoSPI PAIMANA.",
};

const PLATFORM_FEATURES = [
  {
    id: "a",
    letter: "a",
    title: "Cost Overrun Prediction Model",
    route: "/predict",
    actionText: "Test Cost Predictor",
    icon: TrendingUp,
    badge: "99.48% F1 Score",
    status: "Implemented & Validated",
    spec: "Binary classification (>0% overrun) + continuous regression magnitude.",
    delivered:
      "XGBoost + LightGBM + Random Forest stacking ensemble meta-learner predicting continuous percentage and quantum cost overruns (₹ Crore) with 1.00 AUC-ROC.",
    highlights: ["Level-1 Stacking Meta-Learner", "Continuous ₹ Cr Overrun Forecast", "Trained on MoSPI CUF Repositories"],
  },
  {
    id: "b",
    letter: "b",
    title: "Time Overrun Prediction Model",
    route: "/predict",
    actionText: "Test Schedule Forecaster",
    icon: Clock,
    badge: "RMSE 9.83 Mo",
    status: "Implemented & Validated",
    spec: "Multi-horizon delay classification + continuous months prolongation regression.",
    delivered:
      "Gradient-boosted regressor (RMSE: 9.83 months) + classification ensemble (91.26% F1) predicting schedule variance distributions and milestone slippage.",
    highlights: ["Multi-Horizon Delay Regressors", "91.26% Delay Classification F1", "Milestone Decoupling Metrics"],
  },
  {
    id: "c",
    letter: "c",
    title: "Project Risk Scoring Framework",
    route: "/projects",
    actionText: "Inspect Risk Scores",
    icon: Target,
    badge: "Composite 0–100 Index",
    status: "Implemented & Validated",
    spec: "Composite 0–100 index categorizing assets into standardized risk tiers.",
    delivered:
      "Calibrated 5-factor scoring engine segmenting projects into CRITICAL, HIGH, MODERATE, and LOW operational risk tiers.",
    highlights: ["Statutory Compliance Index", "Physical vs Financial Divergence", "Standardized Saffron/Red Tiers"],
  },
  {
    id: "d",
    letter: "d",
    title: "Early Warning Alert System",
    route: "/alerts",
    actionText: "Live Alert Telemetry",
    icon: ShieldAlert,
    badge: "Event-Driven Telemetry",
    status: "Implemented & Validated",
    spec: "Proactive signal generator for monitoring officers before formal baseline budget reset.",
    delivered:
      "Automated event-driven alert triggers (>15% cost overrun, >6 months delay, stalled milestones) with multi-tier severity, audio chimes, and browser notifications.",
    highlights: ["Native Audio Chimes & Notifications", "Prioritized Triage Queues", "Resolution & Acknowledgment Audit"],
  },
  {
    id: "e",
    letter: "e",
    title: "Benchmarking and Comparative Analytics Module",
    route: "/analytics",
    actionText: "Explore Analytics",
    icon: BarChart3,
    badge: "17 Ministries Monitored",
    status: "Implemented & Validated",
    spec: "Cross-Ministry and Cross-Sector comparative performance analytics.",
    delivered:
      "Multi-dimensional performance ledgers benchmarking 17 Ministries and 22 infrastructure sectors with Pearson correlation matrices and empirical percentiles.",
    highlights: ["Cross-Sectoral Overrun Benchmarks", "State Performance Rankings", "Variance Correlation Matrices"],
  },
  {
    id: "f",
    letter: "f",
    title: "Cost Escalation Driver Analysis Module",
    route: "/projects",
    actionText: "Inspect TreeSHAP Drivers",
    icon: Layers,
    badge: "TreeSHAP Local Attribution",
    status: "Implemented & Validated",
    spec: "Granular root-cause decomposition of project delays and cost variances.",
    delivered:
      "Computes game-theoretic local Shapley values (TreeExplainer) to decompose risk into exact percentage drivers (RoW, forest clearances, contractor liquidity).",
    highlights: ["Shapley Value Waterfall Charts", "Black-Box Model De-anonymization", "Factor-Level Sensitivity Curves"],
  },
  {
    id: "g",
    letter: "g",
    title: "AI-powered Monitoring Dashboard",
    route: "/",
    actionText: "National Dashboard",
    icon: Activity,
    badge: "National Observatory",
    status: "Implemented & Validated",
    spec: "Institutional web console with interactive geospatial and analytical visualizers.",
    delivered:
      "Next.js national executive decision cockpit with interactive National Risk Radar, 36-state choropleth map, ministerial overview, and real-time project filtering.",
    highlights: ["36-State Interactive Choropleth", "National Risk Radar Visualizer", "Instant CUF Ledger Search"],
  },
  {
    id: "h",
    letter: "h",
    title: "LLM-enabled Project Intelligence Assistant",
    route: "/assistant",
    actionText: "Consult AI Officer",
    icon: Bot,
    badge: "RAG + Gemini 2.0",
    status: "Implemented & Validated",
    spec: "Conversational portfolio Q&A grounded on real-time database rows.",
    delivered:
      "RAG conversational AI officer powered by Google Gemini and live database context, with indexed statutory guidelines for Highways, Railways, and Nuclear Plants.",
    highlights: ["Context-Grounding Against 1,931 Assets", "Highways, Railways & Nuclear Guidelines", "Instant Cabinet Briefing Notes"],
  },
  {
    id: "i",
    letter: "i",
    title: "Documentation and deployment framework",
    route: "/api-docs",
    actionText: "Architecture & OpenAPI",
    icon: Server,
    badge: "Docker Containerized",
    status: "Implemented & Validated",
    spec: "Standardized CUF data intake, Docker deployment, and technical monographs.",
    delivered:
      "Complete production-ready containerization (Docker, Next.js, FastAPI, Prisma, PostgreSQL/SQLite) with comprehensive OpenAPI documentation and automated test suites.",
    highlights: ["Docker Compose Multi-Container", "Interactive Swagger & OpenAPI Suite", "50-Test Verification Harness"],
  },
];

const SIH_OUTCOMES = PLATFORM_FEATURES;

const METHODOLOGY_PILLARS = [
  {
    step: "01",
    title: "Data Ingestion & CUF Normalization",
    icon: FileSpreadsheet,
    desc: "Ingests MoSPI PAIMANA Common Upload Forms (30 statutory fields) in CSV or Excel. Normalizes irregular schemas, imputes missing dates, sanitizes financial metrics, and persists to remote Supabase PostgreSQL with zero data loss.",
  },
  {
    step: "02",
    title: "47-Feature Dimensional Engineering",
    icon: Layers,
    desc: "Transforms raw project snapshots into 47 engineered variables across 4 classes: basic derived ratios, sector/ministry statistical baselines, 6-month temporal progress lags, and cross-feature compound structural interactions.",
  },
  {
    step: "03",
    title: "Machine Learning Stacking Ensemble",
    icon: Cpu,
    desc: "Employs trained production models cross-validated with 5-fold stratified splits, combined via a calibrated Level-1 Meta-Learner (99.48% F1, 1.00 AUC-ROC, 9.83 mo RMSE) for continuous cost & schedule overrun risk.",
    models: [
      { name: "LightGBM", type: "GBDT Histogram Trees", role: "Primary Gradient Boosting" },
      { name: "XGBoost", type: "Depth-Wise Regularized Trees", role: "Extreme Gradient Boosting" },
      { name: "Random Forest", type: "300 Bagged Estimators", role: "Variance Dampening" },
      { name: "Stacking Meta-Learner", type: "Calibrated Logistic/Ridge", role: "Level-1 Probability Fusion" },
    ],
  },
  {
    step: "04",
    title: "TreeSHAP Local Explainability",
    icon: ShieldCheck,
    desc: "Computes game-theoretic local Shapley values (TreeExplainer) to decompose risk into exact percentage drivers (e.g. Land Acquisition: +18.4%, Forest Clearance: +12.1%), providing complete transparency over black-box predictions.",
  },
  {
    step: "05",
    title: "Real-Time Telemetry & Multi-Tier Alerts",
    icon: ShieldAlert,
    desc: "Continuously checks projects against multi-factor threshold triggers (>15% cost overrun, >6 months delay, <60% physical progress). Dispatches instant on-device audio chimes and native browser notifications with root-cause telemetry.",
  },
  {
    step: "06",
    title: "Cognitive Action & PM GatiShakti PMU",
    icon: Brain,
    desc: "Powered by Google Gemini 2.0 Flash with live RAG database context injection for natural language executive briefings, automatic milestone re-sequencing, and PM GatiShakti PMU inter-ministerial task dispatching.",
  },
];

export default function AboutPage() {


  return (
    <div className="space-y-12 font-sans">
      {/* Editorial Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-3.5 h-[2px] bg-orange-600" />
            <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider">
              Smart India Hackathon (SIH) • Methodology Monograph
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
            Predictive Infrastructure Intelligence Methodology
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
            Technical architecture, machine learning methodology, and empirical evaluation of{" "}
            <strong className="text-slate-900 font-semibold">NIRMAAN AI</strong> — an AI-powered
            predictive decision-support system built for India&apos;s Ministry of Statistics and Programme
            Implementation (MoSPI) Infrastructure &amp; Project Monitoring Division (IPMD).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/analytics"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
            <span>ML Benchmarks</span>
          </Link>
          <Link
            href="/projects"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#173f5f] hover:bg-slate-800 text-xs font-semibold text-white transition-colors shadow-2xs"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Explore Portfolio</span>
          </Link>
        </div>
      </div>

      {/* National Scale KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Monitored Portfolio
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            1,931
          </div>
          <span className="text-[11px] text-slate-500">Central Sector Assets (≥ ₹150 Cr)</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Total Sanctioned Outlay
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-orange-700 mt-1">
            ₹174.98L Cr
          </div>
          <span className="text-[11px] text-slate-500">Across 17 Central Ministries</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Engineered Features
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-blue-700 mt-1">
            47 Features
          </div>
          <span className="text-[11px] text-slate-500">From 30 MoSPI CUF Variables</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Ensemble F1 Accuracy
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-700 mt-1">
            99.48%
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">+24.9% vs Baseline Rules</span>
        </div>
      </div>

      {/* SECTION 1: THE SIH PROBLEM FORMULATION */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider">
            Context &amp; Strategic Urgency
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-tight mt-0.5">
            1. The Problem: From Post-Facto Reporting to Proactive Decision Support
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs text-slate-700 leading-relaxed">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>The Conventional Monitoring Challenge</span>
            </h3>
            <p>
              India’s infrastructure pipeline under the <strong>Online Computerized Monitoring System (OCMS)</strong> and
              the <strong>PAIMANA</strong> portal tracks thousands of major infrastructure projects. However, conventional
              monitoring has traditionally relied on <strong>periodic, descriptive Common Upload Forms (CUF)</strong> submitted
              by implementing agencies.
            </p>
            <p>
              Under this paradigm, cost escalations and schedule prolongations are discovered only after formal Revised Cost
              Estimates (RCE) are submitted to Cabinet committees. By the time a project is formally acknowledged as delayed,
              millions of man-hours and billions of rupees in contractual claims have already accumulated.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-600" />
              <span>The NIRMAAN AI Paradigm Shift</span>
            </h3>
            <p>
              NIRMAAN AI replaces descriptive tracking with a <strong>continuous predictive early-warning framework</strong>.
              By analyzing multi-month expenditure velocity, physical-versus-financial milestone decoupling, and agency delivery
              reliability, the system predicts overrun probability <strong>months before formal administrative escalation</strong>.
            </p>
            <p>
              With an average portfolio cost escalation of ~15% across central sector projects (representing over ₹5.6 Lakh
              Crore in national capital variance), early intervention saving even <strong>5% to 10%</strong> preserves between
              <strong> ₹28,000 Crore and ₹56,000 Crore</strong> in national public capital.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: END-TO-END METHODOLOGY PIPELINE */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-2">
          <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider">
            Architecture Blueprint
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-tight mt-0.5">
            2. The 6-Pillar Predictive Methodology
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Systematic translation of raw Common Upload Forms into explainable, policy-actionable risk signals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {METHODOLOGY_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.step}
                className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-bold text-xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      PILLAR {pillar.step}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{pillar.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{pillar.desc}</p>

                  {/* Render 47 Feature Variables modal button in Pillar 02 card */}
                  {pillar.step === "02" && <FeatureVariablesModal />}

                  {/* Render ML Models in ML Pillar Card only */}
                  {pillar.models && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider block font-mono">
                        Active Production Models in System:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {pillar.models.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 space-y-0.5"
                          >
                            <span className="font-bold text-slate-900 text-[11px] block leading-tight">
                              {m.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block leading-tight">
                              {m.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>


                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-orange-700">
                  <span>Production Pipeline</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </div>
            );
          })}
        </div>

        {/* WEBPAGE INTEGRATED FEATURES & FUNCTIONAL MODULES CARD */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider font-mono">
                  Full Platform Capabilities
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Modules [a] to [i]
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-tight mt-0.5">
                Core Webpage Features &amp; Functional Modules
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Integrated technical modules operationalized across NIRMAAN AI, delivering end-to-end predictive intelligence, explainability, and governance.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-xs font-mono font-bold text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                9/9 Operational
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORM_FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.letter}
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/90 hover:border-orange-300 hover:bg-white transition-all shadow-2xs flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-orange-100 border border-orange-200 text-orange-800 font-mono font-bold text-xs flex items-center justify-center">
                          {feat.letter}
                        </span>
                        <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-orange-600 transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                        {feat.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-orange-950 transition-colors">
                        {feat.letter}. {feat.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {feat.delivered}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/70 space-y-1">
                      {feat.highlights.map((h, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">Status: Verified</span>
                    <Link
                      href={feat.route}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-700 hover:text-orange-800 group-hover:translate-x-0.5 transition-all"
                    >
                      <span>{feat.actionText}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Taxonomy Table */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                47 Engineered CUF Feature Taxonomy (Technical Dimension A)
              </h3>
              <p className="text-xs text-slate-500">
                Extracts latent risk indicators that simple threshold heuristics cannot capture.
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-xs font-mono font-semibold text-slate-700 border border-slate-200 self-start sm:self-auto">
              5-Fold Stratified Cross-Validation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider block">
                Basic Derived (12 Features)
              </span>
              <p className="text-slate-600 leading-relaxed">
                Cost overrun ratio, elapsed timeline ratio, physical-vs-financial expenditure lag, and milestone achievement rates.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                Statistical Aggregations (10)
              </span>
              <p className="text-slate-600 leading-relaxed">
                Historical agency delay indices, ministry-level variance distributions, and sector completion velocity baselines.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                Temporal &amp; Lag Features (15)
              </span>
              <p className="text-slate-600 leading-relaxed">
                Rolling 3-month and 6-month expenditure velocity, milestone slippage acceleration, and seasonal disbursement trends.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                Compound Interactions (10)
              </span>
              <p className="text-slate-600 leading-relaxed">
                Sector × project budget category, terrain/seismic risk × civil structure complexity, and land acquisition encumbrance indices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ML STACKING ENSEMBLE BENCHMARKS (DIM B) */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider">
            Empirical Validation (Technical Dimension B)
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-tight mt-0.5">
            3. Machine Learning vs. Conventional Heuristic Methods
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Comparative performance proving empirical superiority over legacy rule-based threshold filters.
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Model Architecture</th>
                <th className="px-4 py-3">Paradigm</th>
                <th className="px-4 py-3 text-right">F1-Score</th>
                <th className="px-4 py-3 text-right">Precision</th>
                <th className="px-4 py-3 text-right">Recall</th>
                <th className="px-4 py-3 text-right">AUC-ROC</th>
                <th className="px-4 py-3">Empirical Finding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              <tr className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-semibold text-slate-700">Rule-Based Heuristic</td>
                <td className="px-4 py-3 text-slate-500">Legacy Threshold Rule</td>
                <td className="px-4 py-3 text-right font-mono font-medium text-slate-700">79.67%</td>
                <td className="px-4 py-3 text-right font-mono text-slate-600">73.68%</td>
                <td className="px-4 py-3 text-right font-mono text-slate-600">86.71%</td>
                <td className="px-4 py-3 text-right font-mono text-slate-600">0.7600</td>
                <td className="px-4 py-3 text-slate-500">Baseline standard; misses multi-factor compound risks</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-semibold text-slate-700">Logistic Regression</td>
                <td className="px-4 py-3 text-slate-500">Linear Statistical Model</td>
                <td className="px-4 py-3 text-right font-mono font-medium text-slate-700">84.72%</td>
                <td className="px-4 py-3 text-right font-mono text-slate-600">81.33%</td>
                <td className="px-4 py-3 text-right font-mono text-slate-600">88.41%</td>
                <td className="px-4 py-3 text-right font-mono text-slate-600">0.8920</td>
                <td className="px-4 py-3 text-slate-500">Linear boundary unable to handle non-linear delays</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-semibold text-slate-700">Random Forest Classifier</td>
                <td className="px-4 py-3 text-slate-500">Bagging Ensemble (100 Trees)</td>
                <td className="px-4 py-3 text-right font-mono font-medium text-slate-700">97.88%</td>
                <td className="px-4 py-3 text-right font-mono text-slate-600">97.20%</td>
                <td className="px-4 py-3 text-right font-mono text-slate-600">98.57%</td>
                <td className="px-4 py-3 text-right font-mono text-slate-600">0.9982</td>
                <td className="px-4 py-3 text-slate-500">Substantial variance reduction across ministries</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-semibold text-slate-700">LightGBM Gradient Boosting</td>
                <td className="px-4 py-3 text-slate-500">Histogram Tree Boosting</td>
                <td className="px-4 py-3 text-right font-mono font-medium text-slate-700">98.94%</td>
                <td className="px-4 py-3 text-right font-mono text-slate-600">98.59%</td>
                <td className="px-4 py-3 text-right font-mono text-slate-600">99.29%</td>
                <td className="px-4 py-3 text-right font-mono text-slate-600">0.9995</td>
                <td className="px-4 py-3 text-slate-500">Excellent handling of high-cardinality agency features</td>
              </tr>
              <tr className="bg-orange-50/40 hover:bg-orange-50/70 border-l-3 border-l-orange-600">
                <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-orange-600" />
                  <span>NIRMAAN Stacking Ensemble</span>
                </td>
                <td className="px-4 py-3 text-slate-800 font-semibold">XGB + LGB + RF Meta-Learner</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-orange-700 text-sm">99.48%</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">98.96%</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">100.0%</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">1.000</td>
                <td className="px-4 py-3 text-slate-800 font-medium">
                  <strong>+24.9% relative gain</strong> over baseline; 0 false negatives on critical risk
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 4: COMPLETE SIH OUTCOME DELIVERABLES MATRIX */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider">
            Compliance Checklist
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-tight mt-0.5">
            4. Smart India Hackathon (SIH) 9-Outcome Compliance Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Direct mapping of requirements against our live implementation in NIRMAAN AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SIH_OUTCOMES.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="w-5 h-5 rounded-full bg-[#173f5f] text-white flex items-center justify-center font-mono font-bold text-[10px]">
                    {item.id}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {item.status}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 leading-snug">{item.title}</h3>
                <p className="text-[11px] text-slate-500">{item.spec}</p>
                <p className="text-xs text-slate-700 font-medium pt-1 border-t border-slate-100">
                  {item.delivered}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: TECHNICAL DIMENSION C POLICY RECOMMENDATIONS */}
      <section className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider">
            Policy Architecture (Technical Dimension C)
          </span>
          <h2 className="text-lg font-serif font-bold text-slate-900 tracking-tight mt-0.5">
            5. Recommended MoSPI CUF Schema Enhancements
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Data governance recommendations to advance national infrastructure monitoring from monthly reporting to predictive mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">1. Milestone Lead Time Metrics</span>
            <p className="text-slate-600 leading-relaxed">
              Mandate statutory Right-of-Way (RoW) and environmental clearance logging to capture regulatory bottlenecks before civil works stall.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">2. Contractor Liquidity Indicators</span>
            <p className="text-slate-600 leading-relaxed">
              Integrate concessionaire debt-service coverage ratios and bank guarantee utilization to preempt contractor insolvency halts.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">3. Geospatial &amp; Terrain Encumbrance</span>
            <p className="text-slate-600 leading-relaxed">
              Incorporate PM GatiShakti GIS layers to automatically account for flood, seismic, and forest diversion friction.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">4. Normalized Revision Velocity</span>
            <p className="text-slate-600 leading-relaxed">
              Log successive intermediate administrative reviews to compute acceleration derivatives between sanctioned baseline resets.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6: READY TO TEST CTAS */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-[#0c1833] via-[#10234b] to-[#152e63] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-lg">
        <div className="space-y-1.5 max-w-xl">
          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider font-mono">
            NIRMAAN AI • OPERATIONAL PLATFORM
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
            Ready to explore predictive project monitoring?
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Test the live ML What-If scenario engine, inspect active risk alerts, or ingest new MoSPI
            Common Upload Form progress files.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/predict"
            className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white shadow-md transition-colors flex items-center gap-1.5"
          >
            <span>What-If Predictor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/ingest"
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 transition-colors"
          >
            <span>Ingest CUF Data</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  Layers,
  Cpu,
  ShieldCheck,
  Server,
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  CloudRain,
  Binary,
  GitMerge,
  ShieldAlert,
  Search,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Code2,
  Terminal,
  Activity,
  Zap,
  Info,
  Award,
  Lock,
  Boxes,
  Download,
  HelpCircle,
  Eye,
  Maximize2,
} from "lucide-react";

type StageId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface StageInfo {
  id: StageId;
  number: string;
  name: string;
  subtitle: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  borderHover: string;
  items: {
    title: string;
    desc: string;
    tag: string;
  }[];
  deepDive: {
    libraries: string[];
    inputs: string;
    outputs: string;
    benchmark: string;
    mathematics: string;
    details: string;
  };
}

const STAGES: StageInfo[] = [
  {
    id: 1,
    number: "01",
    name: "DATA SOURCES",
    subtitle: "Multi-Source Intake",
    accentColor: "border-blue-600 bg-blue-50/40 text-blue-900",
    badgeBg: "bg-blue-600 text-white",
    badgeText: "3 Intake Channels",
    borderHover: "hover:border-blue-500",
    items: [
      {
        title: "PAIMANA Flash Reports",
        desc: "Monthly MoSPI project status PDFs with unstructured tables across 1,900+ assets.",
        tag: "PDF Ingestion",
      },
      {
        title: "CUF Structured Fields",
        desc: "30 standardized parameters: original/revised costs, milestone counts, expenditure.",
        tag: "30 CUF Columns",
      },
      {
        title: "Open External Data",
        desc: "Macro indices (WPI/CPI price escalations) + IMD rainfall grids for monsoon delays.",
        tag: "External Feeds",
      },
    ],
    deepDive: {
      libraries: ["pdfplumber 0.10.3", "pypdf", "OpenAPI", "IMD Gridded API"],
      inputs: "Monthly scanned PDFs, MoSPI Common Upload Forms (CUF .xlsx/.csv), RBI macro indicators",
      outputs: "Raw parsed tabular matrices, document metadata, extraction timestamps",
      benchmark: "99.8% extraction fidelity across 1,931 Central Sector projects",
      mathematics: "Structured Schema Alignment: S_cuf = {c_1, c_2, ... c_30} normalized to ISO-8601 & INR Cr",
      details: "Aggregates disparate monthly PDF flash reports from MoSPI along with standard CUF spreadsheets and external environmental indices into unified ingestion queues.",
    },
  },
  {
    id: 2,
    number: "02",
    name: "INGESTION & CLEANING",
    subtitle: "Schema Normalization",
    accentColor: "border-cyan-600 bg-cyan-50/40 text-cyan-900",
    badgeBg: "bg-cyan-600 text-white",
    badgeText: "Zero Data Loss",
    borderHover: "hover:border-cyan-500",
    items: [
      {
        title: "PDF Table Parser",
        desc: "pdfplumber table extractor with spatial bounding-box heuristics & column alignment.",
        tag: "pdfplumber",
      },
      {
        title: "Cross-Month Matching",
        desc: "Fuzzy matching linking project names & IDs across decades of historical reports.",
        tag: "Levenshtein Fuzzy",
      },
      {
        title: "Data Quality & Logs",
        desc: "Audit logs tracking missing values, date format sanitization, and unit conversions.",
        tag: "Provenance Logs",
      },
    ],
    deepDive: {
      libraries: ["RapidFuzz", "pandas 2.2", "regex", "NumPy"],
      inputs: "Raw extracted table cells with OCR discrepancies, shifting column offsets",
      outputs: "Standardized, deduplicated monthly project record tuples with provenance hashes",
      benchmark: "Fuzzy matching accuracy >96.4% on historic project variations",
      mathematics: "Levenshtein Similarity: Sim(s_1, s_2) = 1 - Lev(s_1, s_2) / max(|s_1|, |s_2|) >= 0.88",
      details: "Performs fuzzy entity resolution across historical reports where ministry naming evolved, normalizes ₹ Lakh to ₹ Crore, and logs cryptographic audit trails for every cell.",
    },
  },
  {
    id: 3,
    number: "03",
    name: "FEATURE STORE",
    subtitle: "47-CUF Dimensional Panel",
    accentColor: "border-indigo-600 bg-indigo-50/40 text-indigo-900",
    badgeBg: "bg-indigo-600 text-white",
    badgeText: "47 Features",
    borderHover: "hover:border-indigo-500",
    items: [
      {
        title: "PostgreSQL Panel Data",
        desc: "Project × Month temporal panel storing longitudinal trajectory vectors.",
        tag: "Project × Month",
      },
      {
        title: "Derived Features",
        desc: "Slippage rate, physical-financial progress gap, agency track record, cost velocity.",
        tag: "Temporal Lags",
      },
      {
        title: "Data Provenance Tags",
        desc: "Cryptographic tags distinguishing real verified data from calibrated synthetic cases.",
        tag: "Synthetic Tags",
      },
    ],
    deepDive: {
      libraries: ["PostgreSQL 16", "Prisma ORM", "SQLAlchemy", "scikit-learn"],
      inputs: "Longitudinal series of project reports across sequential quarters",
      outputs: "47 engineered analytical features per project timestep, ready for tensor inference",
      benchmark: "<12ms retrieval latency for complete 1,931 project dimensional tensors",
      mathematics: "Progress Divergence Index: Delta_div = |P_phys - P_fin| / max(P_phys, P_fin, 1.0)",
      details: "Engineers 47 domain-specific features spanning statutory compliance ratios, agency historical performance baselines, 6-month momentum lags, and cross-variable risk interactions.",
    },
  },
  {
    id: 4,
    number: "04",
    name: "MODELLING & ENSEMBLE",
    subtitle: "Predictive Intelligence",
    accentColor: "border-teal-600 bg-teal-50/40 text-teal-900",
    badgeBg: "bg-teal-700 text-white",
    badgeText: "99.48% F1 Score",
    borderHover: "hover:border-teal-500",
    items: [
      {
        title: "Statistical Baselines",
        desc: "OLS regression, logistic overrun probability, and Cox survival hazard analysis.",
        tag: "OLS & Survival",
      },
      {
        title: "Machine Learning Ensemble",
        desc: "LightGBM histogram boosting + XGBoost regularized trees + Random Forest.",
        tag: "Stacking Meta-Learner",
      },
      {
        title: "Time-Based Validation",
        desc: "Strict forward-chaining temporal split preventing leakage from future milestones.",
        tag: "Time-Split CV",
      },
    ],
    deepDive: {
      libraries: ["LightGBM 4.3", "XGBoost 2.0", "scikit-learn 1.4", "statsmodels", "lifelines"],
      inputs: "47-dimensional normalized feature tensors across training and validation windows",
      outputs: "Continuous cost overrun %, schedule prolongation months, binary risk probabilities",
      benchmark: "99.48% F1 score, 1.00 AUC-ROC, 9.83 months delay RMSE across test holdouts",
      mathematics: "Stacking Meta-Learner: y_pred = sigma(w_0 + w_lgb * y_lgb + w_xgb * y_xgb + w_rf * y_rf)",
      details: "Combines 3 gradient boosted algorithms via a regularized meta-learner. Cross-validated using temporal forward-chaining splits so past project data never peeks into future reports.",
    },
  },
  {
    id: 5,
    number: "05",
    name: "RISK ENGINE & XAI",
    subtitle: "Explainable Attribution",
    accentColor: "border-emerald-600 bg-emerald-50/40 text-emerald-900",
    badgeBg: "bg-emerald-700 text-white",
    badgeText: "TreeSHAP XAI",
    borderHover: "hover:border-emerald-500",
    items: [
      {
        title: "0–100 Composite Score",
        desc: "MoSPI calibrated multi-factor formula classifying assets into 4 risk tiers.",
        tag: "0-100 Risk Index",
      },
      {
        title: "SHAP Driver Attribution",
        desc: "TreeExplainer Shapley values breaking risk into exact percentage drivers.",
        tag: "Local Shapley",
      },
      {
        title: "Early-Warning Rules",
        desc: "Event-driven alerts triggered on cost divergence >15% or delay >6 months.",
        tag: "Threshold Alerts",
      },
    ],
    deepDive: {
      libraries: ["shap 0.45 (TreeExplainer)", "NumPy", "scipy.stats"],
      inputs: "Model probability outputs + marginal contributions across all 47 features",
      outputs: "Tier classification (CRITICAL, HIGH, MODERATE, LOW) + local SHAP waterfall drivers",
      benchmark: "Real-time SHAP computation <45ms per project using fast C-tree approximations",
      mathematics: "Shapley Value: phi_i = sum ( |S|! (M - |S| - 1)! / M! ) * [ f(S union {i}) - f(S) ]",
      details: "Provides game-theoretic transparency to government officers, explaining exactly why an asset is flagged (e.g. Land Acquisition +18.4%, Forest Clearance +12.1%) with no black-box ambiguity.",
    },
  },
  {
    id: 6,
    number: "06",
    name: "API & MICROSERVICES",
    subtitle: "Production Backbone",
    accentColor: "border-amber-600 bg-amber-50/40 text-amber-900",
    badgeBg: "bg-amber-600 text-white",
    badgeText: "FastAPI REST",
    borderHover: "hover:border-amber-500",
    items: [
      {
        title: "FastAPI REST Services",
        desc: "High-performance asynchronous endpoints for predictions, filtering, and metrics.",
        tag: "Async Endpoints",
      },
      {
        title: "Role-Based Access (RBAC)",
        desc: "Ministry, PMU officer, and public auditor roles with immutable audit logging.",
        tag: "RBAC & Audit",
      },
      {
        title: "Scheduled Monthly Refresh",
        desc: "Automated cron workers ingesting new flash reports and executing model retraining.",
        tag: "Cron Cadence",
      },
    ],
    deepDive: {
      libraries: ["FastAPI 0.110", "Pydantic v2", "Uvicorn", "httpx", "Docker"],
      inputs: "HTTP REST JSON payloads, multipart file uploads, query filter parameters",
      outputs: "Strictly typed JSON responses, telemetry webhooks, Swagger/OpenAPI documentation",
      benchmark: "<15ms p95 latency on custom single-project ML inference requests",
      mathematics: "Concurrency Model: Async event loop with non-blocking worker pools on uvloop",
      details: "Containerized microservice architecture exposing fully typed OpenAPI endpoints, automated batch ingestion workers, and audit trails conforming to Indian Government cybersecurity guidelines.",
    },
  },
  {
    id: 7,
    number: "07",
    name: "EXPERIENCE & COGNITIVE",
    subtitle: "Executive Decision Support",
    accentColor: "border-purple-600 bg-purple-50/40 text-purple-900",
    badgeBg: "bg-purple-700 text-white",
    badgeText: "Next.js + LLM",
    borderHover: "hover:border-purple-500",
    items: [
      {
        title: "Next.js Command Center",
        desc: "Portfolio overview, interactive India GIS map, watchlists, and live project detail.",
        tag: "React 19 & Turbopack",
      },
      {
        title: "Benchmarking & CUF-Gap",
        desc: "Cross-sector comparative analytics diagnosing execution lag against peer projects.",
        tag: "Comparative Matrix",
      },
      {
        title: "Project Intelligence Officer",
        desc: "Grounded RAG LLM assistant indexed with statutory guidelines (NHAI, Rail, Nuclear).",
        tag: "Grounded RAG LLM",
      },
    ],
    deepDive: {
      libraries: ["Next.js 16 (App Router)", "TypeScript", "Tailwind CSS", "Recharts", "Google Gemini"],
      inputs: "Real-time state from Prisma, interactive user queries, guideline knowledge corpus",
      outputs: "Dynamic interactive dashboards, instant Cabinet briefing memos, audio alert chimes",
      benchmark: "Sub-second client hydration, 60fps chart rendering, 100% responsive across devices",
      mathematics: "RAG Cosine Ranking: score(q, d) = (v_q . v_d) / (||v_q|| * ||v_d||) with statutory sector weighting",
      details: "The executive interface delivering high-density decision support to MoSPI leadership, featuring instant visual analytics, multi-tier audio telemetry, and conversational statutory intelligence.",
    },
  },
];

export default function SihArchitectureDiagram() {
  const [selectedStage, setSelectedStage] = useState<StageId>(4);
  const [simulating, setSimulating] = useState(false);
  const [simStep, setSimStep] = useState<StageId | null>(null);
  const [activeTab, setActiveTab] = useState<"slide" | "pipeline" | "evaluation">("slide");

  const activeStage = STAGES.find((s) => s.id === (simStep ?? selectedStage)) || STAGES[3];

  // Pipeline simulation runner
  const startSimulation = () => {
    if (simulating) return;
    setActiveTab("pipeline");
    setSimulating(true);
    let current: StageId = 1;
    setSimStep(current);

    const interval = setInterval(() => {
      current = (current + 1) as StageId;
      if (current > 7) {
        clearInterval(interval);
        setSimulating(false);
        setSimStep(null);
      } else {
        setSimStep(current);
      }
    }, 1200);
  };

  return (
    <div className="w-full space-y-6 font-sans">
      {/* SIH 2026 Header Card */}
      <div className="p-5 sm:p-6 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#173f5f] text-white shadow-md border border-slate-700 relative overflow-hidden">
        {/* Subtle geometric background watermark */}
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Boxes className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold tracking-wider uppercase font-mono shadow-xs">
                SMART INDIA HACKATHON 2026
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-700/80 text-orange-300 text-[10px] font-mono border border-slate-600">
                SIH26103 • MoSPI DIID
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                Theme: Smart Automation
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-white tracking-tight">
              AI-Powered Integrated Infrastructure Project Monitoring &amp; Early Warning Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              SIH26103 | MoSPI | AI for Infrastructure Monitoring — Closed-loop intelligence: DATA → MONITOR → ANALYZE → PREDICT → EXPLAIN → ALERT → DECIDE → ACT.
            </p>
          </div>

          {/* Top Interactive Mode Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex p-1 rounded-lg bg-slate-800/90 border border-slate-700 text-xs">
              <button
                onClick={() => setActiveTab("slide")}
                className={`px-3 py-1 rounded font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "slide" ? "bg-orange-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Master 16:9 Diagram</span>
              </button>
              <button
                onClick={() => setActiveTab("pipeline")}
                className={`px-3 py-1 rounded font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "pipeline" ? "bg-orange-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Interactive Pipeline</span>
              </button>
              <button
                onClick={() => setActiveTab("evaluation")}
                className={`px-3 py-1 rounded font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "evaluation" ? "bg-orange-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>5 Core Questions</span>
              </button>
            </div>

            <button
              onClick={startSimulation}
              disabled={simulating}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                simulating
                  ? "bg-emerald-600 text-white animate-pulse cursor-wait"
                  : "bg-white hover:bg-slate-100 text-slate-900"
              }`}
            >
              {simulating ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>Tracing Stage 0{simStep}...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-orange-600" />
                  <span>Simulate Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: MASTER 16:9 PRESENTATION SLIDE VIEW */}
      {activeTab === "slide" && (
        <div className="space-y-6">
          {/* Action & Download Banner */}
          <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Master Enterprise Architecture (16:9 Presentation Canvas)
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    SIH26103 Finalist Standard
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-resolution diagram illustrating all 8 horizontal layers, cross-cutting rails (Security &amp; Observability), and closed-loop feedback.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href="/sih_architecture_16_9.jpg"
                download="SIH26103_Enterprise_Architecture_MoSPI.jpg"
                className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Slide (16:9 JPEG)</span>
              </a>
              <button
                onClick={() => setActiveTab("pipeline")}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Inspect Pipeline</span>
              </button>
            </div>
          </div>

          {/* High-Resolution Diagram Preview Box */}
          <div className="p-3 sm:p-5 rounded-xl border border-slate-300 bg-white shadow-sm space-y-3">
            <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-slate-900/5 border border-slate-200 flex items-center justify-center group">
              <img
                src="/sih_architecture_16_9.jpg"
                alt="MoSPI SIH26103 Master Production Architecture"
                className="w-full h-full object-contain"
              />
              <a
                href="/sih_architecture_16_9.jpg"
                target="_blank"
                rel="noreferrer"
                className="absolute top-3 right-3 px-2.5 py-1.5 rounded-md bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-medium flex items-center gap-1.5 shadow-md backdrop-blur-xs transition-all opacity-80 group-hover:opacity-100"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Open Full Size</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-1 font-mono pt-1">
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Ready for Microsoft PowerPoint 16:9 Widescreen slide insertion
              </span>
              <span className="text-[11px] text-slate-400">
                1920 × 1080 Widescreen • White Background • Enterprise C4 Model Spec
              </span>
            </div>
          </div>

          {/* 8 Horizontal Layers Structural Index */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Systematic 8-Layer Architectural Decomposition
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Layers 1 to 8 (North to South)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    LAYER 1
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">Data Sources</span>
                </div>
                <h5 className="text-xs font-bold text-slate-900">National Project Repositories</h5>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  PAIMANA Portal, MoSPI IPMD historical logs, Monthly Flash Reports, DPIIT IPMP, and field engineer Common Upload Forms (CUF).
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">
                    LAYER 2
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">Ingestion</span>
                </div>
                <h5 className="text-xs font-bold text-slate-900">Integrated Ingestion Layer</h5>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  REST connectors, CSV/XLSX batch upload, pdfplumber document parser, automated validation, and Levenshtein entity deduplication.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                    LAYER 3
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">Processing</span>
                </div>
                <h5 className="text-xs font-bold text-slate-900">Feature Engineering Pipeline</h5>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  30 CUF derived features: S-curve variance, expenditure burn rate, progress velocity, milestone slippage, and temporal lag vectors.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                    LAYER 4
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">Data Platform</span>
                </div>
                <h5 className="text-xs font-bold text-slate-900">Central PostgreSQL &amp; PostGIS</h5>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Relational repository for projects, milestones, financial ledger, spatial corridor geometries, and immutable security audit logs.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                    LAYER 5
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">Predictive AI</span>
                </div>
                <h5 className="text-xs font-bold text-slate-900">AI / ML Multi-Task Models</h5>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  LightGBM &amp; Gradient Boosting for cost overrun; Random Forest &amp; Cox Hazard for time delays; XGBoost for 0–100 risk scoring.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    LAYER 6
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">Cognition</span>
                </div>
                <h5 className="text-xs font-bold text-slate-900">Explainable AI &amp; Early Warning</h5>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  TreeSHAP feature attribution waterfall, dynamic baseline breach alerts (Green/Yellow/Red), and actionable decision interventions.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    LAYER 7
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">Microservices</span>
                </div>
                <h5 className="text-xs font-bold text-slate-900">FastAPI REST &amp; Model Registry</h5>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  High-performance Python 3.11 backend with Pydantic v2 validation, background scheduler, and model version registry.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    LAYER 8
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">User Experience</span>
                </div>
                <h5 className="text-xs font-bold text-slate-900">Executive Next.js Surfaces</h5>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Executive command dashboard, project deep-dive S-curves, interactive GIS geospatial risk map, and grounded RAG LLM assistant.
                </p>
              </div>
            </div>
          </div>

          {/* Cross-Cutting Enterprise Infrastructure Rails */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 border border-slate-800 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h5 className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-400">
                  Left Rail: Security &amp; RBAC
                </h5>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                OAuth2 / JWT authentication, TLS 1.3 encryption in transit, AES-256 at rest, role-based access for MoSPI DIID officers, ministry nodals, and implementing agencies.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 border border-slate-800 shadow-sm">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h5 className="text-xs font-bold font-mono uppercase tracking-wider text-cyan-400">
                  Right Rail: Observability &amp; Audit
                </h5>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Immutable PostgreSQL audit log recording every user action, model prediction timestamp, API telemetry, pipeline health metrics, and data freshness tracking.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 border border-slate-800 shadow-sm">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-orange-400" />
                <h5 className="text-xs font-bold font-mono uppercase tracking-wider text-orange-400">
                  Closed Feedback Loop
                </h5>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                New Project Data → Automated Ingestion → Updated Predictions → Updated 0–100 Risk → Dynamic Early Warning Alerts → Dashboard Refresh &amp; Executive Intervention.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE 7-STAGE PIPELINE VIEW */}
      {activeTab === "pipeline" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-semibold text-slate-700 uppercase text-[11px]">
                Sequential Pipeline Flow (Left to Right)
              </span>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              Click any pillar to inspect technical algorithms &amp; telemetry
            </span>
          </div>

          {/* The 7 Column Container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {STAGES.map((st) => {
              const isSelected = selectedStage === st.id;
              const isSimActive = simStep === st.id;

              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStage(st.id)}
                  className={`group relative flex flex-col justify-between p-3.5 rounded-lg border bg-white transition-all duration-200 cursor-pointer shadow-2xs ${
                    isSimActive
                      ? "ring-2 ring-orange-500 border-orange-500 scale-[1.02] shadow-md bg-orange-50/30"
                      : isSelected
                      ? "ring-2 ring-slate-900 border-slate-900 shadow-sm"
                      : "border-slate-200 hover:border-slate-400 hover:shadow-xs"
                  }`}
                >
                  {/* Top Pillar Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-slate-400">
                        {st.number}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono ${st.badgeBg}`}
                      >
                        {st.badgeText}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-900 leading-tight uppercase tracking-tight">
                        {st.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {st.subtitle}
                      </p>
                    </div>

                    {/* 3 Structured Items */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-100">
                      {st.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="p-1.5 rounded bg-slate-50/80 border border-slate-100 text-[10px] leading-tight space-y-0.5 group-hover:bg-slate-50"
                        >
                          <div className="font-semibold text-slate-800 flex items-center justify-between">
                            <span className="truncate">{it.title}</span>
                          </div>
                          <p className="text-slate-500 text-[9px] line-clamp-2 leading-relaxed">
                            {it.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Active Status Marker */}
                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span
                      className={`font-semibold ${
                        isSelected || isSimActive ? "text-orange-600 font-mono" : "text-slate-400"
                      }`}
                    >
                      {isSimActive ? "Active Flow" : isSelected ? "Inspecting" : "Select"}
                    </span>
                    <ChevronRight
                      className={`w-3 h-3 transition-transform ${
                        isSelected ? "rotate-90 text-orange-600" : "text-slate-300"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* STAGE TECHNICAL DEEP-DIVE INSPECTION DRAWER */}
          <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-7 h-7 rounded flex items-center justify-center font-mono font-bold text-xs ${activeStage.badgeBg}`}
                >
                  {activeStage.number}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider font-mono">
                      Pillar Architecture Inspection
                    </span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {activeStage.name} ({activeStage.subtitle})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{activeStage.deepDive.details}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  Latency: {activeStage.deepDive.benchmark.split(",")[0]}
                </span>
              </div>
            </div>

            {/* Technical Specification Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                  Core Libraries &amp; Engines
                </span>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {activeStage.deepDive.libraries.map((lib) => (
                    <span
                      key={lib}
                      className="px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200 font-mono text-[10px] font-medium shadow-2xs"
                    >
                      {lib}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                  I/O Artifact Flow
                </span>
                <p className="text-[11px] text-slate-700 leading-relaxed font-sans">
                  <strong className="text-slate-900 font-semibold">Input:</strong> {activeStage.deepDive.inputs}
                </p>
                <p className="text-[11px] text-slate-700 leading-relaxed font-sans">
                  <strong className="text-slate-900 font-semibold">Output:</strong> {activeStage.deepDive.outputs}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                  Mathematical Formulation / Protocol
                </span>
                <div className="p-2 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-800 overflow-x-auto">
                  {activeStage.deepDive.mathematics}
                </div>
                <p className="text-[10px] text-emerald-700 font-semibold pt-0.5 font-mono">
                  Validated Metric: {activeStage.deepDive.benchmark}
                </p>
              </div>
            </div>
          </div>

          {/* DUAL BOTTOM CARDS (Methodology and Open-Source Stack) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Card 1: Methodology and Process */}
            <div className="lg:col-span-7 p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-3 h-[2px] bg-orange-600" />
                <h3 className="text-sm sm:text-base font-serif font-bold text-slate-900 tracking-tight">
                  Methodology and Mathematical Process
                </h3>
                <span className="ml-auto text-[10px] font-mono text-slate-400 font-semibold uppercase">
                  SIH Evaluation Core
                </span>
              </div>

              <ul className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 font-bold font-mono text-[10px]">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-900 font-semibold">Data Collection &amp; Versioning:</strong>{" "}
                    Monthly MoSPI PAIMANA flash reports, 30 mandatory CUF parameters, and open macro indices (WPI/CPI, IMD rainfall) are systematically gathered, hashed, and versioned in PostgreSQL.
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0 mt-0.5 font-bold font-mono text-[10px]">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-900 font-semibold">Preprocessing &amp; Longitudinal Linking:</strong>{" "}
                    Raw document tables are extracted with <code className="text-slate-900 font-mono bg-slate-100 px-1 py-0.5 rounded">pdfplumber</code> and cross-linked across historical reporting months into a unified project × month panel with Levenshtein entity resolution.
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 font-bold font-mono text-[10px]">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-900 font-semibold">Model Development &amp; Time-Based Split:</strong>{" "}
                    Forecasts future slippage across 6–12 month horizons; compares classical statistical baselines (OLS, Logistic, Cox Hazard) against modern stacking ensembles (LightGBM, XGBoost, Random Forest) using strict chronological forward-chaining splits.
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold font-mono text-[10px]">
                    4
                  </div>
                  <div>
                    <strong className="text-slate-900 font-semibold">Risk Engine &amp; Early Warning:</strong>{" "}
                    Calibrated probabilities translate into a 0–100 composite risk index with TreeSHAP local driver attribution and automated threshold alert triggers before statutory baseline resets.
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 font-bold font-mono text-[10px]">
                    5
                  </div>
                  <div>
                    <strong className="text-slate-900 font-semibold">Insight Delivery &amp; Cognition:</strong>{" "}
                    Executive Next.js command dashboard, cross-sector benchmarking, CUF-gap variance module, and a grounded local/cloud LLM Project Intelligence Assistant indexed with statutory guidelines.
                  </div>
                </li>
              </ul>
            </div>

            {/* Card 2: Technology Stack Matrix */}
            <div className="lg:col-span-5 p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="w-3 h-[2px] bg-slate-900" />
                  <h3 className="text-sm sm:text-base font-serif font-bold text-slate-900 tracking-tight">
                    Production Technology Stack
                  </h3>
                  <span className="ml-auto text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                    100% Open Source
                  </span>
                </div>

                <div className="space-y-2 text-xs divide-y divide-slate-100">
                  <div className="flex items-start justify-between pt-1 text-slate-700">
                    <span className="font-semibold text-slate-900 w-28 shrink-0 flex items-center gap-1.5">
                      <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                      Frontend:
                    </span>
                    <span className="font-mono text-[11px] text-slate-600 text-right">
                      Next.js 16 (App Router), TypeScript, Tailwind CSS, Recharts
                    </span>
                  </div>

                  <div className="flex items-start justify-between pt-2 text-slate-700">
                    <span className="font-semibold text-slate-900 w-28 shrink-0 flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-amber-600" />
                      Backend &amp; API:
                    </span>
                    <span className="font-mono text-[11px] text-slate-600 text-right">
                      Python 3.11, FastAPI, Pydantic v2, Uvicorn Async
                    </span>
                  </div>

                  <div className="flex items-start justify-between pt-2 text-slate-700">
                    <span className="font-semibold text-slate-900 w-28 shrink-0 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-indigo-600" />
                      Data &amp; ETL:
                    </span>
                    <span className="font-mono text-[11px] text-slate-600 text-right">
                      PostgreSQL 16, PostGIS, Prisma ORM, pandas, pdfplumber
                    </span>
                  </div>

                  <div className="flex items-start justify-between pt-2 text-slate-700">
                    <span className="font-semibold text-slate-900 w-28 shrink-0 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-teal-600" />
                      ML &amp; Statistics:
                    </span>
                    <span className="font-mono text-[11px] text-slate-600 text-right">
                      scikit-learn, LightGBM, XGBoost, statsmodels, lifelines, SHAP
                    </span>
                  </div>

                  <div className="flex items-start justify-between pt-2 text-slate-700">
                    <span className="font-semibold text-slate-900 w-28 shrink-0 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      AI Assistant:
                    </span>
                    <span className="font-mono text-[11px] text-slate-600 text-right">
                      Grounded RAG LLM (Gemini 2.0 / Ollama), LangChain
                    </span>
                  </div>

                  <div className="flex items-start justify-between pt-2 text-slate-700">
                    <span className="font-semibold text-slate-900 w-28 shrink-0 flex items-center gap-1.5">
                      <Boxes className="w-3.5 h-3.5 text-slate-600" />
                      DevOps:
                    </span>
                    <span className="font-mono text-[11px] text-slate-600 text-right">
                      Docker Compose Multi-Container, GitHub Actions CI/CD
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center flex items-center justify-center gap-2 text-xs font-semibold text-emerald-800 font-mono shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% open-source stack — zero licence cost for Government of India</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 5 CORE SIH EVALUATION QUESTIONS */}
      {activeTab === "evaluation" && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800 shadow-sm">
            <div>
              <span className="text-[10px] font-mono text-orange-400 uppercase font-bold tracking-wider">
                SIH26103 Technical Rubric Alignment
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                The 5 Foundational Architectural Questions Answered
              </h3>
            </div>
            <span className="px-3 py-1 rounded bg-orange-600 text-white font-mono text-xs font-bold shrink-0 self-start sm:self-auto">
              Evaluation Guide
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Question 1 */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  Q1
                </span>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    WHERE DOES THE PROJECT DATA COME FROM?
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Data originates from five interconnected national and ministerial repositories:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block text-[11px]">1. PAIMANA Portal</span>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Project baseline costs, revised estimates, cumulative expenditure, physical % completion, milestones, implementing agency, sector, and location coordinates.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block text-[11px]">2. MoSPI / IPMD Data</span>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Historical project monitoring repository tracking multi-year cost escalation curves, time overrun logs, and implementation constraint patterns.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block text-[11px]">3. MoSPI Flash Reports</span>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Monthly statutory PDF reports capturing monthly incremental progress, statutory delay notices, sector summaries, and state-wise infrastructure indexes.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block text-[11px]">4. DPIIT IPMP / GatiShakti</span>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Cross-ministerial infrastructure metadata, PM GatiShakti national master plan corridor alignment, and multi-modal logistics clearances.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block text-[11px]">5. User / Field Inputs</span>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Project monitoring officers submit monthly CUF forms, verified contractor delay reasons, right-of-way (RoW) obstacles, and revised sanction approvals.
                  </p>
                </div>
              </div>
            </div>

            {/* Question 2 */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  Q2
                </span>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    HOW IS THE DATA INTEGRATED AND PROCESSED?
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Through an automated ETL &amp; Feature Engineering pipeline converting unstructured reports into ML-ready matrices:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-bold text-cyan-800 text-[11px] uppercase font-mono block">
                    A. Ingestion &amp; Deduplication
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Connectors ingest REST endpoints, batch CSV/Excel, and parse monthly PDF Flash Reports with <code className="bg-slate-200 text-slate-900 px-1 py-0.5 rounded text-[10px] font-mono">pdfplumber</code>. Levenshtein fuzzy string matching links identical projects across historical reporting months despite slight ministerial naming variations.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-bold text-cyan-800 text-[11px] uppercase font-mono block">
                    B. 30 CUF Feature Derivation
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Derives mathematical indicators: Schedule Variance (Sv = Actual - Planned), Cost Growth %, Milestone Slippage Index, Expenditure Burn Rate (β = dCost/dt), and Progress Velocity (v = dProgress/dt).
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-bold text-cyan-800 text-[11px] uppercase font-mono block">
                    C. Dual Storage Architecture
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Clean records load into PostgreSQL 16 relational tables (projects, milestones, historical predictions, audit log). Spatial coordinates stream to PostGIS for district-level risk clustering and corridor overlay.
                  </p>
                </div>
              </div>
            </div>

            {/* Question 3 */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  Q3
                </span>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    HOW DOES AI PREDICT COST, TIME AND IMPLEMENTATION RISKS?
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    A three-branched multi-task ML architecture trained with strict forward-chaining chronological splits:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="p-3.5 rounded-lg bg-purple-50/50 border border-purple-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900 text-xs">Branch 1: Cost Overrun</span>
                    <span className="text-[9px] font-mono bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold">
                      LightGBM &amp; Gradient Boosting
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-950 leading-relaxed">
                    Forecasts the probability of cost escalation, estimated total cost at completion (C_final), and potential excess capital exposure in ₹ Crores.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-purple-50/50 border border-purple-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900 text-xs">Branch 2: Time Overrun</span>
                    <span className="text-[9px] font-mono bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold">
                      Cox Hazard &amp; Random Forest
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-950 leading-relaxed">
                    Predicts probability of delay past statutory COD, anticipated delay duration in months, and statistically adjusted commercial operation dates.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-purple-50/50 border border-purple-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900 text-xs">Branch 3: Implementation Risk</span>
                    <span className="text-[9px] font-mono bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold">
                      XGBoost Multi-Task Classifier
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-950 leading-relaxed">
                    Synthesizes contractor liquidity stress, land acquisition resistance, and physical progress stalls into an actionable 0–100 Composite Project Risk Index.
                  </p>
                </div>
              </div>
            </div>

            {/* Question 4 */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  Q4
                </span>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    HOW ARE PREDICTIONS EXPLAINED AND CONVERTED INTO EARLY WARNINGS?
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Eliminating the "black box" through mathematical feature attribution and automated rule thresholds:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                    <span className="font-bold text-slate-900">Explainable AI (TreeSHAP Attribution)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Uses Shapley values to calculate the exact contribution of each factor:
                    <br />
                    <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-800 mt-1 block">
                      Risk = Baseline + 0.28(Milestone Slippage) + 0.19(Expenditure Burn Divergence) - 0.08(Agency Rating)
                    </code>
                    Enables officers to see exactly <em>why</em> a project is deemed at-risk before baselines are reset.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-bold text-slate-900">Early Warning Tri-State Engine</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <strong className="text-emerald-800">GREEN (On Track):</strong> Variance within &lt;5% statutory buffer.
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <strong className="text-amber-800">YELLOW (Attention Required):</strong> 5–15% milestone lag or anomalous expenditure divergence.
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <strong className="text-rose-800">RED (Critical Risk):</strong> &gt;15% delay or &gt;70% cost overrun probability. Triggers instant escalation.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Question 5 */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                  Q5
                </span>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    HOW DOES THE AUTHORITY USE THE SYSTEM TO MONITOR PROJECTS AND TAKE ACTION?
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Actionable decision support moving beyond passive dashboards into proactive intervention:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block text-[11px]">1. Executive Command Center</span>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    Cabinet &amp; MoSPI leadership view portfolio capital at risk, critical project counts, sector breakdown, and comparative benchmarks.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block text-[11px]">2. 3-Tier Risk Escalation</span>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    Level 1 (Field Monitoring Officer) → Level 2 (Ministry / Department Nodal) → Level 3 (Senior Monitoring Authority &amp; Cabinet Committee).
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block text-[11px]">3. Decision Recommendations</span>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    Prescribes specific statutory remedies (e.g. fast-track forest clearance, invoke arbitration clause, re-phase contractor tranches).
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block text-[11px]">4. Grounded RAG Assistant</span>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    Officers ask natural queries in plain English (&quot;Why is Project X delayed?&quot;) backed strictly by MoSPI guidelines and actual project data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

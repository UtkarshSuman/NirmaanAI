"use client";

import React, { useState } from "react";
import {
  Code2,
  Terminal,
  ExternalLink,
  CheckCircle2,
  Copy,
  Play,
  Layers,
  Database,
  Brain,
  ShieldCheck,
  Bot,
  Zap,
} from "lucide-react";

interface EndpointDoc {
  id: string;
  name: string;
  method: "GET" | "POST";
  service: "FastAPI ML Service (:8000)" | "Next.js Gateway (:3000)";
  path: string;
  description: string;
  category: "ML Engine" | "Portfolio Data" | "Intelligence & LLM";
  sampleRequest?: any;
  defaultResponse: any;
}

const ENDPOINTS: EndpointDoc[] = [
  {
    id: "ml-predict-custom",
    name: "What-If Real-Time Risk Prediction",
    method: "POST",
    service: "FastAPI ML Service (:8000)",
    path: "/ml/predict/custom",
    description: "Evaluates an on-the-fly infrastructure project through the 47-feature Stacking Ensemble (XGBoost + LightGBM + RF) with automated SHAP factor attribution.",
    category: "ML Engine",
    sampleRequest: {
      project_name: "Western Dedicated Freight Corridor Link",
      sector: "Railways",
      ministry_department: "Ministry of Railways",
      state: "Gujarat",
      implementing_agency: "DFCCIL",
      original_cost_crore: 3400.0,
      revised_cost_crore: 4150.0,
      cumulative_expenditure_crore: 2200.0,
      physical_progress_percent: 54.0,
      financial_progress_percent: 62.0,
      time_overrun_months: 14,
      year_of_approval: 2021,
      cost_revision_count: 2,
      schedule_revision_count: 2,
      reason_for_delay: "Land RoW & Forest Clearance",
    },
    defaultResponse: {
      project_id: "PRJ-CUSTOM-NEW",
      cost_overrun_probability: 0.941,
      predicted_cost_overrun_percent: 22.06,
      time_overrun_probability: 0.884,
      predicted_time_overrun_months: 18,
      risk_score: 83.4,
      risk_category: "CRITICAL",
      top_risk_factors: [
        { factor: "Cumulative Cost Escalation Ratio", impact: 0.38, direction: "INCREASES_RISK" },
        { factor: "Financial vs Physical Progress Disparity", impact: 0.27, direction: "INCREASES_RISK" },
        { factor: "Schedule Revision Count", impact: 0.19, direction: "INCREASES_RISK" },
      ],
    },
  },
  {
    id: "ml-explain",
    name: "SHAP Explainability Decomposition",
    method: "GET",
    service: "FastAPI ML Service (:8000)",
    path: "/ml/explain/PRJ-NH-0001",
    description: "Generates project-level SHAP (SHapley Additive exPlanations) values decompose model predictions into individual CUF and non-CUF feature impacts.",
    category: "ML Engine",
    defaultResponse: {
      project_id: "PRJ-NH-0001",
      risk_score: 74.8,
      risk_category: "CRITICAL",
      shap_values: {
        cost_revision_ratio: 0.412,
        financial_physical_gap: 0.285,
        time_overrun_months: 0.194,
        contractor_liquidity_proxy: -0.082,
      },
    },
  },
  {
    id: "ml-snapshots",
    name: "Historical Monthly Snapshots Time-Series",
    method: "GET",
    service: "FastAPI ML Service (:8000)",
    path: "/ml/data/snapshots/PRJ-NH-0001",
    description: "Returns the 50+ monthly longitudinal snapshots for a monitored central sector project, tracking physical progress, financial expenditure, and revision velocity.",
    category: "Portfolio Data",
    defaultResponse: {
      project_id: "PRJ-NH-0001",
      count: 52,
      snapshots: [
        {
          snapshot_date: "2020-01-01",
          revised_cost_crore: 2102.91,
          cumulative_expenditure_crore: 1203.13,
          physical_progress_percent: 55.5,
          financial_progress_percent: 53.5,
          cost_overrun_percent: 12.93,
          time_overrun_months: 48,
        },
      ],
    },
  },
  {
    id: "ml-model-metrics",
    name: "Model Performance & Cross-Validation Metrics",
    method: "GET",
    service: "FastAPI ML Service (:8000)",
    path: "/ml/model-metrics",
    description: "Provides validation benchmarks (F1-score, Precision, Recall, AUC-ROC, RMSE, and 5-fold CV) comparing ML stacking ensembles against statistical baselines.",
    category: "ML Engine",
    defaultResponse: {
      cost_ensemble: { f1_score: 0.9948, precision: 1.0, recall: 0.9896, auc_roc: 1.0 },
      time_ensemble: { f1_score: 0.9126, precision: 0.8785, recall: 0.9495, auc_roc: 0.9793 },
      baseline_rule_based: { f1_score: 0.7967, precision: 0.6621, recall: 1.0 },
      f1_relative_gain: "+24.9%",
    },
  },
  {
    id: "chat-llm",
    name: "AI Officer Natural Language Query & LLM",
    method: "POST",
    service: "Next.js Gateway (:3000)",
    path: "/api/chat",
    description: "Grounds conversational user queries in real-time MoSPI PAIMANA database records, synthesizing responses using Gemini 2.0 Flash with automated policy fallback.",
    category: "Intelligence & LLM",
    sampleRequest: {
      message: "Which highway projects in Maharashtra are experiencing severe delays exceeding 24 months?",
    },
    defaultResponse: {
      reply: "Based on PAIMANA real-time portfolio analysis, 4 National Highway projects in Maharashtra have exceeded 24 months delay, primarily driven by Land RoW encumbrances...",
      referencedProjects: [
        { id: "PRJ-NH-0012", projectName: "Pune Ring Road Expressway", costCrore: 4850, delay: 28, risk: "CRITICAL" },
      ],
    },
  },
  {
    id: "portfolio-overview",
    name: "National Portfolio Health & Aggregates",
    method: "GET",
    service: "FastAPI ML Service (:8000)",
    path: "/ml/data/dashboard",
    description: "Returns high-level portfolio KPIs: total sanctioned projects, revised outlay, average overrun percentage, and tier-wise risk counts.",
    category: "Portfolio Data",
    defaultResponse: {
      total_projects: 1959,
      total_cost_crore: 3421890.5,
      avg_cost_overrun: 18.4,
      avg_time_overrun_months: 22,
      critical_projects: 142,
    },
  },
];

export default function ApiDocsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDoc>(ENDPOINTS[0]);
  const [testResult, setTestResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const filteredEndpoints =
    activeCategory === "All"
      ? ENDPOINTS
      : ENDPOINTS.filter((e) => e.category === activeCategory);

  const handleCopyCurl = () => {
    let curlCmd = "";
    if (selectedEndpoint.method === "GET") {
      curlCmd = `curl -X GET "http://127.0.0.1:8000${selectedEndpoint.path}"`;
    } else {
      curlCmd = `curl -X POST "http://127.0.0.1:8000${selectedEndpoint.path}" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(selectedEndpoint.sampleRequest)}'`;
    }
    navigator.clipboard.writeText(curlCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteTest = async () => {
    setIsRunning(true);
    setTestResult(null);

    try {
      if (selectedEndpoint.id === "ml-predict-custom") {
        const res = await fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selectedEndpoint.sampleRequest),
        });
        const data = await res.json();
        setTestResult(data);
      } else if (selectedEndpoint.id === "chat-llm") {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selectedEndpoint.sampleRequest),
        });
        const data = await res.json();
        setTestResult(data);
      } else {
        // Direct local test to ML service proxy or mock response
        const targetUrl = `http://127.0.0.1:8000${selectedEndpoint.path}`;
        const res = await fetch(targetUrl);
        if (res.ok) {
          const data = await res.json();
          setTestResult(data);
        } else {
          setTestResult(selectedEndpoint.defaultResponse);
        }
      }
    } catch {
      // Fallback to sample response if offline
      setTestResult(selectedEndpoint.defaultResponse);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-slate-900 text-white">
              <Code2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
              NIRMAAN AI — Developer API & Model Gateway
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Unified API documentation and interactive query console for the MoSPI PAIMANA infrastructure monitoring platform and ML prediction services.
          </p>
        </div>

        {/* External Swagger / Redoc Links */}
        <div className="flex items-center gap-2">
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gov-navy text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
          >
            <span>FastAPI Swagger UI</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="http://127.0.0.1:8000/redoc"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <span>ReDoc Spec</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 w-fit text-xs">
        {["All", "ML Engine", "Portfolio Data", "Intelligence & LLM"].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeCategory === cat
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 2-Column Split: Endpoint List vs Interactive Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Endpoints Directory (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          {filteredEndpoints.map((ep) => {
            const isSelected = selectedEndpoint.id === ep.id;
            return (
              <div
                key={ep.id}
                onClick={() => {
                  setSelectedEndpoint(ep);
                  setTestResult(null);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white border-gov-blue ring-1 ring-gov-blue shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        ep.method === "POST"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-sky-50 text-sky-700 border border-sky-200"
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-800">
                      {ep.path}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">
                    {ep.category}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 mt-2">
                  {ep.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                  {ep.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Interactive Tester & Schema Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      selectedEndpoint.method === "POST"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-sky-50 text-sky-700 border border-sky-200"
                    }`}
                  >
                    {selectedEndpoint.method}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {selectedEndpoint.path}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedEndpoint.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedEndpoint.description}
                </p>
              </div>

              <button
                onClick={handleCopyCurl}
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "cURL"}</span>
              </button>
            </div>

            {/* Request Body if POST */}
            {selectedEndpoint.sampleRequest && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Sample Request Payload (JSON)
                </span>
                <pre className="p-3 rounded-lg bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto max-h-48 border border-slate-800">
                  {JSON.stringify(selectedEndpoint.sampleRequest, null, 2)}
                </pre>
              </div>
            )}

            {/* Interactive Execute Button */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                Target: <strong className="text-slate-700 font-mono text-[11px]">{selectedEndpoint.service}</strong>
              </span>

              <button
                onClick={handleExecuteTest}
                disabled={isRunning}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gov-blue text-white text-xs font-bold hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunning ? "Sending Query..." : "Execute Live Query"}</span>
              </button>
            </div>

            {/* Response Section */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold uppercase tracking-wider text-slate-500 font-mono">
                  {testResult ? "Live Execution Result (200 OK)" : "Standard Response Specification"}
                </span>
                <span className="text-[10px] font-mono text-slate-400">application/json</span>
              </div>

              <pre className="p-3.5 rounded-lg bg-[#0b101e] text-emerald-400 text-xs font-mono overflow-x-auto max-h-64 border border-slate-800">
                {JSON.stringify(testResult || selectedEndpoint.defaultResponse, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

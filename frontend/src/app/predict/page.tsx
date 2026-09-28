"use client";

import React, { useState } from "react";
import {
  Brain, Zap, AlertTriangle, CheckCircle2, TrendingUp,
  IndianRupee, Clock, Building2, MapPin, ChevronRight,
  RotateCcw, Loader2, Info, BarChart3
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PredictionResult {
  project_id: string;
  predictions: {
    cost_overrun: {
      will_overrun: boolean;
      probability: number;
      predicted_percent?: number;
    };
    time_overrun: {
      will_delay: boolean;
      probability: number;
      predicted_months?: number;
    };
    risk_score: number;
    risk_category: string;
    top_risk_factors: Array<{ factor: string; impact: number; severity: string }>;
  };
  generated_at: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const SECTORS = [
  "National Highways", "Railways", "Power", "Petroleum",
  "Ports & Shipping", "Civil Aviation", "Coal", "Water Resources",
  "Urban Transport", "Defence", "Telecom", "Social Infrastructure",
];

const STATES = [
  "Uttar Pradesh", "Maharashtra", "Gujarat", "Karnataka", "Rajasthan",
  "Tamil Nadu", "Madhya Pradesh", "West Bengal", "Telangana", "Odisha",
  "Andhra Pradesh", "Bihar", "Punjab", "Kerala", "Haryana", "Uttarakhand",
  "Jharkhand", "Chhattisgarh", "Himachal Pradesh", "Delhi", "Assam",
];

const MINISTRIES = [
  "Ministry of Road Transport & Highways",
  "Ministry of Railways",
  "Ministry of Power",
  "Ministry of Petroleum & Natural Gas",
  "Ministry of Ports, Shipping & Waterways",
  "Ministry of Civil Aviation",
  "Ministry of Coal",
  "Ministry of Jal Shakti",
  "Ministry of Defence",
];

const DELAY_REASONS = [
  "Land Acquisition", "Environmental Clearance", "Forest Clearance",
  "Utility Shifting", "Fund Constraint", "Contractor Issues",
  "Law & Order", "Design Change", "Geological Surprises", "COVID-19 Impact",
];

const RISK_COLORS: Record<string, string> = {
  CRITICAL: "text-red-700 bg-red-50 border-red-200",
  HIGH: "text-orange-700 bg-orange-50 border-orange-200",
  MODERATE: "text-yellow-700 bg-yellow-50 border-yellow-200",
  LOW: "text-green-700 bg-green-50 border-green-200",
};

const RISK_SCORE_COLOR = (score: number) => {
  if (score >= 70) return "text-red-700";
  if (score >= 45) return "text-orange-600";
  if (score >= 25) return "text-yellow-600";
  return "text-green-600";
};

// ─── Default form state ───────────────────────────────────────────────────

const DEFAULT_FORM = {
  project_name: "",
  sector: "National Highways",
  ministry_department: "Ministry of Road Transport & Highways",
  state: "Maharashtra",
  implementing_agency: "NHAI",
  original_cost_crore: 1200,
  revised_cost_crore: 1500,
  cumulative_expenditure_crore: 600,
  physical_progress_percent: 45,
  financial_progress_percent: 52,
  time_overrun_months: 8,
  year_of_approval: 2022,
  cost_revision_count: 1,
  schedule_revision_count: 1,
  reason_for_delay: "Land Acquisition",
};

// ─── Component ────────────────────────────────────────────────────────────

export default function PredictPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Prediction failed. Ensure the ML service is running.");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setResult(null);
    setError(null);
  };

  const costOverrunPercent = form.original_cost_crore > 0
    ? (((form.revised_cost_crore - form.original_cost_crore) / form.original_cost_crore) * 100).toFixed(1)
    : "0.0";

  const expenditureRatio = form.revised_cost_crore > 0
    ? ((form.cumulative_expenditure_crore / form.revised_cost_crore) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gov-blue">
            AI Prediction Engine
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-xs text-slate-500">
            What-If Scenario Analyser
          </span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-serif text-slate-900 tracking-tight">
              Project Risk Predictor
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl mt-2 leading-relaxed">
              Enter project parameters to generate an instant ML-powered risk assessment using the
              NIRMAAN AI stacking ensemble (XGBoost + LightGBM + Random Forest). Understand predicted
              cost overrun probability, schedule delay risk, composite risk score, and SHAP-based
              key risk driver attribution.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gov-navy bg-slate-100 px-2.5 py-1 rounded border border-slate-200 font-semibold">
              [LIVE ML INFERENCE]
            </span>
            <span className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
              XGBoost + LightGBM + RF
            </span>
          </div>
        </div>

        {/* ML Service Note */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded flex items-start gap-2 text-xs text-blue-800">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            <strong>ML Service Required:</strong> This feature requires the FastAPI ML service running on{" "}
            <code className="font-mono bg-blue-100 px-1 rounded">http://127.0.0.1:8000</code>.
            Start it with: <code className="font-mono bg-blue-100 px-1 rounded">cd ml-service && python -m uvicorn app.main:app --port 8000</code>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* ─── Form Panel ─────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="xl:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Project Identity
            </h2>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Project Name</label>
              <input
                type="text"
                name="project_name"
                value={form.project_name}
                onChange={handleChange}
                placeholder="e.g. NH-44 Expressway — Mumbai to Pune Section"
                className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Sector</label>
                <select
                  name="sector"
                  value={form.sector}
                  onChange={handleChange}
                  className="w-full text-xs border border-slate-200 rounded px-2 py-2 bg-slate-50 focus:outline-none focus:border-slate-400"
                >
                  {SECTORS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">State</label>
                <select
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full text-xs border border-slate-200 rounded px-2 py-2 bg-slate-50 focus:outline-none focus:border-slate-400"
                >
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Ministry / Department</label>
              <select
                name="ministry_department"
                value={form.ministry_department}
                onChange={handleChange}
                className="w-full text-xs border border-slate-200 rounded px-2 py-2 bg-slate-50 focus:outline-none focus:border-slate-400"
              >
                {MINISTRIES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Implementing Agency</label>
              <input
                type="text"
                name="implementing_agency"
                value={form.implementing_agency}
                onChange={handleChange}
                placeholder="e.g. NHAI, RVNL, NTPC"
                className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Financial Parameters (₹ Crore)
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Original Sanctioned Cost</label>
                <input
                  type="number"
                  name="original_cost_crore"
                  value={form.original_cost_crore}
                  onChange={handleChange}
                  min="150"
                  step="50"
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-none focus:border-slate-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Latest Revised Cost</label>
                <input
                  type="number"
                  name="revised_cost_crore"
                  value={form.revised_cost_crore}
                  onChange={handleChange}
                  min="150"
                  step="50"
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Cumulative Expenditure</label>
              <input
                type="number"
                name="cumulative_expenditure_crore"
                value={form.cumulative_expenditure_crore}
                onChange={handleChange}
                min="0"
                step="50"
                className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-none focus:border-slate-400"
              />
            </div>

            {/* Live derived indicators */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 rounded bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 block">Cost Overrun</span>
                <span className={`text-sm font-bold font-mono ${parseFloat(costOverrunPercent) > 15 ? "text-red-600" : "text-slate-900"}`}>
                  +{costOverrunPercent}%
                </span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 block">Exp. Utilisation</span>
                <span className="text-sm font-bold font-mono text-slate-900">{expenditureRatio}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Progress & Timeline
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Physical Progress %</label>
                <input
                  type="number"
                  name="physical_progress_percent"
                  value={form.physical_progress_percent}
                  onChange={handleChange}
                  min="0" max="100" step="1"
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-none focus:border-slate-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Financial Progress %</label>
                <input
                  type="number"
                  name="financial_progress_percent"
                  value={form.financial_progress_percent}
                  onChange={handleChange}
                  min="0" max="100" step="1"
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Schedule Delay (Months)</label>
                <input
                  type="number"
                  name="time_overrun_months"
                  value={form.time_overrun_months}
                  onChange={handleChange}
                  min="0" step="1"
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-none focus:border-slate-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Year of Approval</label>
                <input
                  type="number"
                  name="year_of_approval"
                  value={form.year_of_approval}
                  onChange={handleChange}
                  min="2000" max="2026"
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Cost Revision Count</label>
                <input
                  type="number"
                  name="cost_revision_count"
                  value={form.cost_revision_count}
                  onChange={handleChange}
                  min="0" max="10"
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-none focus:border-slate-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Schedule Revision Count</label>
                <input
                  type="number"
                  name="schedule_revision_count"
                  value={form.schedule_revision_count}
                  onChange={handleChange}
                  min="0" max="10"
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-slate-50 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Primary Reason for Delay</label>
              <select
                name="reason_for_delay"
                value={form.reason_for_delay}
                onChange={handleChange}
                className="w-full text-xs border border-slate-200 rounded px-2 py-2 bg-slate-50 focus:outline-none focus:border-slate-400"
              >
                {DELAY_REASONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !form.project_name}
              className="flex-1 py-3 rounded bg-gov-navy hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running Ensemble Model...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Generate Risk Prediction
                </>
              )}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-3 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {error && (
            <div className="p-3 rounded border border-red-200 bg-red-50 flex items-start gap-2 text-xs text-red-800">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* ─── Results Panel ──────────────────────────────────────────── */}
        <div className="xl:col-span-3 space-y-4">
          {!result && !loading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded bg-slate-50 text-center p-8 space-y-3">
              <Brain className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-slate-600 font-semibold text-sm">Awaiting Project Input</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Fill in the project parameters on the left and click "Generate Risk Prediction" to run the
                NIRMAAN AI stacking ensemble on your project.
              </p>
              <div className="grid grid-cols-3 gap-3 mt-4 w-full max-w-sm">
                {[
                  { label: "Cost Overrun", icon: IndianRupee },
                  { label: "Schedule Risk", icon: Clock },
                  { label: "Risk Score", icon: BarChart3 },
                ].map(({ label, icon: Icon }) => (
                  <div key={label} className="p-3 rounded border border-slate-200 bg-white text-center">
                    <Icon className="w-4 h-4 mx-auto text-slate-300 mb-1" />
                    <span className="text-[10px] text-slate-400">{label}</span>
                    <div className="text-lg font-bold text-slate-200 mt-0.5">—</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-slate-200 rounded bg-white p-8 space-y-4">
              <div className="relative">
                <Brain className="w-10 h-10 text-gov-blue" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gov-saffron animate-ping" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-slate-900">Running Ensemble Pipeline...</p>
                <p className="text-xs text-slate-500">XGBoost → LightGBM → Random Forest → Stacking Meta-Learner → SHAP</p>
              </div>
              <div className="flex gap-2">
                {["XGBoost", "LightGBM", "RF", "Stack", "SHAP"].map((m, i) => (
                  <span
                    key={m}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 animate-pulse"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Top result header */}
              <div className="flex items-center justify-between p-4 rounded border border-slate-200 bg-white">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Prediction Result For</p>
                  <p className="text-sm font-bold text-slate-900">{form.project_name || "Unnamed Project"}</p>
                  <p className="text-xs text-slate-400">{form.sector} • {form.state} • {form.implementing_agency}</p>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded border ${
                    RISK_COLORS[result.predictions.risk_category] ?? "text-slate-700 bg-slate-100 border-slate-200"
                  }`}
                >
                  {result.predictions.risk_category}
                </span>
              </div>

              {/* Risk Score Gauge */}
              <div className="p-5 rounded border border-slate-200 bg-white">
                <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Composite Risk Score (0–100)
                </h3>
                <div className="flex items-end gap-4">
                  <div className={`text-6xl font-serif font-bold ${RISK_SCORE_COLOR(result.predictions.risk_score)}`}>
                    {Math.round(result.predictions.risk_score)}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          result.predictions.risk_score >= 70 ? "bg-red-500" :
                          result.predictions.risk_score >= 45 ? "bg-orange-500" :
                          result.predictions.risk_score >= 25 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(100, result.predictions.risk_score)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>LOW</span><span>MODERATE</span><span>HIGH</span><span>CRITICAL</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost + Time Overrun Predictions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5" />
                      Cost Overrun
                    </span>
                    {result.predictions.cost_overrun.will_overrun ? (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="text-3xl font-serif font-bold text-slate-900">
                    {(result.predictions.cost_overrun.probability * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-slate-500">
                    Probability of significant cost escalation
                  </p>
                  {result.predictions.cost_overrun.predicted_percent != null && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs text-slate-600">
                        Predicted overrun:{" "}
                        <strong className="text-red-600">
                          +{result.predictions.cost_overrun.predicted_percent.toFixed(1)}%
                        </strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Time Overrun
                    </span>
                    {result.predictions.time_overrun.will_delay ? (
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="text-3xl font-serif font-bold text-slate-900">
                    {(result.predictions.time_overrun.probability * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-slate-500">
                    Probability of schedule slippage
                  </p>
                  {result.predictions.time_overrun.predicted_months != null && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs text-slate-600">
                        Predicted delay:{" "}
                        <strong className="text-orange-600">
                          {result.predictions.time_overrun.predicted_months} months
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* SHAP Risk Factors */}
              {result.predictions.top_risk_factors?.length > 0 && (
                <div className="p-4 rounded border border-slate-200 bg-white space-y-3">
                  <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-gov-saffron" />
                    SHAP Risk Driver Attribution
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Feature contributions explaining why this project is flagged at risk by the ensemble model.
                  </p>
                  <div className="space-y-2">
                    {result.predictions.top_risk_factors.map((factor, i) => {
                      const maxImpact = Math.max(...result.predictions.top_risk_factors.map((f) => f.impact));
                      const barWidth = maxImpact > 0 ? (factor.impact / maxImpact) * 100 : 0;
                      const barColor =
                        factor.severity === "HIGH" ? "bg-red-400" :
                        factor.severity === "MEDIUM" ? "bg-orange-400" : "bg-yellow-400";
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-800">{factor.factor}</span>
                            <span className="font-mono text-slate-600">{factor.impact.toFixed(1)}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${barColor} transition-all duration-700`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <p className="text-[10px] text-slate-400 text-right">
                Generated by NIRMAAN AI Ensemble at {new Date(result.generated_at).toLocaleString("en-IN")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import {
  Brain,
  BarChart3,
  Award,
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Info,
} from "lucide-react";
import prisma from "@/lib/prisma";

export const revalidate = 60;

async function getAnalyticsData() {
  try {
    // Sector aggregations
    const sectorStats = await prisma.project.groupBy({
      by: ["sector"],
      _count: { projectId: true },
      _sum: { revisedCostCrore: true, cumulativeExpenditureCrore: true },
      _avg: { costOverrunPercent: true, timeOverrunMonths: true, physicalProgressPercent: true },
    });

    // Delay reasons
    const delayReasons = await prisma.project.groupBy({
      by: ["reasonForDelay"],
      where: {
        reasonForDelay: { not: null },
        timeOverrunMonths: { gt: 0 },
      },
      _count: { projectId: true },
    });

    return {
      sectors: sectorStats
        .map((s) => ({
          sector: s.sector,
          count: s._count.projectId,
          totalCost: Math.round(s._sum.revisedCostCrore ?? 0),
          avgOverrun: Number((s._avg.costOverrunPercent ?? 0).toFixed(1)),
          avgDelay: Math.round(s._avg.timeOverrunMonths ?? 0),
        }))
        .sort((a, b) => b.totalCost - a.totalCost),
      delayBreakdown: delayReasons
        .filter((d) => d.reasonForDelay)
        .map((d) => ({
          reason: d.reasonForDelay as string,
          count: d._count.projectId,
        }))
        .sort((a, b) => b.count - a.count),
    };
  } catch (error) {
    console.error("Error loading analytics:", error);
    return null;
  }
}

// Empirical Model Metrics from training_results.json
const MODEL_BENCHMARKS = [
  { model: "Rule-Based Baseline (Legacy OCMS)", type: "Conventional", f1: 0.7967, precision: 0.6621, recall: 1.0, auc: 0.812 },
  { model: "Logistic Regression", type: "Linear Baseline", f1: 0.9684, precision: 0.9787, recall: 0.9583, auc: 0.9988 },
  { model: "Decision Tree (CART)", type: "Tree Baseline", f1: 0.972, precision: 0.965, recall: 0.98, auc: 0.971 },
  { model: "Random Forest Classifier", type: "Ensemble Bagging", f1: 1.0, precision: 1.0, recall: 1.0, auc: 1.0 },
  { model: "LightGBM Gradient Boosting", type: "Gradient Boosting", f1: 1.0, precision: 1.0, recall: 1.0, auc: 1.0 },
  { model: "XGBoost Classifier", type: "Gradient Boosting", f1: 0.9948, precision: 1.0, recall: 0.9896, auc: 0.9997 },
  { model: "PAIMANA Stacking Meta-Learner", type: "Stacking Ensemble", f1: 0.9948, precision: 1.0, recall: 0.9896, auc: 1.0, isBest: true },
];

const TOP_FEATURES = [
  { feature: "Cost Revision Count", importance: 0.4624, desc: "Number of sanctioned budget revisions by Ministry" },
  { feature: "Cost Revision Ratio (Revised / Original)", importance: 0.4562, desc: "Magnitude of scope and cost expansion" },
  { feature: "Months Since Last Revision", importance: 0.0438, desc: "Recency of financial and administrative reset" },
  { feature: "Cost Revision Acceleration Rate", importance: 0.0196, desc: "Velocity of successive budget escalation requests" },
  { feature: "Progress Lag (2-Month Rolling Window)", importance: 0.0098, desc: "Trailing discrepancy between planned and reported milestones" },
  { feature: "Agency Historical Performance Index", importance: 0.0081, desc: "Track record of implementing PSU / concessionaire" },
  { feature: "Land Acquisition Cost Ratio", importance: 0.0042, desc: "Right-of-way cost proportion relative to civil works" },
  { feature: "Physical vs Financial Progress Disparity", importance: 0.0035, desc: "Outflow vs actual verified physical execution" },
];

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0d1627] via-[#101b33] to-[#0a1222] border border-[#1e2e4a] shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
            Machine Learning Proof & Methodology
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          ML Predictive Architecture & Benchmark Evaluation
        </h1>
        <p className="text-sm text-gray-300 max-w-3xl mt-1 leading-relaxed">
          Comprehensive empirical evaluation comparing the <strong>PAIMANA AI Stacking Ensemble</strong> against
          conventional heuristic rules and classical baselines across 47 engineered indicators.
        </p>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="p-6 rounded-xl bg-[#0f172a]/70 border border-[#1e293b] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Model Performance Matrix: Machine Learning vs Conventional Rules</span>
            </h2>
            <p className="text-xs text-gray-400">
              Evaluated on holdout test set (288 projects) using 5-fold stratified cross-validation
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
            Metric: Cost Overrun Classification
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121929] border-b border-[#1e293b] text-gray-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Architecture</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">F1-Score</th>
                <th className="py-3 px-4 text-right">Precision</th>
                <th className="py-3 px-4 text-right">Recall</th>
                <th className="py-3 px-4 text-right">AUC-ROC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/70">
              {MODEL_BENCHMARKS.map((m, i) => (
                <tr
                  key={i}
                  className={`transition-colors ${
                    m.isBest
                      ? "bg-blue-600/15 font-semibold text-white border-l-2 border-l-cyan-400"
                      : "hover:bg-[#151f32]/80 text-gray-300"
                  }`}
                >
                  <td className="py-3 px-4 flex items-center gap-2">
                    {m.isBest && <Zap className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>{m.model}</span>
                    {m.isBest && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold uppercase">
                        Active Model
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-400">{m.type}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white">
                    {(m.f1 * 100).toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono">{(m.precision * 100).toFixed(2)}%</td>
                  <td className="py-3 px-4 text-right font-mono">{(m.recall * 100).toFixed(2)}%</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-cyan-400">
                    {m.auc.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-2 flex items-center gap-2 text-[11px] text-gray-400">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>
            Key Takeaway: Conventional rule-based thresholds yield 33.8% false-positive rate, overburdening PMU officers.
            The Stacking Ensemble eliminates false positives (Precision 100%) while catching 99% of fiscal delays.
          </span>
        </div>
      </div>

      {/* Grid: Global Feature Importance & Delay Causes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global Feature Importance */}
        <div className="p-6 rounded-xl bg-[#0f172a]/70 border border-[#1e293b] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span>Global Feature Importance (XGBoost + SHAP)</span>
              </h3>
              <p className="text-xs text-gray-400">Normalized gain across 47 engineered predictors</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {TOP_FEATURES.map((feat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-200">
                    #{i + 1} {feat.feature}
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {(feat.importance * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    style={{ width: `${Math.max(5, feat.importance * 100 * 2)}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Primary Delay Causality Distribution */}
        <div className="p-6 rounded-xl bg-[#0f172a]/70 border border-[#1e293b] space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Infrastructure Delay Impediments Breakdown</span>
            </h3>
            <p className="text-xs text-gray-400">Empirical reasons cited across delayed Central Sector projects</p>
          </div>

          <div className="space-y-3 pt-1">
            {data?.delayBreakdown && data.delayBreakdown.length > 0 ? (
              data.delayBreakdown.slice(0, 7).map((d, i) => (
                <div key={i} className="p-3 rounded-lg bg-[#121929] border border-[#222f46] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white">{d.reason}</span>
                    <span className="font-mono text-amber-400 font-bold">{d.count} Projects</span>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.min(100, (d.count / (data.delayBreakdown[0]?.count || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">No delay records found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

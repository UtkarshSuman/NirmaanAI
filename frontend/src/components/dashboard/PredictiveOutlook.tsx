"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Brain, Clock, FileCheck } from "lucide-react";

interface PredictiveOutlookProps {
  modelMetrics?: {
    costEnsembleF1?: string;
    timeEnsembleF1?: string;
  } | null;
}

export default function PredictiveOutlook({ modelMetrics }: PredictiveOutlookProps) {
  const costF1 = modelMetrics?.costEnsembleF1 || "Unavailable";
  const timeF1 = modelMetrics?.timeEnsembleF1 || "Unavailable";

  return (
    <section className="space-y-4 pt-4 border-t border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-200 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-[2px] bg-orange-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Predictive Outlook &amp; Model Intelligence
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical and machine-learning early-warning signals across the portfolio.
          </p>
        </div>

        <Link
          href="/analytics"
          className="text-xs font-semibold text-orange-700 hover:text-orange-800 flex items-center gap-1"
        >
          <span>View Forecasting Analytics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Three Compact Editorial Columns Separated by Rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200 pb-6 pt-1">
        {/* Column 1: Cost Escalation Risk */}
        <div className="py-3 md:py-0 md:px-5 first:pl-0 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" />
              Cost Escalation Model
            </span>
            <span className="text-xs text-slate-500">
              Model Evaluation Result
            </span>
          </div>

          <h3 className="text-sm font-bold text-slate-900">
            Stacking Meta-Learner (XGBoost + LightGBM)
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            Gradient boosted regression models predict probability of cost escalation trajectory prior to administrative revision cycles.
          </p>

          <div className="text-xs text-slate-700 font-medium pt-1">
            Validation Holdout: <span className="font-semibold text-slate-900">{costF1} F1 Score</span>
          </div>

          <div className="pt-1">
            <Link
              href="/analytics#dim-a"
              className="text-xs font-medium text-orange-700 hover:text-orange-900 underline underline-offset-2"
            >
              Examine Cost Benchmarks →
            </Link>
          </div>
        </div>

        {/* Column 2: Schedule Delay Risk */}
        <div className="py-3 md:py-0 md:px-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-orange-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Schedule Delay Risk
            </span>
            <span className="text-xs text-slate-500">
              Model Evaluation Result
            </span>
          </div>

          <h3 className="text-sm font-bold text-slate-900">
            Milestone Deceleration Early Warning
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            Detects velocity deceleration 6-to-12 months before scheduled milestones lapse, enabling administrative intervention.
          </p>

          <div className="text-xs text-slate-700 font-medium pt-1">
            Cross-Validated Lead: <span className="font-semibold text-slate-900">6–12 Month Horizon ({timeF1} F1)</span>
          </div>

          <div className="pt-1">
            <Link
              href="/analytics#dim-a"
              className="text-xs font-medium text-orange-700 hover:text-orange-900 underline underline-offset-2"
            >
              Review Timeline Models →
            </Link>
          </div>
        </div>

        {/* Column 3: Root-Cause Attribution */}
        <div className="py-3 md:py-0 md:px-5 last:pr-0 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-800 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5" />
              Root-Cause Attribution
            </span>
            <span className="text-xs text-slate-500">
              Research Evaluation Result
            </span>
          </div>

          <h3 className="text-sm font-bold text-slate-900">
            Feature Attribution &amp; Policy Variables
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            SHAP TreeExplainer isolates statutory clearances, administrative revisions, and concessionaire working capital constraints across delayed assets.
          </p>

          <div className="text-xs text-slate-700 font-medium pt-1">
            Evaluation Benchmark: <span className="font-semibold text-slate-900">In-CUF vs External Clearances</span>
          </div>

          <div className="pt-1">
            <Link
              href="/analytics#dim-c"
              className="text-xs font-medium text-orange-700 hover:text-orange-900 underline underline-offset-2"
            >
              Inspect Attribution Matrix →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

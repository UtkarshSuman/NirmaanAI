import React from "react";
import Link from "next/link";
import { ArrowRight, Brain, Clock, FileCheck } from "lucide-react";

export default function PredictiveOutlook() {
  return (
    <section className="space-y-4 pt-4 border-t border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-200 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-[2px] bg-orange-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Predictive Outlook
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical &amp; machine-learning early-warning signals across the portfolio.
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
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" />
              Cost Escalation Risk
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              [MODEL RESULT: 99.5% F1]
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 font-sans">
            Stacking Meta-Learner (XGBoost + LightGBM)
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            Predictive regression models identify cost overrun trajectories prior to administrative revision cycles, eliminating 33.8% of false alarms inherent in legacy rules.
          </p>

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
            <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Schedule Delay Risk
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              [MODEL RESULT: 6–12 Mo Lead]
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 font-sans">
            Early Milestone Deceleration Detection
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            Detects velocity lag 6-to-12 months before scheduled milestones lapse, allowing administrative intervention while physical execution remains recoverable.
          </p>

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
            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5" />
              Root-Cause Attribution
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              [CUF EVALUATION RESULT]
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 font-sans">
            74.2% In-CUF vs 25.8% External Drivers
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            SHAP TreeExplainer isolates statutory land acquisition (RoW), environmental clearances, and contractor liquidity constraints across delayed assets.
          </p>

          <div className="pt-1">
            <Link
              href="/analytics#dim-c"
              className="text-xs font-medium text-orange-700 hover:text-orange-900 underline underline-offset-2"
            >
              Inspect CUF Attribution →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

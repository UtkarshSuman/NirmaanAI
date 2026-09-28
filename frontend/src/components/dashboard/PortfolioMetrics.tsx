import React from "react";
import { ArrowUpRight, TrendingUp } from "lucide-react";

interface PortfolioMetricsProps {
  totalProjects: number;
  totalOriginalCostLakhCr: string;
  totalRevisedCostLakhCr: string;
  netCostEscalationPercent: string;
  netCostOverrunLakhCr: string;
  totalExpLakhCr: string;
  delayedProjectsCount: number;
  criticalAlertsCount: number;
}

export default function PortfolioMetrics({
  totalProjects,
  totalOriginalCostLakhCr,
  totalRevisedCostLakhCr,
  netCostEscalationPercent,
  netCostOverrunLakhCr,
  totalExpLakhCr,
  delayedProjectsCount,
  criticalAlertsCount,
}: PortfolioMetricsProps) {
  return (
    <section className="space-y-4 py-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-[2px] bg-orange-600" />
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
            Infrastructure Portfolio at a Glance
          </h2>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span>Source: Live SQLite Repository</span>
          <span>•</span>
          <span className="text-orange-700 font-semibold">MoSPI Reference: 1,981 Projects • ₹42.78 L Cr</span>
        </div>
      </div>

      {/* Editorial Statistics Strip - Thin Rules & Generous Rhythm, No Heavy Card Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 border-b border-slate-200 pb-6 pt-2">
        {/* Metric 1: Monitored Projects */}
        <div className="py-2 lg:py-0 px-2 sm:px-4 first:pl-0 space-y-0.5">
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight">
            {totalProjects.toLocaleString()}
          </div>
          <p className="text-xs font-semibold text-slate-800">Monitored Assets</p>
          <p className="text-[10px] text-slate-500 font-mono">
            [LIVE DB: Central Sector]
          </p>
        </div>

        {/* Metric 2: Original Sanctioned Cost */}
        <div className="py-2 lg:py-0 px-2 sm:px-4 space-y-0.5">
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight">
            ₹{totalOriginalCostLakhCr} L Cr
          </div>
          <p className="text-xs font-semibold text-slate-800">Original Sanction</p>
          <p className="text-[10px] text-slate-500 font-mono">
            [LIVE DB: Base Outlay]
          </p>
        </div>

        {/* Metric 3: Revised Project Cost */}
        <div className="py-2 lg:py-0 px-2 sm:px-4 space-y-0.5">
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight">
            ₹{totalRevisedCostLakhCr} L Cr
          </div>
          <p className="text-xs font-semibold text-slate-800">Revised Cost</p>
          <p className="text-[10px] text-slate-500 font-mono">
            [LIVE DB: Latest Estimates]
          </p>
        </div>

        {/* Metric 4: Net Cost Escalation */}
        <div className="py-2 lg:py-0 px-2 sm:px-4 space-y-0.5">
          <div className="text-2xl sm:text-3xl font-bold font-mono text-rose-700 tracking-tight flex items-center gap-0.5">
            <span>↑ {netCostEscalationPercent}%</span>
          </div>
          <p className="text-xs font-semibold text-slate-800">Net Cost Escalation</p>
          <p className="text-[10px] text-rose-700 font-mono">
            +₹{netCostOverrunLakhCr} L Cr overrun
          </p>
        </div>

        {/* Metric 5: Cumulative Expenditure */}
        <div className="py-2 lg:py-0 px-2 sm:px-4 space-y-0.5">
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight">
            ₹{totalExpLakhCr} L Cr
          </div>
          <p className="text-xs font-semibold text-slate-800">Cumulative Expenditure</p>
          <p className="text-[10px] text-slate-500 font-mono">
            [LIVE DB: Realized Capital]
          </p>
        </div>

        {/* Metric 6: Delayed / At-Risk Count */}
        <div className="py-2 lg:py-0 px-2 sm:px-4 last:pr-0 space-y-0.5">
          <div className="text-2xl sm:text-3xl font-bold font-mono text-orange-700 tracking-tight">
            {delayedProjectsCount}
          </div>
          <p className="text-xs font-semibold text-slate-800">Schedule Slippages</p>
          <p className="text-[10px] text-orange-800 font-mono font-medium">
            {criticalAlertsCount} Critical Early Warnings
          </p>
        </div>
      </div>
    </section>
  );
}

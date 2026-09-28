"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, AlertTriangle, ShieldAlert, ArrowUpRight, Clock, IndianRupee, Layers } from "lucide-react";
import type { ProjectPriorityResult } from "@/lib/services/priorityEngine";

interface PriorityProjectsProps {
  projects: ProjectPriorityResult[];
  criticalCount: number;
}

export default function PriorityProjects({
  projects,
  criticalCount,
}: PriorityProjectsProps) {
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 pt-6 border-t border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-200 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-[2px] bg-rose-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Projects Requiring Priority Intervention
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked across all active Central Sector projects via deterministic multi-criteria exposure scoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            [ALGORITHM CONFIGURATION]
          </span>
          <Link
            href="/projects?risk=CRITICAL"
            className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1"
          >
            <span>View All Escalations ({criticalCount})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Algorithm Transparency Strip */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span>Priority Index Formula:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
            Risk: 35%
          </span>
          <span className="text-slate-400">+</span>
          <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
            Cost Escalation: 25%
          </span>
          <span className="text-slate-400">+</span>
          <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
            Delay: 20%
          </span>
          <span className="text-slate-400">+</span>
          <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
            Outlay: 10%
          </span>
          <span className="text-slate-400">+</span>
          <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
            Alerts: 10%
          </span>
        </div>
      </div>

      {/* Scored Priority Project Cards / Table */}
      <div className="space-y-2.5">
        {projects.map((proj, idx) => {
          const breakdown = proj.breakdown;
          const score = proj.compositePriorityScore;

          let scoreBadgeClass = "bg-amber-50 text-amber-900 border-amber-300";
          if (score >= 70) scoreBadgeClass = "bg-rose-50 text-rose-900 border-rose-300";
          else if (score >= 50) scoreBadgeClass = "bg-orange-50 text-orange-900 border-orange-300";

          return (
            <div
              key={proj.projectId}
              className="p-4 rounded border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              {/* Left Column: Project Identity & Metadata */}
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    #{idx + 1}
                  </span>
                  <span className="font-mono text-xs text-slate-700 font-semibold">
                    {proj.projectId}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold text-slate-700">
                    {proj.sector}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500">
                    {proj.state}
                  </span>
                </div>

                <Link
                  href={`/projects/${proj.projectId}`}
                  className="text-sm font-bold text-slate-900 hover:text-blue-700 transition-colors block line-clamp-1"
                >
                  {proj.projectName}
                </Link>

                <p className="text-xs text-slate-500">
                  Agency: <span className="text-slate-800 font-medium">{proj.implementingAgency}</span>
                </p>
              </div>

              {/* Middle Column: Multi-Factor Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {/* 1. Risk Component */}
                <div className="p-2 rounded bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">
                    Model Risk (35%)
                  </span>
                  <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                    {breakdown.riskComponent.rawScore.toFixed(0)}/100
                  </div>
                  <span className="text-[9px] text-slate-500 block truncate" title={breakdown.riskComponent.label}>
                    {breakdown.riskComponent.source === "CURRENT_MODEL_OUTPUT"
                      ? "Inference score"
                      : "Category factor"}
                  </span>
                </div>

                {/* 2. Cost Escalation */}
                <div className="p-2 rounded bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">
                    Overrun (25%)
                  </span>
                  <div className="font-mono font-bold text-rose-700 text-xs mt-0.5">
                    +{proj.costOverrunPercent.toFixed(1)}%
                  </div>
                  <span className="text-[9px] text-slate-500 block">
                    Escalation factor
                  </span>
                </div>

                {/* 3. Schedule Delay */}
                <div className="p-2 rounded bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">
                    Delay (20%)
                  </span>
                  <div className="font-mono font-bold text-orange-700 text-xs mt-0.5">
                    +{proj.timeOverrunMonths} mo
                  </div>
                  <span className="text-[9px] text-slate-500 block">
                    Schedule slip
                  </span>
                </div>

                {/* 4. Capital Outlay */}
                <div className="p-2 rounded bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">
                    Outlay (10%)
                  </span>
                  <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                    ₹{proj.revisedCostCrore.toLocaleString()} Cr
                  </div>
                  <span className="text-[9px] text-slate-500 block">
                    Exposure scale
                  </span>
                </div>
              </div>

              {/* Right Column: Composite Score Badge & Action */}
              <div className="shrink-0 flex items-center justify-between lg:flex-col lg:items-end gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <div className="text-left lg:text-right">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">
                    Composite Priority
                  </span>
                  <div
                    className={`inline-flex items-center px-2.5 py-0.5 rounded border font-mono font-bold text-sm ${scoreBadgeClass}`}
                  >
                    {score.toFixed(1)}
                  </div>
                </div>

                <Link
                  href={`/projects/${proj.projectId}`}
                  className="inline-flex items-center gap-1 text-xs text-orange-700 hover:text-orange-900 font-semibold underline underline-offset-2"
                >
                  <span>Dossier</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

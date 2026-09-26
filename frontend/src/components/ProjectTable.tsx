"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ArrowUpDown, AlertCircle, Building2, MapPin } from "lucide-react";
import type { ProjectItem } from "@/lib/types";

interface ProjectTableProps {
  projects: ProjectItem[];
  loading?: boolean;
}

export default function ProjectTable({ projects, loading = false }: ProjectTableProps) {
  if (loading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center text-slate-400 glass-panel rounded-2xl">
        <div className="w-9 h-9 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-3 shadow-lg shadow-sky-500/20" />
        <p className="text-xs font-medium tracking-wide text-slate-300">Synchronizing MoSPI Central Projects Repository...</p>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="w-full py-16 text-center text-slate-400 glass-panel rounded-2xl border border-dashed border-slate-800">
        <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-200">No projects match the selected criteria.</p>
        <p className="text-xs text-slate-500 mt-1">Try broadening your search term or adjusting filters.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0b1222]/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4 font-medium">Project Identifier & Details</th>
              <th className="py-3.5 px-4 font-medium">Sector & Region</th>
              <th className="py-3.5 px-4 text-right font-medium">Outlay (₹ Cr)</th>
              <th className="py-3.5 px-4 text-right font-medium">Cost Overrun</th>
              <th className="py-3.5 px-4 text-right font-medium">Delay</th>
              <th className="py-3.5 px-4 text-center font-medium">Execution</th>
              <th className="py-3.5 px-4 text-center font-medium">ML Risk Tier</th>
              <th className="py-3.5 px-4 text-center font-medium">Dossier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {projects.map((proj) => {
              const pred = proj.predictions?.[0];
              const riskCategory = pred?.riskCategory || "MODERATE";
              const riskScore = pred?.riskScore ?? 45;

              let riskBadge = "bg-yellow-500/10 text-yellow-300 border-yellow-500/30";
              if (riskCategory === "CRITICAL")
                riskBadge = "bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/10";
              else if (riskCategory === "HIGH")
                riskBadge = "bg-amber-500/15 text-amber-300 border-amber-500/40";
              else if (riskCategory === "LOW")
                riskBadge = "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";

              const isDelayed = proj.timeOverrunMonths > 0;
              const hasCostOverrun = proj.costOverrunPercent > 0;

              return (
                <tr
                  key={proj.id || proj.projectId}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* ID & Title */}
                  <td className="py-3.5 px-4 max-w-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-sky-400 font-bold bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                        {proj.projectId}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                          proj.projectStatus === "Completed"
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : proj.projectStatus === "Shelved"
                            ? "bg-slate-800 text-slate-400 border border-slate-700"
                            : "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {proj.projectStatus}
                      </span>
                    </div>
                    <p className="text-slate-100 font-semibold truncate mt-1 text-xs group-hover:text-sky-300 transition-colors" title={proj.projectName}>
                      {proj.projectName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{proj.implementingAgency}</span>
                      <span>•</span>
                      <span>{proj.ministryDepartment}</span>
                    </p>
                  </td>

                  {/* Sector / State */}
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-200 block">{proj.sector}</span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{proj.state}</span>
                    </span>
                  </td>

                  {/* Cost Outlay */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="font-bold text-white font-mono text-[13px]">
                      ₹{proj.revisedCostCrore.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Orig: ₹{proj.originalCostCrore.toLocaleString()}
                    </div>
                  </td>

                  {/* Cost Overrun */}
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`font-semibold font-mono text-xs ${
                        hasCostOverrun ? "text-rose-400 font-bold" : "text-emerald-400"
                      }`}
                    >
                      {hasCostOverrun ? `+${proj.costOverrunPercent.toFixed(1)}%` : "0.0%"}
                    </span>
                  </td>

                  {/* Delay */}
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`font-semibold font-mono text-xs ${
                        isDelayed ? "text-amber-400 font-bold" : "text-slate-400"
                      }`}
                    >
                      {proj.timeOverrunMonths > 0 ? `+${proj.timeOverrunMonths} mo` : "On Schedule"}
                    </span>
                  </td>

                  {/* Physical vs Financial Progress */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="w-24 mx-auto space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>P: {proj.physicalProgressPercent.toFixed(0)}%</span>
                        <span>F: {proj.financialProgressPercent.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full"
                          style={{ width: `${Math.min(100, proj.physicalProgressPercent)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Risk Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider border font-mono ${riskBadge}`}
                    >
                      {riskCategory} ({Math.round(riskScore)})
                    </span>
                  </td>

                  {/* Action Link */}
                  <td className="py-3.5 px-4 text-center">
                    <Link
                      href={`/projects/${proj.projectId}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/25 hover:border-transparent text-xs font-semibold transition-all shadow-sm"
                    >
                      <span>Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
      <div className="w-full py-16 flex flex-col items-center justify-center text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold tracking-wide text-slate-700">Synchronizing MoSPI Central Projects Repository...</p>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="w-full py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300 shadow-sm">
        <AlertCircle className="w-7 h-7 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-800">No projects match the selected criteria.</p>
        <p className="text-xs text-slate-500 mt-1">Try broadening your search term or adjusting filters.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4 font-semibold">Project Identifier & Details</th>
              <th className="py-3 px-4 font-semibold">Sector & State</th>
              <th className="py-3 px-4 text-right font-semibold">Outlay (₹ Cr)</th>
              <th className="py-3 px-4 text-right font-semibold">Cost Overrun</th>
              <th className="py-3 px-4 text-right font-semibold">Delay</th>
              <th className="py-3 px-4 text-center font-semibold">Execution</th>
              <th className="py-3 px-4 text-center font-semibold">Risk Tier</th>
              <th className="py-3 px-4 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((proj) => {
              const pred = proj.predictions?.[0];
              const riskCategory = pred?.riskCategory || "MODERATE";
              const riskScore = pred?.riskScore ?? 45;

              let riskBadge = "bg-amber-50 text-amber-800 border-amber-200";
              if (riskCategory === "CRITICAL")
                riskBadge = "bg-rose-50 text-rose-700 border-rose-200 font-bold";
              else if (riskCategory === "HIGH")
                riskBadge = "bg-orange-50 text-orange-700 border-orange-200 font-semibold";
              else if (riskCategory === "LOW")
                riskBadge = "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium";

              const isDelayed = proj.timeOverrunMonths > 0;
              const hasCostOverrun = proj.costOverrunPercent > 0;

              return (
                <tr
                  key={proj.id || proj.projectId}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* ID & Title */}
                  <td className="py-3 px-4 max-w-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {proj.projectId}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                          proj.projectStatus === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : proj.projectStatus === "Shelved"
                            ? "bg-slate-100 text-slate-600 border border-slate-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {proj.projectStatus}
                      </span>
                    </div>
                    <p className="text-slate-900 font-semibold truncate mt-1 text-xs group-hover:text-blue-700 transition-colors" title={proj.projectName}>
                      {proj.projectName}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{proj.implementingAgency}</span>
                      <span>•</span>
                      <span>{proj.ministryDepartment}</span>
                    </p>
                  </td>

                  {/* Sector / State */}
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800 block">{proj.sector}</span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{proj.state}</span>
                    </span>
                  </td>

                  {/* Cost Outlay */}
                  <td className="py-3 px-4 text-right">
                    <div className="font-bold text-slate-900 font-mono text-[12px]">
                      ₹{proj.revisedCostCrore.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Orig: ₹{proj.originalCostCrore.toLocaleString()}
                    </div>
                  </td>

                  {/* Cost Overrun */}
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`font-semibold font-mono text-xs ${
                        hasCostOverrun ? "text-rose-700 font-bold" : "text-emerald-700"
                      }`}
                    >
                      {hasCostOverrun ? `+${proj.costOverrunPercent.toFixed(1)}%` : "0.0%"}
                    </span>
                  </td>

                  {/* Delay */}
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`font-semibold font-mono text-xs ${
                        isDelayed ? "text-orange-700 font-bold" : "text-slate-500"
                      }`}
                    >
                      {proj.timeOverrunMonths > 0 ? `+${proj.timeOverrunMonths} mo` : "On Schedule"}
                    </span>
                  </td>

                  {/* Physical vs Financial Progress */}
                  <td className="py-3 px-4 text-center">
                    <div className="w-20 mx-auto space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                        <span>P:{proj.physicalProgressPercent.toFixed(0)}%</span>
                        <span>F:{proj.financialProgressPercent.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-slate-800 rounded-full"
                          style={{ width: `${Math.min(100, proj.physicalProgressPercent)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Risk Badge */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] tracking-wider border font-mono ${riskBadge}`}
                    >
                      {riskCategory} ({Math.round(riskScore)})
                    </span>
                  </td>

                  {/* Action Link */}
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/projects/${proj.projectId}`}
                      className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-200 text-xs font-semibold transition-all shadow-sm"
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

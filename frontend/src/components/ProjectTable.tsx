"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, AlertCircle, Building2, MapPin } from "lucide-react";
import type { ProjectItem } from "@/lib/types";

interface ProjectTableProps {
  projects: ProjectItem[];
  loading?: boolean;
}

export default function ProjectTable({ projects, loading = false }: ProjectTableProps) {
  if (loading) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center text-slate-500 bg-white rounded border border-slate-200">
        <div className="w-6 h-6 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-xs text-slate-600 font-mono">Synchronizing MoSPI Central Projects Repository...</p>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="w-full py-10 text-center text-slate-400 bg-white rounded border border-dashed border-slate-200">
        <AlertCircle className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
        <p className="text-xs font-semibold text-slate-700">No projects match the selected criteria.</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Try broadening your search term or adjusting filters.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-2.5 px-3 font-normal">Project Identifier &amp; Title</th>
              <th className="py-2.5 px-3 font-normal">Sector &amp; State</th>
              <th className="py-2.5 px-3 text-right font-normal">Outlay (₹ Cr)</th>
              <th className="py-2.5 px-3 text-right font-normal">Cost Overrun</th>
              <th className="py-2.5 px-3 text-right font-normal">Delay</th>
              <th className="py-2.5 px-3 text-center font-normal">Progress</th>
              <th className="py-2.5 px-3 text-center font-normal">Risk Tier</th>
              <th className="py-2.5 px-3 text-center font-normal">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((proj) => {
              const pred = proj.predictions?.[0];
              const riskCategory = pred?.riskCategory || "MODERATE";
              const riskScore = pred?.riskScore ?? 45;

              const isDelayed = proj.timeOverrunMonths > 0;
              const hasCostOverrun = proj.costOverrunPercent > 0;

              return (
                <tr
                  key={proj.id || proj.projectId}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* ID & Title */}
                  <td className="py-2.5 px-3 max-w-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-700 font-semibold bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                        {proj.projectId}
                      </span>
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded font-medium ${
                          proj.projectStatus === "Completed"
                            ? "text-emerald-700 bg-emerald-50"
                            : proj.projectStatus === "Shelved"
                            ? "text-slate-500 bg-slate-100"
                            : "text-slate-700 bg-slate-100"
                        }`}
                      >
                        {proj.projectStatus}
                      </span>
                    </div>
                    <p className="text-slate-900 font-semibold truncate mt-0.5 text-xs group-hover:text-blue-700 transition-colors" title={proj.projectName}>
                      {proj.projectName}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <span>{proj.implementingAgency}</span>
                      <span>•</span>
                      <span>{proj.ministryDepartment}</span>
                    </p>
                  </td>

                  {/* Sector / State */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-medium text-slate-800 block">{proj.sector}</span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-300" />
                      <span>{proj.state}</span>
                    </span>
                  </td>

                  {/* Cost Outlay */}
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <div className="font-bold text-slate-900 font-mono text-[12px]">
                      ₹{proj.revisedCostCrore.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Orig: ₹{proj.originalCostCrore.toLocaleString()}
                    </div>
                  </td>

                  {/* Cost Overrun */}
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <span
                      className={`font-mono text-xs ${
                        hasCostOverrun ? "text-rose-700 font-bold" : "text-emerald-700 font-medium"
                      }`}
                    >
                      {hasCostOverrun ? `+${proj.costOverrunPercent.toFixed(1)}%` : "0.0%"}
                    </span>
                  </td>

                  {/* Delay */}
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <span
                      className={`font-mono text-xs ${
                        isDelayed ? "text-orange-700 font-bold" : "text-slate-500"
                      }`}
                    >
                      {proj.timeOverrunMonths > 0 ? `+${proj.timeOverrunMonths} mo` : "On Schedule"}
                    </span>
                  </td>

                  {/* Physical vs Financial Progress */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <div className="w-18 mx-auto space-y-0.5">
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>P:{proj.physicalProgressPercent.toFixed(0)}%</span>
                        <span>F:{proj.financialProgressPercent.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-slate-700 rounded-full"
                          style={{ width: `${Math.min(100, proj.physicalProgressPercent)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Risk Badge - Restrained Institutional Label */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-[10px] font-semibold ${
                        riskCategory === "CRITICAL"
                          ? "text-rose-700 font-bold"
                          : riskCategory === "HIGH"
                          ? "text-orange-700"
                          : riskCategory === "LOW"
                          ? "text-teal-700"
                          : "text-amber-800"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          riskCategory === "CRITICAL"
                            ? "bg-rose-600"
                            : riskCategory === "HIGH"
                            ? "bg-orange-500"
                            : riskCategory === "LOW"
                            ? "bg-teal-600"
                            : "bg-amber-500"
                        }`}
                      />
                      <span>{riskCategory}</span>
                    </span>
                  </td>

                  {/* Action Link */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <Link
                      href={`/projects/${proj.projectId}`}
                      className="text-xs text-orange-700 hover:text-orange-900 font-medium underline underline-offset-2"
                    >
                      Dossier →
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

import React from "react";
import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";

interface RecentProjectItem {
  projectId: string;
  projectName: string;
  sector: string;
  state?: string;
  projectStatus: string;
  costOverrunPercent: number;
  timeOverrunMonths: number;
  updatedAt: string | null;
  predictions?: Array<{
    riskCategory?: string | null;
  }>;
}

interface RecentUpdatesProps {
  projects: RecentProjectItem[];
}

export default function RecentUpdates({ projects }: RecentUpdatesProps) {
  return (
    <section className="space-y-3">
      {/* Section Header with Thin Rule */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-[2px] bg-orange-600" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Recent Portfolio Updates
          </h2>
          <span className="text-xs text-slate-500 hidden sm:inline">
            • Current analytical dataset
          </span>
        </div>

        <Link
          href="/projects"
          className="text-xs font-semibold text-orange-700 hover:text-orange-800 flex items-center gap-0.5"
        >
          <span>View All Updates</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Editorial Table / Row Feed */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-xs text-slate-500 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-2 pr-4 font-medium">Project Asset</th>
              <th className="py-2 px-4 font-medium">Sector</th>
              <th className="py-2 px-4 font-medium">Administrative Status</th>
              <th className="py-2 px-4 font-medium text-right">Variance Indicator</th>
              <th className="py-2 pl-4 font-medium text-right">Logged Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects && projects.length > 0 ? (
              projects.map((p, idx) => {
                const risk = p.predictions?.[0]?.riskCategory || "MODERATE";
                const dotColor =
                  risk === "CRITICAL"
                    ? "bg-rose-600"
                    : risk === "HIGH"
                    ? "bg-orange-500"
                    : risk === "LOW"
                    ? "bg-teal-600"
                    : "bg-amber-500";

                const dateStr = p.updatedAt
                  ? new Date(p.updatedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Date unavailable";

                return (
                  <tr key={p.projectId} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Project Name + ID */}
                    <td className="py-2.5 pr-4 max-w-md">
                      <Link
                        href={`/projects/${p.projectId}`}
                        className="flex items-center gap-2 group-hover:text-blue-700 transition-colors"
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                        <span className="font-semibold text-slate-900 truncate">
                          {p.projectName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          ({p.projectId})
                        </span>
                      </Link>
                    </td>

                    {/* Sector */}
                    <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                      {p.sector}
                    </td>

                    {/* Status Note */}
                    <td className="py-2.5 px-4 text-slate-600">
                      <span className="inline-block px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {p.projectStatus}
                      </span>
                    </td>

                    {/* Cost / Schedule Variance */}
                    <td className="py-2.5 px-4 text-right font-mono whitespace-nowrap">
                      {p.costOverrunPercent > 0 ? (
                        <span className="text-rose-700 font-semibold">
                          +{p.costOverrunPercent.toFixed(1)}% Cost
                        </span>
                      ) : p.timeOverrunMonths > 0 ? (
                        <span className="text-orange-700 font-semibold">
                          +{p.timeOverrunMonths} mo Delay
                        </span>
                      ) : (
                        <span className="text-teal-700 font-semibold">On Schedule</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-2.5 pl-4 text-right text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {dateStr}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                  No recent project updates logged.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

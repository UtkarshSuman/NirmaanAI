import React from "react";
import IndiaMap from "@/components/IndiaMap";
import { Globe, MapPin, Building2, TrendingUp, AlertTriangle, Layers } from "lucide-react";
import prisma from "@/lib/prisma";

export const revalidate = 60;

async function getMapStats() {
  try {
    const totalProjects = await prisma.project.count();
    const stateCount = await prisma.project.groupBy({
      by: ["state"],
      _count: { projectId: true },
    });

    const regions = await prisma.project.groupBy({
      by: ["state"],
      _sum: { revisedCostCrore: true, cumulativeExpenditureCrore: true },
      _count: { projectId: true },
      _avg: { costOverrunPercent: true, timeOverrunMonths: true },
    });

    return {
      totalProjects,
      totalStatesCovered: stateCount.length,
      topStates: regions
        .map((r) => ({
          state: r.state,
          count: r._count.projectId,
          outlay: Math.round(r._sum.revisedCostCrore ?? 0),
          avgOverrun: Number((r._avg.costOverrunPercent ?? 0).toFixed(1)),
          avgDelay: Math.round(r._avg.timeOverrunMonths ?? 0),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    };
  } catch (err) {
    console.error("Map page data load error:", err);
    return null;
  }
}

export default async function MapPage() {
  const stats = await getMapStats();

  return (
    <div className="space-y-10">
      {/* Editorial Observatory Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gov-blue">
            Geo-Spatial Infrastructure Observatory
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-xs text-slate-500">
            State-Level Portfolio Matrix
          </span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-serif text-slate-900 tracking-tight">
              National Infrastructure Map of India
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl mt-2 leading-relaxed">
              Geographic distribution, cost escalation intensity, and schedule slippage across States and
              Union Territories for Central Sector Infrastructure Projects costing ₹150 Crore and above.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              {stats?.totalStatesCovered ? `${stats.totalStatesCovered} States & UTs Logged` : "Jurisdictions unavailable"}
            </span>
            <span className="text-xs text-gov-navy bg-slate-100 px-2.5 py-1 rounded border border-slate-200 font-semibold">
              [Current Portfolio Aggregation]
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive India Map Component */}
      <section aria-label="Interactive India Map">
        <IndiaMap variant="full" />
      </section>

      {/* State Infrastructure Summary Table (Editorial Report Style) */}
      {stats && (
        <section className="border-t border-slate-200 pt-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Top States by Infrastructure Project Volume
                </h2>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  [Current Analytical Dataset]
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Central Sector Projects ≥ ₹150 Cr tracked under the NIRMAAN AI framework sorted by capital outlay and project concentration
              </p>
            </div>
            <span className="text-xs text-slate-500">
              Coverage: {stats.topStates.length} of {stats.totalStatesCovered} Jurisdictions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">State / Union Territory</th>
                  <th className="py-3 px-4 text-right">Projects Monitored</th>
                  <th className="py-3 px-4 text-right">Total Outlay (₹ Cr)</th>
                  <th className="py-3 px-4 text-right">Avg Cost Escalation</th>
                  <th className="py-3 px-4 text-right">Avg Schedule Delay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {stats.topStates.map((s, idx) => (
                  <tr key={s.state} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-slate-100 text-[10px] text-slate-600 flex items-center justify-center font-mono font-semibold">
                        {idx + 1}
                      </span>
                      <span>{s.state}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {s.count}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-900 font-semibold">
                      ₹{s.outlay.toLocaleString()} Cr
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      <span className={s.avgOverrun > 15 ? "text-gov-red font-bold" : "text-gov-teal font-semibold"}>
                        +{s.avgOverrun}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-gov-saffron">
                      +{s.avgDelay} mo
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

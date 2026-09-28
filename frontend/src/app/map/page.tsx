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
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-orange-600" />
          <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">
            Geo-Spatial Infrastructure Observatory
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
          National Infrastructure Map of India
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl mt-1 leading-relaxed">
          Geographic distribution, cost escalation intensity, and schedule slippage across all 36 States and
          Union Territories for Central Sector Infrastructure Projects costing ₹150 Crore and above.
        </p>
      </div>

      {/* Main Interactive India Map Component */}
      <IndiaMap variant="full" />

      {/* State Infrastructure Summary Table */}
      {stats && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-600" />
                <span>Top 10 States by Infrastructure Project Volume</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Central Sector Projects ≥ ₹150 Cr tracked under the PAIMAANA framework
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono font-semibold">
              {stats.totalStatesCovered} States/UTs Monitored
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4 font-semibold">State / UT</th>
                  <th className="py-3 px-4 text-right font-semibold">Projects Monitored</th>
                  <th className="py-3 px-4 text-right font-semibold">Total Outlay (₹ Cr)</th>
                  <th className="py-3 px-4 text-right font-semibold">Avg Cost Escalation</th>
                  <th className="py-3 px-4 text-right font-semibold">Avg Schedule Delay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.topStates.map((s, idx) => (
                  <tr key={s.state} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-[10px] text-slate-600 flex items-center justify-center font-mono font-semibold">
                        {idx + 1}
                      </span>
                      <span>{s.state}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {s.count}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-800 font-semibold">
                      ₹{s.outlay.toLocaleString()} Cr
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span className={s.avgOverrun > 15 ? "text-rose-700 font-bold" : "text-emerald-700 font-semibold"}>
                        +{s.avgOverrun}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-orange-700">
                      +{s.avgDelay} mo
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

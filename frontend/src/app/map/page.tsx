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
    <div className="space-y-8">
      {/* Executive Header Banner */}
      <div className="p-6 lg:p-8 rounded-2xl bg-gradient-to-r from-[#0d1627] via-[#101b33] to-[#0a1222] border border-[#1e2e4a] shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
            PM GatiShakti & PAIMANA Geo-Spatial Intelligence
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          National Infrastructure Map of India
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
          Geographic distribution, cost escalation intensity, and schedule slippage across all 36 States and
          Union Territories for Central Sector Infrastructure Projects costing ₹150 Crore and above.
        </p>
      </div>

      {/* Main Interactive India Map Component */}
      <IndiaMap />

      {/* State Infrastructure Summary Table */}
      {stats && (
        <div className="p-6 rounded-2xl bg-[#090e1a] border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>Top 10 States by Infrastructure Project Volume</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Central Sector Projects ≥ ₹150 Cr tracked under the PAIMANA framework
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
              {stats.totalStatesCovered} States/UTs Monitored
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e1628] border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">State / UT</th>
                  <th className="py-3 px-4 text-right">Projects Monitored</th>
                  <th className="py-3 px-4 text-right">Total Outlay (₹ Cr)</th>
                  <th className="py-3 px-4 text-right">Avg Cost Escalation</th>
                  <th className="py-3 px-4 text-right">Avg Schedule Delay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stats.topStates.map((s, idx) => (
                  <tr key={s.state} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-200 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] text-slate-400 flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <span>{s.state}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-sky-300">
                      {s.count}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-white">
                      ₹{s.outlay.toLocaleString()} Cr
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span className={s.avgOverrun > 15 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                        +{s.avgOverrun}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-300">
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

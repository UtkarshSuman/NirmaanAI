import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SectorStatItem {
  sector: string;
  count: number;
  totalCost: number;
  avgOverrun: number;
  avgDelay: number;
}

interface SectorOverviewProps {
  sectorStats: SectorStatItem[];
}

export default function SectorOverview({ sectorStats }: SectorOverviewProps) {
  return (
    <section className="space-y-4 pt-4 border-t border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-200 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-[2px] bg-orange-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Infrastructure Sectors
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Resource allocation, execution velocity, and variance matrix across primary domains.
          </p>
        </div>

        <Link
          href="/analytics"
          className="text-xs font-semibold text-orange-700 hover:text-orange-800 flex items-center gap-1"
        >
          <span>Complete Sector Analytics</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Institutional Report Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-xs text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 pr-4 font-normal">Sector Domain</th>
              <th className="py-2.5 px-4 font-normal text-right">Monitored Assets</th>
              <th className="py-2.5 px-4 font-normal text-right">Capital Outlay (₹ Cr)</th>
              <th className="py-2.5 px-4 font-normal text-right">Avg Cost Escalation</th>
              <th className="py-2.5 px-4 font-normal text-right">Avg Schedule Delay</th>
              <th className="py-2.5 pl-4 font-normal text-center">Directory Filter</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sectorStats.slice(0, 10).map((sec, idx) => (
              <tr
                key={sec.sector}
                className={`transition-colors hover:bg-slate-50 ${
                  idx % 2 === 1 ? "bg-slate-50/40" : ""
                }`}
              >
                <td className="py-2.5 pr-4 font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>{sec.sector}</span>
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-700">
                  {sec.count}
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                  ₹{sec.totalCost.toLocaleString()}
                </td>
                <td className="py-2.5 px-4 text-right font-mono">
                  <span
                    className={`font-semibold ${
                      sec.avgOverrun > 15 ? "text-rose-700 font-bold" : "text-emerald-700"
                    }`}
                  >
                    +{sec.avgOverrun}%
                  </span>
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-orange-700 font-medium">
                  +{sec.avgDelay} mo
                </td>
                <td className="py-2.5 pl-4 text-center">
                  <Link
                    href={`/projects?sector=${encodeURIComponent(sec.sector)}`}
                    className="text-[11px] font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2"
                  >
                    View ({sec.count})
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

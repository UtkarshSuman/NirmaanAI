"use client";

import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Layers, TrendingUp, IndianRupee, Clock } from "lucide-react";

interface SectorStat {
  sector: string;
  count: number;
  totalCost: number;
  avgOverrun: number;
  avgDelay: number;
}

interface SectorDistributionProps {
  sectorStats: SectorStat[];
}

const COLORS = [
  "#38bdf8", // Sky blue
  "#818cf8", // Indigo
  "#34d399", // Emerald
  "#fbbf24", // Amber
  "#f43f5e", // Rose
  "#a78bfa", // Purple
  "#2dd4bf", // Teal
  "#fb923c", // Orange
];

export default function SectorDistributionChart({ sectorStats }: SectorDistributionProps) {
  const [activeMetric, setActiveMetric] = useState<"totalCost" | "count" | "avgOverrun" | "avgDelay">("totalCost");

  const data = sectorStats.slice(0, 8).map((s, idx) => ({
    name: s.sector.length > 16 ? s.sector.slice(0, 14) + "..." : s.sector,
    fullName: s.sector,
    totalCost: Math.round(s.totalCost / 1000), // in thousand crore
    count: s.count,
    avgOverrun: s.avgOverrun,
    avgDelay: s.avgDelay,
    color: COLORS[idx % COLORS.length],
  }));

  const metricConfig = {
    totalCost: { label: "Outlay (₹ '000 Cr)", unit: "k Cr", prefix: "₹" },
    count: { label: "Project Count", unit: " projects", prefix: "" },
    avgOverrun: { label: "Avg Cost Overrun (%)", unit: "%", prefix: "+" },
    avgDelay: { label: "Avg Delay (Months)", unit: " mo", prefix: "+" },
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-900/50 border border-slate-800 backdrop-blur-md shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Sector Capital Allocation & Variance Matrix</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-ministry resource concentration across primary infrastructure domains
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveMetric("totalCost")}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeMetric === "totalCost"
                ? "bg-sky-500 text-white shadow-sm shadow-sky-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Outlay
          </button>
          <button
            onClick={() => setActiveMetric("avgOverrun")}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeMetric === "avgOverrun"
                ? "bg-rose-500 text-white shadow-sm shadow-rose-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Overrun %
          </button>
          <button
            onClick={() => setActiveMetric("avgDelay")}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeMetric === "avgDelay"
                ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Delay
          </button>
          <button
            onClick={() => setActiveMetric("count")}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeMetric === "count"
                ? "bg-indigo-500 text-white shadow-sm shadow-indigo-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Count
          </button>
        </div>
      </div>

      {/* Visual Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
              tickFormatter={(val) => `${val}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl text-xs space-y-1">
                      <p className="font-bold text-white text-sm">{item.fullName}</p>
                      <div className="text-slate-300 flex justify-between gap-4">
                        <span>Total Outlay:</span>
                        <strong className="text-sky-300 font-mono">₹{item.totalCost}k Cr</strong>
                      </div>
                      <div className="text-slate-300 flex justify-between gap-4">
                        <span>Projects Count:</span>
                        <strong className="text-white font-mono">{item.count}</strong>
                      </div>
                      <div className="text-slate-300 flex justify-between gap-4">
                        <span>Avg Overrun:</span>
                        <strong className="text-rose-400 font-mono">+{item.avgOverrun}%</strong>
                      </div>
                      <div className="text-slate-300 flex justify-between gap-4">
                        <span>Avg Delay:</span>
                        <strong className="text-amber-400 font-mono">+{item.avgDelay} mo</strong>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey={activeMetric} radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    activeMetric === "avgOverrun"
                      ? entry.avgOverrun > 15
                        ? "#f43f5e"
                        : "#34d399"
                      : activeMetric === "avgDelay"
                      ? "#f59e0b"
                      : activeMetric === "count"
                      ? "#818cf8"
                      : entry.color
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Mini Legend / Ticker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          <span>Highways Outlay: ₹27.4k Cr</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          <span>Railways Outlay: ₹23.8k Cr</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          <span>Petroleum Overrun: +21.4%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Power Delay: +19 mo</span>
        </div>
      </div>
    </div>
  );
}

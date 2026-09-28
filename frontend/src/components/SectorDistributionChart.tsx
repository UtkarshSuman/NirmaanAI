"use client";

import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Layers } from "lucide-react";

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
  "#0284c7", // Sky blue
  "#4f46e5", // Indigo
  "#059669", // Emerald
  "#d97706", // Amber
  "#dc2626", // Rose
  "#7c3aed", // Purple
  "#0d9488", // Teal
  "#ea580c", // Orange
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

  return (
    <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-700" />
            <span>Sector Capital Allocation & Variance Matrix</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-ministry resource concentration across primary infrastructure domains
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveMetric("totalCost")}
            className={`px-3 py-1 rounded font-medium transition-all ${
              activeMetric === "totalCost"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Outlay
          </button>
          <button
            onClick={() => setActiveMetric("avgOverrun")}
            className={`px-3 py-1 rounded font-medium transition-all ${
              activeMetric === "avgOverrun"
                ? "bg-white text-rose-700 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Overrun %
          </button>
          <button
            onClick={() => setActiveMetric("avgDelay")}
            className={`px-3 py-1 rounded font-medium transition-all ${
              activeMetric === "avgDelay"
                ? "bg-white text-orange-700 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Delay
          </button>
          <button
            onClick={() => setActiveMetric("count")}
            className={`px-3 py-1 rounded font-medium transition-all ${
              activeMetric === "count"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
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
              axisLine={{ stroke: "#cbd5e1" }}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: "#cbd5e1" }}
              tickFormatter={(val) => `${val}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xl text-xs space-y-1">
                      <p className="font-bold text-slate-900 text-sm">{item.fullName}</p>
                      <div className="text-slate-600 flex justify-between gap-4">
                        <span>Total Outlay:</span>
                        <strong className="text-slate-900 font-mono">₹{item.totalCost}k Cr</strong>
                      </div>
                      <div className="text-slate-600 flex justify-between gap-4">
                        <span>Projects Count:</span>
                        <strong className="text-slate-900 font-mono">{item.count}</strong>
                      </div>
                      <div className="text-slate-600 flex justify-between gap-4">
                        <span>Avg Overrun:</span>
                        <strong className="text-rose-700 font-mono">+{item.avgOverrun}%</strong>
                      </div>
                      <div className="text-slate-600 flex justify-between gap-4">
                        <span>Avg Delay:</span>
                        <strong className="text-orange-700 font-mono">+{item.avgDelay} mo</strong>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey={activeMetric} radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    activeMetric === "avgOverrun"
                      ? entry.avgOverrun > 15
                        ? "#dc2626"
                        : "#059669"
                      : activeMetric === "avgDelay"
                      ? "#ea580c"
                      : activeMetric === "count"
                      ? "#4f46e5"
                      : entry.color
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

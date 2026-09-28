"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area,
  ComposedChart,
} from "recharts";
import { TrendingUp, Clock, AlertTriangle, Layers, Calendar } from "lucide-react";

export interface SnapshotRecord {
  snapshot_date: string;
  revised_cost_crore: number;
  cumulative_expenditure_crore: number;
  physical_progress_percent: number;
  financial_progress_percent: number;
  milestone_achieved_count?: number;
  project_status?: string;
  cost_overrun_percent?: number;
  time_overrun_months?: number;
}

interface SnapshotTrendChartProps {
  projectId: string;
  projectName: string;
  snapshots: SnapshotRecord[];
}

export default function SnapshotTrendChart({
  projectId,
  projectName,
  snapshots,
}: SnapshotTrendChartProps) {
  const [viewMode, setViewMode] = useState<"progress" | "financial">("progress");

  if (!snapshots || snapshots.length === 0) {
    return null;
  }

  // Format and sample data if there are too many snapshots for clean rendering
  const formattedData = snapshots.map((s) => {
    const d = new Date(s.snapshot_date);
    const dateLabel = isNaN(d.getTime())
      ? s.snapshot_date
      : d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });

    return {
      date: dateLabel,
      fullDate: s.snapshot_date,
      physical: Number(s.physical_progress_percent.toFixed(1)),
      financial: Number(s.financial_progress_percent.toFixed(1)),
      revisedCost: Math.round(s.revised_cost_crore),
      expenditure: Math.round(s.cumulative_expenditure_crore),
      delay: s.time_overrun_months ?? 0,
      costOverrun: s.cost_overrun_percent ?? 0,
      disparity: Number((s.financial_progress_percent - s.physical_progress_percent).toFixed(1)),
    };
  });

  const latest = formattedData[formattedData.length - 1];
  const earliest = formattedData[0];
  const maxDisparity = Math.max(...formattedData.map((d) => d.disparity));

  return (
    <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gov-blue" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Historical Time-Series Trend & Execution Trajectory
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {formattedData.length} monthly monitoring snapshots ({earliest.date} to {latest.date}) logged in central database
          </p>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode("progress")}
            className={`px-3 py-1 rounded font-medium transition-all ${
              viewMode === "progress"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Physical vs Financial Progress (%)
          </button>
          <button
            onClick={() => setViewMode("financial")}
            className={`px-3 py-1 rounded font-medium transition-all ${
              viewMode === "financial"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Cost vs Outlay (₹ Cr)
          </button>
        </div>
      </div>

      {/* Disparity Insight Callout if Outflow > Physical Progress */}
      {latest.disparity > 10 && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Physical-Financial Disparity Observed:</strong> Current cumulative expenditure ({latest.financial}%) outpaces physical progress ({latest.physical}%) by +{latest.disparity}%. Peak disparity reached +{maxDisparity}%.
          </span>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === "progress" ? (
            <ComposedChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                domain={[0, 100]}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl border border-slate-800 space-y-1">
                        <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.fullDate}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-emerald-400 font-mono">
                          <span>Physical Progress:</span>
                          <span className="font-bold">{item.physical}%</span>
                        </div>
                        <div className="flex justify-between gap-4 text-sky-400 font-mono">
                          <span>Financial Outflow:</span>
                          <span className="font-bold">{item.financial}%</span>
                        </div>
                        <div className="flex justify-between gap-4 text-amber-400 font-mono text-[11px] pt-1 border-t border-slate-800">
                          <span>Progress Gap:</span>
                          <span className="font-bold">
                            {item.disparity > 0 ? `+${item.disparity}%` : `${item.disparity}%`}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                iconType="plainline"
              />
              <Line
                type="monotone"
                dataKey="physical"
                name="Physical Progress (%)"
                stroke="#059669"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="financial"
                name="Financial Expenditure (%)"
                stroke="#0284c7"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          ) : (
            <ComposedChart data={formattedData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} Cr`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl border border-slate-800 space-y-1">
                        <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1">
                          Snapshot: {item.fullDate}
                        </div>
                        <div className="flex justify-between gap-4 text-rose-400 font-mono">
                          <span>Revised Sanction:</span>
                          <span className="font-bold">₹{item.revisedCost.toLocaleString()} Cr</span>
                        </div>
                        <div className="flex justify-between gap-4 text-sky-400 font-mono">
                          <span>Cumulative Outflow:</span>
                          <span className="font-bold">₹{item.expenditure.toLocaleString()} Cr</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                iconType="plainline"
              />
              <Area
                type="monotone"
                dataKey="revisedCost"
                name="Revised Sanction (₹ Cr)"
                stroke="#dc2626"
                fill="#fee2e2"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="expenditure"
                name="Cumulative Outflow (₹ Cr)"
                stroke="#0284c7"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Snapshot Summary Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="p-2 rounded bg-slate-50">
          <span className="text-slate-500 block text-[10px] uppercase font-mono">Earliest Record</span>
          <span className="font-mono font-bold text-slate-900">{earliest.date}</span>
        </div>
        <div className="p-2 rounded bg-slate-50">
          <span className="text-slate-500 block text-[10px] uppercase font-mono">Latest Record</span>
          <span className="font-mono font-bold text-slate-900">{latest.date}</span>
        </div>
        <div className="p-2 rounded bg-slate-50">
          <span className="text-slate-500 block text-[10px] uppercase font-mono">Snapshot Points</span>
          <span className="font-mono font-bold text-slate-900">{snapshots.length} Months</span>
        </div>
        <div className="p-2 rounded bg-slate-50">
          <span className="text-slate-500 block text-[10px] uppercase font-mono">Current Physical</span>
          <span className="font-mono font-bold text-emerald-700">{latest.physical}%</span>
        </div>
      </div>
    </div>
  );
}

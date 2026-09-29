import React from "react";
import { BarChart3, TrendingUp, Layers } from "lucide-react";

export default function AnalyticsLoading() {
  return (
    <div className="w-full space-y-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-20 h-3.5 bg-slate-200 rounded skeleton-shimmer" />
            <span className="text-slate-300">/</span>
            <span className="w-28 h-3.5 bg-slate-200 rounded skeleton-shimmer" />
          </div>
          <div className="w-88 h-8 bg-slate-300 rounded skeleton-shimmer" />
          <div className="w-96 max-w-full h-4 bg-slate-200 rounded skeleton-shimmer" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200/80 text-orange-800 text-xs font-medium">
          <BarChart3 className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
          <span>Aggregating National Portfolio Analytics...</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex justify-between items-center">
              <div className="w-24 h-3 bg-slate-200 rounded skeleton-shimmer" />
              <div className="w-6 h-6 rounded-md bg-slate-100 skeleton-shimmer" />
            </div>
            <div className="w-28 h-7 bg-slate-300 rounded skeleton-shimmer" />
            <div className="w-36 h-2.5 bg-slate-200 rounded skeleton-shimmer" />
          </div>
        ))}
      </div>

      {/* Two Large Chart Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div className="w-44 h-4 bg-slate-200 rounded skeleton-shimmer" />
            <div className="w-24 h-4 bg-slate-100 rounded skeleton-shimmer" />
          </div>
          {/* Chart area */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 px-4 bg-slate-50/50 rounded-lg">
            {[45, 75, 30, 90, 60, 80, 40, 65, 85].map((val, idx) => (
              <div
                key={idx}
                className="w-full bg-slate-200 rounded-t-sm skeleton-shimmer"
                style={{ height: `${val}%` }}
              />
            ))}
          </div>
        </div>

        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div className="w-48 h-4 bg-slate-200 rounded skeleton-shimmer" />
            <div className="w-20 h-4 bg-slate-100 rounded skeleton-shimmer" />
          </div>
          {/* Chart area */}
          <div className="h-64 flex items-center justify-center bg-slate-50/50 rounded-lg">
            <div className="w-40 h-40 rounded-full border-8 border-slate-200 border-t-orange-400 animate-spin" />
          </div>
        </div>
      </div>
    </div>
  );
}

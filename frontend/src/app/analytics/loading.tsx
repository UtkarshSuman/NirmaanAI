import React from "react";

export default function AnalyticsLoading() {
  return (
    <div className="w-full space-y-8 animate-pulse select-none">
      {/* Top Subtle Loading Indicator Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-slate-200 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 animate-[loadingBar_1.2s_ease-in-out_infinite]" />
      </div>

      {/* Editorial Header Skeleton */}
      <div className="border-b border-slate-200 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-44 h-3 bg-slate-200 rounded" />
          <div className="w-4 h-3 bg-slate-100 rounded" />
          <div className="w-64 h-3 bg-slate-200 rounded" />
        </div>
        <div className="w-3/4 max-w-2xl h-8 bg-slate-300 rounded" />
        <div className="w-full max-w-3xl h-4 bg-slate-200 rounded" />
      </div>

      {/* Model Dimension Anchors Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-2">
            <div className="w-24 h-2.5 bg-slate-200 rounded" />
            <div className="w-48 h-4 bg-slate-300 rounded" />
          </div>
        ))}
      </div>

      {/* Benchmark Table & Cards Skeleton */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="w-56 h-5 bg-slate-300 rounded" />
          <div className="w-24 h-4 bg-slate-100 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 py-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 rounded bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-20 h-3 bg-slate-200 rounded" />
              <div className="w-16 h-6 bg-slate-300 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

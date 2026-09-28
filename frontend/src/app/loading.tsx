import React from "react";

export default function Loading() {
  return (
    <div className="w-full space-y-6 animate-pulse select-none">
      {/* Top Subtle Loading Indicator Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-slate-200 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 animate-[loadingBar_1.2s_ease-in-out_infinite]" />
      </div>

      {/* Header Skeleton */}
      <div className="border-b border-slate-200 pb-4 space-y-2">
        <div className="w-48 h-3.5 bg-slate-200 rounded" />
        <div className="w-80 h-7 bg-slate-300 rounded" />
        <div className="w-full max-w-xl h-4 bg-slate-200 rounded" />
      </div>

      {/* KPI Cards Skeleton Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex justify-between items-center">
              <div className="w-24 h-3 bg-slate-200 rounded" />
              <div className="w-6 h-6 rounded-full bg-slate-100" />
            </div>
            <div className="w-32 h-6 bg-slate-300 rounded" />
            <div className="w-40 h-2.5 bg-slate-200 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Skeleton Area */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-4 shadow-2xs min-h-[360px]">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="w-44 h-4 bg-slate-200 rounded" />
          <div className="w-20 h-4 bg-slate-100 rounded" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex items-center gap-4 py-2 border-b border-slate-100">
              <div className="w-28 h-3.5 bg-slate-200 rounded" />
              <div className="flex-1 h-3.5 bg-slate-100 rounded" />
              <div className="w-20 h-3.5 bg-slate-200 rounded" />
              <div className="w-16 h-3.5 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

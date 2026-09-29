import React from "react";
import { AlertTriangle, Bell, Filter } from "lucide-react";

export default function AlertsLoading() {
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
          <div className="w-80 h-8 bg-slate-300 rounded skeleton-shimmer" />
          <div className="w-96 max-w-full h-4 bg-slate-200 rounded skeleton-shimmer" />
        </div>

        {/* Real-time Telemetry Monitor Status */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200/80 text-red-800 text-xs font-medium">
          <Bell className="w-3.5 h-3.5 text-red-600 animate-bounce" />
          <span>Scanning Live Project Telemetry Alerts...</span>
        </div>
      </div>

      {/* Alert Severity Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Critical Risk Alerts", color: "border-red-200 bg-red-50/30" },
          { label: "High Risk Alerts", color: "border-amber-200 bg-amber-50/30" },
          { label: "Moderate Risk Alerts", color: "border-yellow-200 bg-yellow-50/30" },
          { label: "Acknowledged Alerts", color: "border-slate-200 bg-slate-50/30" },
        ].map((item, i) => (
          <div key={i} className={`p-4 rounded-xl border ${item.color} space-y-3 shadow-2xs`}>
            <div className="flex justify-between items-center">
              <div className="w-28 h-3.5 bg-slate-200 rounded skeleton-shimmer" />
              <div className="w-6 h-6 rounded-full bg-slate-200 skeleton-shimmer" />
            </div>
            <div className="w-16 h-7 bg-slate-300 rounded skeleton-shimmer" />
            <div className="w-36 h-3 bg-slate-200 rounded skeleton-shimmer" />
          </div>
        ))}
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((tab) => (
            <div
              key={tab}
              className="h-8 rounded-lg bg-slate-100 skeleton-shimmer"
              style={{ width: `${70 + (tab * 12) % 40}px` }}
            />
          ))}
        </div>
        <div className="w-36 h-8 bg-slate-100 rounded-lg skeleton-shimmer" />
      </div>

      {/* Alerts Feed Stack Skeleton (6 Items) */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((alert) => (
          <div
            key={alert}
            className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 animate-ping" />
                <div className="w-20 h-5 rounded-full bg-slate-100 skeleton-shimmer" />
                <div
                  className="h-4 bg-slate-300 rounded skeleton-shimmer"
                  style={{ width: `${140 + (alert * 25) % 100}px` }}
                />
              </div>
              <div className="w-28 h-3.5 bg-slate-200 rounded skeleton-shimmer" />
            </div>

            <div className="w-full h-3.5 bg-slate-100 rounded skeleton-shimmer" />

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-24 h-3 bg-slate-200 rounded skeleton-shimmer" />
                <div className="w-32 h-3 bg-slate-200 rounded skeleton-shimmer" />
              </div>
              <div className="w-28 h-7 bg-slate-100 rounded-lg skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

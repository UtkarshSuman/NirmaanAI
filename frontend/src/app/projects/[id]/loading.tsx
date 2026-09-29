import React from "react";
import { ArrowLeft, Cpu, Activity } from "lucide-react";

export default function ProjectDetailLoading() {
  return (
    <div className="w-full space-y-6">
      {/* Top Breadcrumb & Live Fetch Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-slate-200 rounded skeleton-shimmer" />
            <span className="w-24 h-3.5 bg-slate-200 rounded skeleton-shimmer" />
            <span className="text-slate-300">/</span>
            <span className="w-32 h-3.5 bg-slate-200 rounded skeleton-shimmer" />
          </div>
          <div className="w-96 max-w-full h-8 bg-slate-300 rounded skeleton-shimmer" />
          <div className="flex items-center gap-3">
            <div className="w-24 h-5 bg-slate-100 rounded-md skeleton-shimmer" />
            <div className="w-32 h-5 bg-slate-100 rounded-md skeleton-shimmer" />
            <div className="w-20 h-5 bg-slate-100 rounded-md skeleton-shimmer" />
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex items-center gap-2.5">
          <div className="w-44 h-9 bg-slate-200 rounded-lg skeleton-shimmer" />
          <div className="w-36 h-9 bg-slate-200 rounded-lg skeleton-shimmer" />
        </div>
      </div>

      {/* AI Telemetry Sync Indicator Strip */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-orange-50/70 border border-orange-200/80 text-orange-950 text-xs">
        <div className="flex items-center gap-2.5 font-medium">
          <Cpu className="w-4 h-4 text-orange-600 animate-pulse" />
          <span>Retrieving deep project telemetry & SHAP explainability models from database...</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 font-mono">
          <Activity className="w-3.5 h-3.5 text-orange-500 animate-spin" />
          <span>Computing risk vectors</span>
        </div>
      </div>

      {/* 4-Metric KPI Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex justify-between items-center">
              <div className="w-24 h-3.5 bg-slate-200 rounded skeleton-shimmer" />
              <div className="w-6 h-6 rounded-md bg-slate-100 skeleton-shimmer" />
            </div>
            <div className="w-32 h-7 bg-slate-300 rounded skeleton-shimmer" />
            <div className="w-40 h-3 bg-slate-200 rounded skeleton-shimmer" />
          </div>
        ))}
      </div>

      {/* Two Column Layout: ML Risk Engine Card & Project Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Machine Learning Predictions & SHAP Explainability (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Risk Card Skeleton */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="space-y-1.5">
                <div className="w-48 h-4 bg-slate-200 rounded skeleton-shimmer" />
                <div className="w-64 h-3 bg-slate-100 rounded skeleton-shimmer" />
              </div>
              <div className="w-24 h-7 rounded-full bg-slate-200 skeleton-shimmer" />
            </div>

            {/* Probability Gauges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                <div className="w-28 h-3 bg-slate-200 rounded skeleton-shimmer" />
                <div className="w-16 h-6 bg-slate-300 rounded skeleton-shimmer" />
                <div className="w-full h-2 bg-slate-200 rounded-full skeleton-shimmer" />
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                <div className="w-28 h-3 bg-slate-200 rounded skeleton-shimmer" />
                <div className="w-16 h-6 bg-slate-300 rounded skeleton-shimmer" />
                <div className="w-full h-2 bg-slate-200 rounded-full skeleton-shimmer" />
              </div>
            </div>

            {/* SHAP Waterfall Bars Skeleton */}
            <div className="space-y-3 pt-2">
              <div className="w-36 h-3.5 bg-slate-200 rounded skeleton-shimmer" />
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <div className="w-40 h-3 bg-slate-200 rounded skeleton-shimmer" />
                    <div className="w-12 h-3 bg-slate-200 rounded skeleton-shimmer" />
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-200 skeleton-shimmer"
                      style={{ width: `${40 + (item * 11) % 50}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Key Details & Timeline (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="w-40 h-4 bg-slate-200 rounded skeleton-shimmer pb-2 border-b border-slate-100" />
            <div className="space-y-3 pt-1">
              {[1, 2, 3, 4, 5, 6].map((field) => (
                <div key={field} className="flex justify-between items-center py-1.5 border-b border-slate-50">
                  <div className="w-24 h-3 bg-slate-200 rounded skeleton-shimmer" />
                  <div className="w-32 h-3.5 bg-slate-300 rounded skeleton-shimmer" />
                </div>
              ))}
            </div>
          </div>

          {/* Active Alerts Skeleton Card */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <div className="w-32 h-4 bg-slate-200 rounded skeleton-shimmer" />
              <div className="w-16 h-5 rounded-full bg-slate-100 skeleton-shimmer" />
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-48 h-3.5 bg-slate-200 rounded skeleton-shimmer" />
              <div className="w-full h-3 bg-slate-100 rounded skeleton-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

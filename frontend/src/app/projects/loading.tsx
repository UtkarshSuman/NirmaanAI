import React from "react";
import { Database, Search } from "lucide-react";

export default function ProjectsLoading() {
  return (
    <div className="w-full space-y-6">
      {/* Top Breadcrumb & Observatory Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-20 h-3.5 bg-slate-200 rounded skeleton-shimmer" />
            <span className="text-slate-300">/</span>
            <span className="w-28 h-3.5 bg-slate-200 rounded skeleton-shimmer" />
          </div>
          <div className="w-72 h-8 bg-slate-300 rounded skeleton-shimmer" />
          <div className="w-96 max-w-full h-4 bg-slate-200 rounded skeleton-shimmer" />
        </div>

        {/* Database syncing badge */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200/80 text-orange-800 text-xs font-medium">
            <Database className="w-3.5 h-3.5 text-orange-600 animate-spin" />
            <span>Querying Supabase PostgreSQL...</span>
          </div>
          <div className="w-32 h-9 bg-slate-200 rounded-lg skeleton-shimmer" />
        </div>
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <div className="w-full h-10 bg-slate-100 rounded-lg skeleton-shimmer" />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="w-36 h-10 bg-slate-100 rounded-lg skeleton-shimmer" />
            <div className="w-28 h-10 bg-slate-100 rounded-lg skeleton-shimmer" />
            <div className="w-32 h-10 bg-slate-100 rounded-lg skeleton-shimmer" />
          </div>
        </div>

        {/* Filter Pills Skeleton */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
          {[1, 2, 3, 4, 5, 6, 7].map((pill) => (
            <div
              key={pill}
              className="h-7 rounded-full bg-slate-100 border border-slate-200/60 skeleton-shimmer"
              style={{ width: `${60 + (pill * 15) % 50}px` }}
            />
          ))}
        </div>
      </div>

      {/* Projects Table Skeleton */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-400">
          <div className="col-span-4 h-3.5 bg-slate-200 rounded skeleton-shimmer w-32" />
          <div className="col-span-2 h-3.5 bg-slate-200 rounded skeleton-shimmer w-20" />
          <div className="col-span-2 h-3.5 bg-slate-200 rounded skeleton-shimmer w-24" />
          <div className="col-span-2 h-3.5 bg-slate-200 rounded skeleton-shimmer w-28" />
          <div className="col-span-2 h-3.5 bg-slate-200 rounded skeleton-shimmer w-16 ml-auto" />
        </div>

        {/* Table Rows (8 Shimmering Items) */}
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
            <div key={row} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
              {/* Project title and code */}
              <div className="col-span-4 space-y-2">
                <div
                  className="h-4 bg-slate-200 rounded skeleton-shimmer"
                  style={{ width: `${65 + (row * 7) % 30}%` }}
                />
                <div className="flex items-center gap-2">
                  <div className="w-16 h-3 bg-slate-100 rounded skeleton-shimmer" />
                  <div className="w-24 h-3 bg-slate-100 rounded skeleton-shimmer" />
                </div>
              </div>

              {/* Ministry Tag */}
              <div className="col-span-2">
                <div className="w-28 h-5 bg-slate-100 rounded-md skeleton-shimmer" />
              </div>

              {/* Financial Outlay */}
              <div className="col-span-2 space-y-1.5">
                <div className="w-20 h-4 bg-slate-200 rounded skeleton-shimmer" />
                <div className="w-24 h-2.5 bg-slate-100 rounded skeleton-shimmer" />
              </div>

              {/* Physical Progress Bar */}
              <div className="col-span-2 space-y-1.5">
                <div className="flex justify-between">
                  <div className="w-10 h-3 bg-slate-200 rounded skeleton-shimmer" />
                  <div className="w-8 h-3 bg-slate-200 rounded skeleton-shimmer" />
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-200 skeleton-shimmer"
                    style={{ width: `${30 + (row * 9) % 60}%` }}
                  />
                </div>
              </div>

              {/* Risk Badge */}
              <div className="col-span-2 flex justify-end">
                <div className="w-20 h-6 rounded-full bg-slate-100 skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/60 border-t border-slate-200">
          <div className="w-36 h-3.5 bg-slate-200 rounded skeleton-shimmer" />
          <div className="flex items-center gap-2">
            <div className="w-20 h-8 bg-slate-200 rounded-lg skeleton-shimmer" />
            <div className="w-20 h-8 bg-slate-200 rounded-lg skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

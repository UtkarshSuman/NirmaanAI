import React from "react";
import { MapPin, Globe } from "lucide-react";

export default function MapLoading() {
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

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200/80 text-orange-800 text-xs font-medium">
          <Globe className="w-3.5 h-3.5 text-orange-600 animate-spin" />
          <span>Loading Geospatial GIS Coordinates & Clusters...</span>
        </div>
      </div>

      {/* Filter strip skeleton */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-28 h-8 rounded-lg bg-slate-100 skeleton-shimmer" />
          ))}
        </div>
        <div className="w-36 h-8 rounded-lg bg-slate-100 skeleton-shimmer" />
      </div>

      {/* Geospatial Map Canvas Skeleton */}
      <div className="relative w-full h-[580px] rounded-2xl bg-slate-100 border border-slate-200 shadow-2xs overflow-hidden flex flex-col items-center justify-center">
        {/* Radar scan grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />

        {/* Pulsing center radar */}
        <div className="relative z-10 flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/90 backdrop-blur-xs border border-slate-200 shadow-lg max-w-md text-center">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-orange-100 text-orange-600">
            <MapPin className="w-7 h-7 animate-bounce" />
            <div className="absolute inset-0 rounded-full border-2 border-orange-500 animate-ping opacity-30" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-800">Rendering National GIS Overlay</h3>
            <p className="text-xs text-slate-500">
              Synchronizing state infrastructure clusters and geo-coordinates from database...
            </p>
          </div>
          <div className="w-full max-w-xs h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-orange-500 rounded-full animate-[loadingBar_1.4s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
}

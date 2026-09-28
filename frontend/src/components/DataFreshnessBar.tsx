"use client";

import React from "react";
import { Database, Clock, FileCode, CheckCircle2, AlertCircle } from "lucide-react";
import type { DatasetFreshness } from "@/lib/services/freshnessService";

interface DataFreshnessBarProps {
  freshness: DatasetFreshness;
}

function formatDate(isoStr: string | null): string {
  if (!isoStr) return "Unavailable";
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }) + " UTC";
  } catch {
    return "Unavailable";
  }
}

export default function DataFreshnessBar({ freshness }: DataFreshnessBarProps) {
  const isAvailable = freshness.systemStatus === "Available";
  const isDegraded = freshness.systemStatus === "Degraded";

  return (
    <div className="py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-600">
      {/* Left: Status & Source */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 font-semibold text-slate-900">
          <Database className="w-3.5 h-3.5 text-gov-blue" />
          <span>Data Status:</span>
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
            isAvailable
              ? "bg-teal-50 text-teal-800 border-teal-200"
              : isDegraded
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isAvailable ? "bg-teal-600" : isDegraded ? "bg-amber-500" : "bg-rose-600"
            }`}
          />
          <span>{freshness.systemStatus}: Current Analytical Dataset</span>
        </span>

        <span className="text-slate-400 hidden sm:inline">•</span>
        <span className="text-slate-500 text-[11px]">{freshness.datasetCoverage}</span>
      </div>

      {/* Right: Verified Timestamps */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono">
        {freshness.latestProjectUpdate && (
          <span className="flex items-center gap-1" title="Latest project record update in database">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>DB Synced: {formatDate(freshness.latestProjectUpdate)}</span>
          </span>
        )}

        {freshness.modelArtifactTimestamp && (
          <span className="flex items-center gap-1" title="Training results evaluation artifact last modified">
            <FileCode className="w-3 h-3 text-slate-400" />
            <span>Artifact: {formatDate(freshness.modelArtifactTimestamp)}</span>
          </span>
        )}
      </div>
    </div>
  );
}

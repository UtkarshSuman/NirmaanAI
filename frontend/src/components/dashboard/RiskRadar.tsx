import React from "react";
import Link from "next/link";
import { ChevronRight, ShieldAlert, ArrowRight } from "lucide-react";

interface LiveAlertItem {
  id: string;
  projectId: string;
  alertType: string;
  severity: string;
  title: string;
  description?: string | null;
  project?: {
    projectName: string;
    sector: string;
    revisedCostCrore: number;
  } | null;
}

interface RiskDistribution {
  critical: number;
  high: number;
  moderate: number;
  low: number;
}

interface RiskRadarProps {
  distribution: RiskDistribution;
  alerts: LiveAlertItem[];
  criticalAlertsCount: number;
}

export default function RiskRadar({
  distribution,
  alerts,
  criticalAlertsCount,
}: RiskRadarProps) {
  const totalAudited =
    distribution.critical +
    distribution.high +
    distribution.moderate +
    distribution.low || 1;

  return (
    <section className="space-y-6 pt-4 border-t border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-200 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-[2px] bg-orange-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              National Risk Radar
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Portfolio-wide distribution of current predictive risk classifications.
          </p>
        </div>

        <Link
          href="/alerts"
          className="text-xs font-semibold text-orange-700 hover:text-orange-800 flex items-center gap-1 shrink-0"
        >
          <span>Open Full Risk Register ({criticalAlertsCount} Critical)</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Two-Column Open Layout (No Giant Rounded Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Risk Category Distribution (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Predictive Tier Breakdown
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              [STACKING MODEL AUDIT]
            </span>
          </div>

          <div className="space-y-3">
            {/* Critical */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  Critical Escalation
                </span>
                <span className="font-mono text-slate-900 font-bold">
                  {distribution.critical} Assets (
                  {((distribution.critical / totalAudited) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-600 rounded-full"
                  style={{ width: `${(distribution.critical / totalAudited) * 100}%` }}
                />
              </div>
            </div>

            {/* High */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-orange-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  High Risk
                </span>
                <span className="font-mono text-slate-900 font-bold">
                  {distribution.high} Assets (
                  {((distribution.high / totalAudited) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${(distribution.high / totalAudited) * 100}%` }}
                />
              </div>
            </div>

            {/* Moderate */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Moderate Variance
                </span>
                <span className="font-mono text-slate-900 font-bold">
                  {distribution.moderate} Assets (
                  {((distribution.moderate / totalAudited) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(distribution.moderate / totalAudited) * 100}%` }}
                />
              </div>
            </div>

            {/* On Track */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-teal-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-600" />
                  On Track / Low Risk
                </span>
                <span className="font-mono text-slate-900 font-bold">
                  {distribution.low} Assets (
                  {((distribution.low / totalAudited) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full"
                  style={{ width: `${(distribution.low / totalAudited) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100">
            <span>Portfolio capital under surveillance:</span>
            <strong className="text-slate-900 font-mono font-bold">All India (100%)</strong>
          </div>
        </div>

        {/* Right Column: Emerging Live Indicators (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Emerging Systemic Risk Indicators
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              [LIVE ALERT REGISTER]
            </span>
          </div>

          <div className="border-t border-slate-200 divide-y divide-slate-100">
            {alerts && alerts.length > 0 ? (
              alerts.map((alt) => (
                <div key={alt.id} className="py-2.5 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          alt.severity === "CRITICAL"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-orange-50 text-orange-700 border border-orange-200"
                        }`}
                      >
                        {alt.severity}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">{alt.alertType}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-600 truncate">{alt.project?.sector}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 truncate">{alt.title}</h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      Asset: <strong className="text-slate-700 font-medium">{alt.project?.projectName}</strong>
                    </p>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <div className="font-mono text-xs font-bold text-slate-900">
                      ₹{(alt.project?.revisedCostCrore || 0).toLocaleString()} Cr
                    </div>
                    <Link
                      href={`/projects/${alt.projectId}`}
                      className="text-[11px] text-orange-700 hover:text-orange-800 font-semibold flex items-center justify-end gap-0.5"
                    >
                      <span>Audit Dossier</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No active unacknowledged alerts found in repository.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

import React from "react";
import Link from "next/link";
import { ChevronRight, ShieldAlert, ArrowRight } from "lucide-react";
import RiskDonutChart from "@/components/charts/RiskDonutChart";

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
  unclassified?: number;
  totalClassified?: number;
  totalProjects?: number;
  coveragePercent?: number;
}

interface RiskRadarProps {
  distribution: RiskDistribution;
  alerts: LiveAlertItem[];
  criticalAlertsCount: number;
  totalMonitored?: number;
}

export default function RiskRadar({
  distribution,
  alerts,
  criticalAlertsCount,
  totalMonitored,
}: RiskRadarProps) {
  const totalAudited =
    distribution.totalClassified ??
    (distribution.critical +
      distribution.high +
      distribution.moderate +
      distribution.low || 1);
  // Ensure totalProjectsValue is always a definite number to satisfy TypeScript
  const totalProjectsValue: number = distribution.totalProjects ?? totalMonitored ?? totalAudited;
  const coverage = distribution.coveragePercent ?? Number(((totalAudited / totalProjectsValue) * 100).toFixed(1));

  return (
    <section className="space-y-6 pt-4 border-t border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-200 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-[2px] bg-orange-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
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

      {/* Two-Column Open Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Risk Category Donut & Tier Breakdown (6 Cols) */}
        <div className="lg:col-span-6 space-y-3">
          <RiskDonutChart
            critical={distribution.critical}
            high={distribution.high}
            moderate={distribution.moderate}
            low={distribution.low}
            totalClassified={totalAudited}
          />
          <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
            <span>Classification Coverage:</span>
            <strong className="text-slate-900 font-mono font-bold">
              {totalAudited.toLocaleString()} of {totalProjectsValue.toLocaleString()} ({coverage}%)
              {distribution.unclassified ? ` • ${distribution.unclassified} unclassified` : ""}
            </strong>
          </div>
        </div>

        {/* Right Column: Emerging Live Indicators (6 Cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">
              Emerging Systemic Risk Indicators
            </h3>
            <span className="text-xs text-slate-500">
              Current alert register
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

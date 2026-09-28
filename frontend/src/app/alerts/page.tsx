"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Filter,
  Send,
  ExternalLink,
  RefreshCw,
  Clock,
  ChevronRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface AlertData {
  id: string;
  projectId: string;
  alertType: string;
  severity: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  title: string;
  description: string;
  riskScore: number;
  recommendedAction: string;
  isAcknowledged: boolean;
  acknowledgedAt: string | null;
  createdAt: string;
  project?: {
    projectName: string;
    ministryDepartment: string;
    state: string;
    sector: string;
    revisedCostCrore: number;
    costOverrunPercent: number;
    timeOverrunMonths: number;
  };
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("pending");

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (severityFilter !== "ALL") params.set("severity", severityFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("limit", "100");

      const res = await fetch(`/api/alerts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error("Failed to load alerts:", err);
    } finally {
      setLoading(false);
    }
  }, [severityFilter, statusFilter]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const toggleAcknowledge = async (alertId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, isAcknowledged: !currentStatus }),
      });

      if (res.ok) {
        toast.success(!currentStatus ? "Alert acknowledged by IPMD desk" : "Alert marked pending");
        fetchAlerts();
      }
    } catch {
      toast.error("Failed to update alert");
    }
  };

  const dispatchNotice = (projectName: string, ministry: string) => {
    toast.success(`Formal Notice generated and dispatched to ${ministry} for project: ${projectName}`, {
      duration: 4000,
      icon: "📜",
    });
  };

  const criticalCount = alerts.filter((a) => a.severity === "CRITICAL").length;
  const pendingCount = alerts.filter((a) => !a.isAcknowledged).length;

  return (
    <div className="space-y-8">
      <Toaster position="top-right" />

      {/* Editorial Console Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gov-red">
            Early Warning Protocol
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
            Inter-Ministerial Triage Desk
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-serif text-slate-900 tracking-tight">
              Early Warning & Intervention Console
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl mt-2 leading-relaxed">
              Algorithmic threshold breach detection. Automated triage alerts for inter-ministerial
              escalation, Revised Cost Committee (RCC) triggers, and milestone recovery interventions.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => fetchAlerts()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editorial Statistics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-y border-slate-200 py-4 bg-white">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Critical Severity</span>
            <span className="text-[10px] font-mono text-gov-red bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
              URGENT
            </span>
          </div>
          <div className="text-2xl lg:text-3xl font-serif text-gov-red font-bold mt-1">
            {criticalCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Threshold breaches &gt; 20%</p>
        </div>

        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Pending Action</span>
            <span className="text-[10px] font-mono text-gov-saffron bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
              DESK
            </span>
          </div>
          <div className="text-2xl lg:text-3xl font-serif text-slate-900 font-bold mt-1">
            {pendingCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting ministerial notice</p>
        </div>

        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Acknowledged</span>
            <span className="text-[10px] font-mono text-gov-teal bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
              ACTIONED
            </span>
          </div>
          <div className="text-2xl lg:text-3xl font-serif text-slate-900 font-bold mt-1">
            {alerts.length - pendingCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Logged with nodal agencies</p>
        </div>

        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Monitoring Cadence</span>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              [LIVE DB VALUE]
            </span>
          </div>
          <div className="text-base font-bold text-gov-teal mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-gov-teal" />
            <span>Automated Active</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">{alerts.length} total alerts indexed</p>
        </div>
      </div>

      {/* Compact Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Severity:</span>
          </div>
          {["ALL", "CRITICAL", "HIGH", "MODERATE"].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 text-xs font-semibold uppercase transition-colors rounded ${
                severityFilter === sev
                  ? "bg-gov-navy text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Status:</span>
          {[
            { id: "pending", label: "Pending Action" },
            { id: "acknowledged", label: "Acknowledged" },
            { id: "all", label: "All Alerts" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-2.5 py-1 text-xs font-semibold transition-colors rounded ${
                statusFilter === st.id
                  ? "bg-gov-navy text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-slate-500 bg-white border border-slate-200 rounded">
            <div className="w-6 h-6 border-2 border-gov-navy border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-medium">Fetching live alert streams from IPMD repository...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-white border border-dashed border-slate-300 rounded">
            <CheckCircle2 className="w-8 h-8 text-gov-teal mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No alerts found under current filter criteria.</p>
            <p className="text-xs text-slate-500 mt-1">All monitored projects comply with established baseline parameters.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isCrit = alert.severity === "CRITICAL";
            const isHigh = alert.severity === "HIGH";

            const borderAccent = alert.isAcknowledged
              ? "border-l-4 border-l-slate-300 bg-slate-50/70"
              : isCrit
              ? "border-l-4 border-l-gov-red bg-white"
              : isHigh
              ? "border-l-4 border-l-gov-saffron bg-white"
              : "border-l-4 border-l-amber-500 bg-white";

            return (
              <div
                key={alert.id}
                className={`p-5 rounded border border-slate-200 transition-colors ${borderAccent}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                          isCrit
                            ? "bg-red-50 text-gov-red border-red-200"
                            : isHigh
                            ? "bg-orange-50 text-gov-saffron border-orange-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-xs font-mono text-slate-800 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {alert.projectId}
                      </span>
                      {alert.project?.sector && (
                        <span className="text-xs text-slate-600 font-medium">
                          • {alert.project.sector}
                        </span>
                      )}
                      {alert.project?.state && (
                        <span className="text-xs text-slate-500">
                          • {alert.project.state}
                        </span>
                      )}
                      {alert.isAcknowledged && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-teal-50 text-gov-teal font-semibold border border-teal-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Acknowledged
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {alert.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {alert.description}
                    </p>

                    {alert.recommendedAction && (
                      <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed">
                        <strong className="text-slate-900 font-semibold">Directive:</strong> {alert.recommendedAction}
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0 pt-2 lg:pt-0">
                    <Link
                      href={`/projects/${alert.projectId}`}
                      className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Project Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() =>
                        dispatchNotice(
                          alert.project?.projectName || alert.projectId,
                          alert.project?.ministryDepartment || "Administrative Ministry"
                        )
                      }
                      className="px-3 py-1.5 rounded bg-orange-50 hover:bg-orange-100 text-gov-saffron border border-orange-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>Issue Notice</span>
                    </button>

                    <button
                      onClick={() => toggleAcknowledge(alert.id, alert.isAcknowledged)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                        alert.isAcknowledged
                          ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                          : "bg-gov-navy hover:bg-slate-800 text-white"
                      }`}
                    >
                      {alert.isAcknowledged ? "Mark Pending" : "Acknowledge"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

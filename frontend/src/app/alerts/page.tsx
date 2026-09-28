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
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Autonomous Early Warning Protocol
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Early Warning & Intervention Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Algorithmic threshold breach detection. Automated triage alerts for inter-ministerial
            escalation, Revised Cost Committee (RCC) triggers, and milestone recovery interventions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchAlerts()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical Severity</p>
            <p className="text-2xl font-bold text-rose-700 font-mono mt-0.5">{criticalCount}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Review</p>
            <p className="text-2xl font-bold text-orange-700 font-mono mt-0.5">{pendingCount}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Triage Status</p>
            <p className="text-sm font-bold text-emerald-700 mt-1">Live Automated Monitoring</p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-600" />
            <span>Severity:</span>
          </div>
          {["ALL", "CRITICAL", "HIGH", "MODERATE"].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                severityFilter === sev
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Status:</span>
          {[
            { id: "pending", label: "Pending Action" },
            { id: "acknowledged", label: "Acknowledged" },
            { id: "all", label: "All Alerts" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st.id
                  ? "bg-slate-900 text-white shadow-sm font-bold"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
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
          <div className="py-16 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            <div className="w-7 h-7 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium">Fetching live alert streams...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No alerts found under current filter criteria.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isCrit = alert.severity === "CRITICAL";

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-xl border transition-all ${
                  alert.isAcknowledged
                    ? "bg-slate-50 border-slate-200 opacity-75"
                    : isCrit
                    ? "bg-white border-rose-300 shadow-sm"
                    : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                          isCrit
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-orange-50 text-orange-700 border-orange-200"
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-xs font-mono text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {alert.projectId}
                      </span>
                      <span className="text-xs text-slate-500">• {alert.project?.sector}</span>
                      <span className="text-xs text-slate-500">• {alert.project?.state}</span>
                      {alert.isAcknowledged && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Acknowledged
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{alert.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {alert.description}
                    </p>

                    {alert.recommendedAction && (
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                        <strong className="text-slate-900">Directive:</strong> {alert.recommendedAction}
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0">
                    <Link
                      href={`/projects/${alert.projectId}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
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
                      className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>Issue Notice</span>
                    </button>

                    <button
                      onClick={() => toggleAcknowledge(alert.id, alert.isAcknowledged)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        alert.isAcknowledged
                          ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                          : "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
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

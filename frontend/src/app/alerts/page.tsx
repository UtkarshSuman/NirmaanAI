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
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0d1627] via-[#101b33] to-[#0a1222] border border-[#1e2e4a] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
              <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                Autonomous Early Warning Protocol
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Early Warning & Intervention Console
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
              Algorithmic threshold breach detection. Automated triage alerts for inter-ministerial
              escalation, Revised Cost Committee (RCC) triggers, and milestone recovery interventions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAlerts()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#121929] hover:bg-[#1a253c] border border-[#222f46] text-xs font-semibold text-gray-300 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-rose-300 uppercase">Critical Severity</p>
            <p className="text-2xl font-bold text-white font-mono mt-1">{criticalCount}</p>
          </div>
          <AlertTriangle className="w-6 h-6 text-rose-500" />
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-300 uppercase">Pending Review</p>
            <p className="text-2xl font-bold text-white font-mono mt-1">{pendingCount}</p>
          </div>
          <Clock className="w-6 h-6 text-amber-400" />
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-300 uppercase">Triage Status</p>
            <p className="text-sm font-bold text-emerald-400 mt-1">Live Automated Monitoring</p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#0f172a]/70 border border-[#1e293b]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold uppercase">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span>Severity:</span>
          </div>
          {["ALL", "CRITICAL", "HIGH", "MODERATE"].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded text-xs font-medium uppercase transition-all ${
                severityFilter === sev
                  ? sev === "CRITICAL"
                    ? "bg-rose-500 text-white"
                    : sev === "HIGH"
                    ? "bg-amber-500 text-white"
                    : "bg-blue-600 text-white"
                  : "bg-[#151f32] text-gray-400 hover:text-white"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-semibold uppercase">Status:</span>
          {[
            { id: "pending", label: "Pending Action" },
            { id: "acknowledged", label: "Acknowledged" },
            { id: "all", label: "All Alerts" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                statusFilter === st.id
                  ? "bg-gray-200 text-gray-900 font-bold"
                  : "bg-[#151f32] text-gray-400 hover:text-white"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Fetching live alert streams...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-16 text-center text-gray-400 bg-[#0f172a]/40 rounded-xl border border-dashed border-[#1e293b]">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-medium">No alerts found under current filter criteria.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isCrit = alert.severity === "CRITICAL";

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-xl border transition-all ${
                  alert.isAcknowledged
                    ? "bg-[#0b101c]/60 border-[#1a2336] opacity-75"
                    : isCrit
                    ? "bg-[#16121f]/90 border-rose-500/40 shadow-lg shadow-rose-500/5"
                    : "bg-[#0f172a]/80 border-amber-500/30"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          isCrit
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-xs font-mono text-blue-400 font-semibold">
                        {alert.projectId}
                      </span>
                      <span className="text-xs text-gray-400">• {alert.project?.sector}</span>
                      <span className="text-xs text-gray-400">• {alert.project?.state}</span>
                      {alert.isAcknowledged && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Acknowledged
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white">{alert.title}</h3>
                    <p className="text-xs text-gray-300 leading-relaxed max-w-3xl">
                      {alert.description}
                    </p>

                    {alert.recommendedAction && (
                      <div className="p-3 rounded-lg bg-[#0a0f1d] border border-[#1e293b] text-xs text-cyan-200">
                        <strong className="text-cyan-400">Directive:</strong> {alert.recommendedAction}
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0">
                    <Link
                      href={`/projects/${alert.projectId}`}
                      className="px-3 py-1.5 rounded-lg bg-[#151f32] hover:bg-[#1e2b45] text-gray-200 border border-[#222f46] text-xs font-medium flex items-center gap-1 transition-colors"
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
                      className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>Issue Notice</span>
                    </button>

                    <button
                      onClick={() => toggleAcknowledge(alert.id, alert.isAcknowledged)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        alert.isAcknowledged
                          ? "bg-gray-800 text-gray-400 hover:text-white"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
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

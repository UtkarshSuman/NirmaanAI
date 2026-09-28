"use client";

import React, { useState, useEffect } from "react";
import { DeviceAlertPayload, playAlertChime } from "@/lib/deviceAlert";
import { downloadProjectCufFile } from "@/lib/cufParser";
import Link from "next/link";

export default function DeviceAlertModal() {
  const [activeAlert, setActiveAlert] = useState<DeviceAlertPayload | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);

  useEffect(() => {
    const handleDeviceAlert = (e: Event) => {
      const customEvent = e as CustomEvent<DeviceAlertPayload>;
      if (customEvent.detail) {
        setActiveAlert(customEvent.detail);
        setIsOpen(true);
        setAudioPlayed(true);
      }
    };

    window.addEventListener("nirmaan-device-alert", handleDeviceAlert);
    return () => {
      window.removeEventListener("nirmaan-device-alert", handleDeviceAlert);
    };
  }, []);

  if (!isOpen || !activeAlert) return null;

  const { title, severity, reasons, project } = activeAlert;

  const severityColors = {
    CRITICAL: {
      bg: "bg-red-50",
      border: "border-red-300",
      badge: "bg-red-600 text-white",
      text: "text-red-900",
      icon: "🚨",
      accent: "from-red-600 to-rose-700",
    },
    HIGH: {
      bg: "bg-amber-50",
      border: "border-amber-300",
      badge: "bg-amber-600 text-white",
      text: "text-amber-900",
      icon: "⚠️",
      accent: "from-amber-600 to-orange-600",
    },
    MODERATE: {
      bg: "bg-yellow-50",
      border: "border-yellow-300",
      badge: "bg-yellow-600 text-white",
      text: "text-yellow-900",
      icon: "⚡",
      accent: "from-yellow-600 to-amber-600",
    },
    LOW: {
      bg: "bg-emerald-50",
      border: "border-emerald-300",
      badge: "bg-emerald-600 text-white",
      text: "text-emerald-900",
      icon: "ℹ️",
      accent: "from-emerald-600 to-teal-600",
    },
  }[severity] || {
    bg: "bg-red-50",
    border: "border-red-300",
    badge: "bg-red-600 text-white",
    text: "text-red-900",
    icon: "🚨",
    accent: "from-red-600 to-rose-700",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Ribbon */}
        <div className={`px-6 py-4 bg-gradient-to-r ${severityColors.accent} text-white flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">{severityColors.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono tracking-wider font-semibold uppercase bg-white/20 px-2 py-0.5 rounded">
                  Device Hardware Alert
                </span>
                <span className="text-xs font-mono bg-black/25 px-2 py-0.5 rounded font-bold">
                  {severity} RISK
                </span>
              </div>
              <h2 className="text-lg font-serif font-bold tracking-tight text-white mt-0.5">
                {title}
              </h2>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Dismiss alert modal"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Target Project Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono text-slate-500 block">TARGET PROJECT</span>
                <h3 className="text-base font-semibold text-slate-900">{project.projectName}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-slate-500 block">PROJECT ID</span>
                <span className="text-xs font-mono font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                  {project.projectId}
                </span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono block">Risk Score</span>
                <span className={`text-xl font-bold font-mono ${project.riskScore >= 70 ? 'text-red-600' : project.riskScore >= 45 ? 'text-amber-600' : 'text-slate-800'}`}>
                  {project.riskScore}/100
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono block">Cost Overrun</span>
                <span className={`text-xl font-bold font-mono ${project.costOverrunPercent > 15 ? 'text-red-600' : 'text-slate-800'}`}>
                  +{project.costOverrunPercent}%
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono block">Timeline Delay</span>
                <span className={`text-xl font-bold font-mono ${project.timeOverrunMonths > 12 ? 'text-amber-600' : 'text-slate-800'}`}>
                  {project.timeOverrunMonths} mo
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono block">Revised Budget</span>
                <span className="text-base font-bold font-mono text-slate-800">
                  ₹{project.revisedCostCrore.toLocaleString()} Cr
                </span>
              </div>
            </div>

            {/* Context details */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
              <span>🏛️ Sector: <strong className="text-slate-800">{project.sector}</strong></span>
              {project.state && <span>📍 State: <strong className="text-slate-800">{project.state}</strong></span>}
              {project.implementingAgency && <span>🏢 Agency: <strong className="text-slate-800">{project.implementingAgency}</strong></span>}
            </div>
          </div>

          {/* Why Was This Triggered? (Explicit Requirement) */}
          <div className="bg-red-50/70 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-600 font-bold text-sm">⚠️</span>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-red-950 font-mono">
                Why Was This Device Alert Triggered?
              </h4>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-red-900 leading-relaxed">
              {reasons && reasons.length > 0 ? (
                reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white/70 p-2 rounded-lg border border-red-200/50">
                    <span className="text-red-600 font-bold text-xs mt-0.5">▶</span>
                    <span>{reason}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">▶</span>
                  <span>Project variance exceeded automatic MoSPI risk surveillance threshold.</span>
                </li>
              )}
            </ul>
          </div>

          {/* Sound & Notification Status */}
          <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-600">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Audio Chime & Native OS notification dispatched on this device</span>
            </div>
            <button
              onClick={() => playAlertChime(severity)}
              className="text-xs text-slate-700 hover:text-slate-900 font-semibold underline flex items-center gap-1"
            >
              <span>🔊 Replay Chime</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadProjectCufFile(project, "csv")}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              title="Download standardized 30-column MoSPI CUF spreadsheet"
            >
              <span>📥</span> Download CUF (.csv)
            </button>
            <button
              onClick={() => downloadProjectCufFile(project, "xlsx")}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              title="Download standardized 30-column MoSPI CUF Excel file"
            >
              <span>📊</span> Download CUF (.xlsx)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/ingest"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span>⚡</span> Ingest CUF to Pipeline
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

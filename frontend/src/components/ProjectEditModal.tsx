"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { triggerDeviceAlert } from "@/lib/deviceAlert";
import { downloadProjectCufFile } from "@/lib/cufParser";
import { Edit3, Save, X, Download, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

interface ProjectEditModalProps {
  project: {
    id: string;
    projectId: string;
    projectName: string;
    sector: string;
    state: string;
    implementingAgency: string;
    ministryDepartment: string;
    originalCostCrore: number;
    revisedCostCrore: number;
    cumulativeExpenditureCrore: number;
    anticipatedCostCrore?: number | null;
    physicalProgressPercent: number;
    financialProgressPercent: number;
    timeOverrunMonths: number;
    costOverrunPercent: number;
    projectStatus: string;
    reasonForDelay?: string | null;
    costRevisionCount: number;
    scheduleRevisionCount: number;
  };
  currentRiskScore?: number | null;
}

export default function ProjectEditModal({ project, currentRiskScore }: ProjectEditModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Form State
  const [originalCost, setOriginalCost] = useState(project.originalCostCrore);
  const [revisedCost, setRevisedCost] = useState(project.revisedCostCrore);
  const [cumulativeExp, setCumulativeExp] = useState(project.cumulativeExpenditureCrore);
  const [timeOverrunMonths, setTimeOverrunMonths] = useState(project.timeOverrunMonths);
  const [physicalProgress, setPhysicalProgress] = useState(project.physicalProgressPercent);
  const [projectStatus, setProjectStatus] = useState(project.projectStatus);
  const [reasonForDelay, setReasonForDelay] = useState(project.reasonForDelay || "");
  const [autoDownloadCuf, setAutoDownloadCuf] = useState(true);

  // Live Calculations
  const calculatedCostOverrun = originalCost > 0 
    ? Number((((revisedCost - originalCost) / originalCost) * 100).toFixed(2))
    : 0;

  const calculatedFinProg = revisedCost > 0
    ? Math.min(100, Number(((cumulativeExp / revisedCost) * 100).toFixed(1)))
    : 0;

  // Live Risk Score Preview
  const costWeight = Math.min(45, (Math.max(0, calculatedCostOverrun) / 50) * 45);
  const timeWeight = Math.min(35, (timeOverrunMonths / 36) * 35);
  const gap = Math.abs(physicalProgress - calculatedFinProg);
  const gapWeight = Math.min(20, (gap / 40) * 20);
  const liveRiskScore = Number(Math.min(99.4, Math.max(8.0, costWeight + timeWeight + gapWeight + 10)).toFixed(1));

  let liveRiskCategory: "CRITICAL" | "HIGH" | "MODERATE" | "LOW" = "LOW";
  if (liveRiskScore >= 75) liveRiskCategory = "CRITICAL";
  else if (liveRiskScore >= 50) liveRiskCategory = "HIGH";
  else if (liveRiskScore >= 30) liveRiskCategory = "MODERATE";

  const isAlertWorthy = liveRiskScore >= 50 || calculatedCostOverrun >= 15 || timeOverrunMonths >= 12;

  // Submit Handler
  const handleSaveAndTriggerAlert = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Send update to database via PATCH endpoint
      const payload = {
        originalCostCrore: originalCost,
        revisedCostCrore: revisedCost,
        cumulativeExpenditureCrore: cumulativeExp,
        timeOverrunMonths,
        physicalProgressPercent: physicalProgress,
        financialProgressPercent: calculatedFinProg,
        costOverrunPercent: calculatedCostOverrun,
        projectStatus,
        reasonForDelay,
      };

      const res = await fetch(`/api/projects/${project.projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update project database");
      }

      const result = await res.json();
      const updatedProj = result.project || { ...project, ...payload };
      const reasons: string[] = result.triggerReasons || [];

      // 2. Trigger Device Alert on this device
      await triggerDeviceAlert({
        title: `Project Telemetry Alert: ${updatedProj.projectName}`,
        severity: liveRiskCategory,
        reasons: reasons.length > 0 ? reasons : [
          `Cost Overrun of +${calculatedCostOverrun}% detected`,
          `Schedule prolonged by ${timeOverrunMonths} months`,
          `Composite Risk Score evaluated at ${liveRiskScore}/100`,
        ],
        project: {
          projectId: updatedProj.projectId,
          projectName: updatedProj.projectName,
          sector: updatedProj.sector,
          state: updatedProj.state,
          implementingAgency: updatedProj.implementingAgency,
          originalCostCrore: updatedProj.originalCostCrore,
          revisedCostCrore: updatedProj.revisedCostCrore,
          costOverrunPercent: updatedProj.costOverrunPercent,
          timeOverrunMonths: updatedProj.timeOverrunMonths,
          riskScore: liveRiskScore,
          riskCategory: liveRiskCategory,
          reasonForDelay: updatedProj.reasonForDelay,
        },
        cufGenerated: true,
      });

      // 3. Auto-download CUF file if enabled
      if (autoDownloadCuf) {
        downloadProjectCufFile(updatedProj, "csv");
      }

      setLastSaved(new Date().toLocaleTimeString());
      setIsOpen(false);

      // 4. Refresh server components in real time
      router.refresh();
    } catch (err: any) {
      alert(`Error updating project: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg shadow-sm transition-all"
          title="Edit project fields, update database, check alert & export CUF"
        >
          <Edit3 className="w-3.5 h-3.5 text-amber-600" />
          <span>Edit Project Telemetry</span>
        </button>

        <button
          onClick={() => downloadProjectCufFile(project, "csv")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-sm transition-all"
          title="Export current project data as official MoSPI 30-field CUF spreadsheet"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export CUF</span>
        </button>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold uppercase block">
                  Interactive Telemetry &amp; Risk Console
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Edit CUF Data: {project.projectName}
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveAndTriggerAlert} className="p-6 space-y-4 overflow-y-auto flex-1 text-slate-800">
              {/* Computed Live Status Banner */}
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                liveRiskScore >= 75 
                  ? "bg-red-50 border-red-200 text-red-900" 
                  : liveRiskScore >= 50 
                  ? "bg-amber-50 border-amber-200 text-amber-900" 
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    liveRiskScore >= 75 ? "bg-red-600 animate-ping" : liveRiskScore >= 50 ? "bg-amber-500" : "bg-emerald-500"
                  }`} />
                  <span>PREVIEW ML RISK: <strong>{liveRiskScore}/100</strong> ({liveRiskCategory})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>COST OVERRUN: <strong>+{calculatedCostOverrun}%</strong></span>
                  <span>GAP: <strong>{gap.toFixed(1)}%</strong></span>
                </div>
              </div>

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Original Cost */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Original Cost (₹ Crore)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={originalCost}
                    onChange={(e) => setOriginalCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
                    required
                  />
                </div>

                {/* Revised Cost */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Revised Cost (₹ Crore)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={revisedCost}
                    onChange={(e) => setRevisedCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
                    required
                  />
                </div>

                {/* Cumulative Expenditure */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Cumulative Expenditure (₹ Crore)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cumulativeExp}
                    onChange={(e) => setCumulativeExp(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
                    required
                  />
                </div>

                {/* Timeline Delay */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Time Overrun (Months Delay)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={timeOverrunMonths}
                    onChange={(e) => setTimeOverrunMonths(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
                    required
                  />
                </div>

                {/* Physical Progress */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Physical Progress (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={physicalProgress}
                    onChange={(e) => setPhysicalProgress(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
                    required
                  />
                </div>

                {/* Project Status */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Project Status
                  </label>
                  <select
                    value={projectStatus}
                    onChange={(e) => setProjectStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="Under Implementation">Under Implementation</option>
                    <option value="Completed">Completed</option>
                    <option value="Shelved">Shelved</option>
                    <option value="In Planning">In Planning</option>
                  </select>
                </div>
              </div>

              {/* Delay Reason */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Reason for Delay / Variance (CUF Field 28)
                </label>
                <textarea
                  rows={2}
                  value={reasonForDelay}
                  onChange={(e) => setReasonForDelay(e.target.value)}
                  placeholder="e.g. Environmental clearances, land acquisition disputes, utility shifting"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              {/* Checkbox Options */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoDownloadCuf}
                    onChange={(e) => setAutoDownloadCuf(e.target.checked)}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Automatically generate & download MoSPI CUF spreadsheet on save</span>
                </label>
              </div>

              {/* Alert Confirmation Box */}
              {isAlertWorthy && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-900">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Hardware & Browser Device Alert will fire:</span>
                    <p className="text-red-800 text-[11px] mt-0.5">
                      Saving these values triggers native notification, audible dual-tone chime, and an in-app analytical modal detailing the risk triggers.
                    </p>
                  </div>
                </div>
              )}
            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadProjectCufFile({ ...project, originalCostCrore: originalCost, revisedCostCrore: revisedCost, cumulativeExpenditureCrore: cumulativeExp, timeOverrunMonths, physicalProgressPercent: physicalProgress, reasonForDelay }, "csv")}
                  className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Download CUF</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSaveAndTriggerAlert()}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating Database &amp; Checking Alert...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 text-amber-400" />
                      <span>Update Database and Check Alert</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import React, { useState } from "react";
import {
  X,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  PlusCircle,
  Loader2,
  Calendar,
  IndianRupee,
  BarChart2,
  Briefcase,
  FileText,
  Info,
} from "lucide-react";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SECTORS = [
  "National Highways",
  "Railways",
  "Power",
  "Petroleum",
  "Urban Development",
  "Water Resources",
  "Coal",
  "Atomic Energy",
  "Civil Aviation",
  "Other",
];

const STATES_LIST = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Delhi", "Jammu & Kashmir", "Ladakh", "Multiple States",
];

const STATUSES = ["Under Implementation", "Completed", "Shelved", "On Hold"];

type Step = "identity" | "financial" | "timeline" | "progress" | "review";
const STEPS: Step[] = ["identity", "financial", "timeline", "progress", "review"];
const STEP_LABELS: Record<Step, string> = {
  identity: "Identity",
  financial: "Financials",
  timeline: "Timeline",
  progress: "Progress",
  review: "Review & Submit",
};

const STEP_ICONS: Record<Step, React.ReactNode> = {
  identity: <Briefcase className="w-3.5 h-3.5" />,
  financial: <IndianRupee className="w-3.5 h-3.5" />,
  timeline: <Calendar className="w-3.5 h-3.5" />,
  progress: <BarChart2 className="w-3.5 h-3.5" />,
  review: <FileText className="w-3.5 h-3.5" />,
};

type FormData = {
  // Identity
  projectId: string;
  projectName: string;
  ministryDepartment: string;
  sector: string;
  subSector: string;
  state: string;
  district: string;
  implementingAgency: string;
  projectStatus: string;
  yearOfApproval: string;
  // Financial
  originalCostCrore: string;
  revisedCostCrore: string;
  anticipatedCostCrore: string;
  cumulativeExpenditureCrore: string;
  expenditureCurrentYearCrore: string;
  expenditurePreviousYearCrore: string;
  landAcquisitionCostCrore: string;
  // Timeline
  originalStartDate: string;
  originalCompletionDate: string;
  revisedCompletionDate: string;
  anticipatedCompletionDate: string;
  reasonForDelay: string;
  // Progress
  physicalProgressPercent: string;
  financialProgressPercent: string;
  milestoneAchievedCount: string;
  milestoneTotalCount: string;
  costRevisionCount: string;
  scheduleRevisionCount: string;
};

const DEFAULT_FORM: FormData = {
  projectId: "", projectName: "", ministryDepartment: "", sector: "", subSector: "",
  state: "", district: "", implementingAgency: "", projectStatus: "Under Implementation",
  yearOfApproval: "",
  originalCostCrore: "", revisedCostCrore: "", anticipatedCostCrore: "",
  cumulativeExpenditureCrore: "", expenditureCurrentYearCrore: "",
  expenditurePreviousYearCrore: "", landAcquisitionCostCrore: "",
  originalStartDate: "", originalCompletionDate: "", revisedCompletionDate: "",
  anticipatedCompletionDate: "", reasonForDelay: "",
  physicalProgressPercent: "", financialProgressPercent: "",
  milestoneAchievedCount: "0", milestoneTotalCount: "0",
  costRevisionCount: "0", scheduleRevisionCount: "0",
};

function FieldGroup({ label, children, required, hint }: { label: string; children: React.ReactNode; required?: boolean; hint?: string }) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
        {required && <span className="text-gov-saffron">*</span>}
        {hint && (
          <span title={hint} className="text-slate-400 cursor-help ml-1">
            <Info className="w-3 h-3" />
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 focus:bg-white transition-colors font-sans";
const selectCls =
  "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:border-slate-500 focus:bg-white transition-colors font-sans appearance-none";

export default function AddProjectModal({ isOpen, onClose, onSuccess }: AddProjectModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>("identity");
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const stepIndex = STEPS.indexOf(currentStep);

  const handleClose = () => {
    setCurrentStep("identity");
    setForm(DEFAULT_FORM);
    setError(null);
    setSuccess(false);
    setFieldErrors({});
    onClose();
  };

  const update = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validateStep = (step: Step): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (step === "identity") {
      if (!form.projectId.trim()) errs.projectId = "Required";
      if (!form.projectName.trim()) errs.projectName = "Required";
      if (!form.ministryDepartment.trim()) errs.ministryDepartment = "Required";
      if (!form.sector) errs.sector = "Required";
      if (!form.state) errs.state = "Required";
      if (!form.implementingAgency.trim()) errs.implementingAgency = "Required";
    }
    if (step === "financial") {
      if (!form.originalCostCrore || isNaN(parseFloat(form.originalCostCrore))) errs.originalCostCrore = "Required / invalid number";
      if (!form.revisedCostCrore || isNaN(parseFloat(form.revisedCostCrore))) errs.revisedCostCrore = "Required / invalid number";
      if (!form.cumulativeExpenditureCrore || isNaN(parseFloat(form.cumulativeExpenditureCrore))) errs.cumulativeExpenditureCrore = "Required / invalid number";
    }
    if (step === "progress") {
      const pp = parseFloat(form.physicalProgressPercent);
      const fp = parseFloat(form.financialProgressPercent);
      if (isNaN(pp) || pp < 0 || pp > 100) errs.physicalProgressPercent = "Must be 0–100";
      if (isNaN(fp) || fp < 0 || fp > 100) errs.financialProgressPercent = "Must be 0–100";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    if (!validateStep(currentStep)) return;
    if (stepIndex < STEPS.length - 1) setCurrentStep(STEPS[stepIndex + 1]);
  };

  const goBack = () => {
    if (stepIndex > 0) setCurrentStep(STEPS[stepIndex - 1]);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Submission failed. Please try again.");
        return;
      }
      setSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      setError("Network error. Please check your connection and retry.");
    } finally {
      setSubmitting(false);
    }
  };

  // Computed overrun preview
  const origCost = parseFloat(form.originalCostCrore) || 0;
  const revCost = parseFloat(form.revisedCostCrore) || 0;
  const costOverrunPreview = origCost > 0 ? (((revCost - origCost) / origCost) * 100).toFixed(1) : "—";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Add New Project">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal Panel */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-lg border border-slate-200 shadow-2xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-slate-900 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-serif">Register New Project</h2>
              <p className="text-[11px] text-slate-500 font-mono">Central Sector Infrastructure Ledger — Manual Entry</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer" aria-label="Close modal">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        {!success && (
          <div className="px-5 pt-3.5 pb-2 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-1">
              {STEPS.map((step, idx) => (
                <React.Fragment key={step}>
                  <button
                    onClick={() => {
                      if (idx < stepIndex) setCurrentStep(step);
                    }}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      step === currentStep
                        ? "bg-slate-900 text-white"
                        : idx < stepIndex
                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        : "text-slate-300 cursor-default"
                    }`}
                    disabled={idx > stepIndex}
                  >
                    {STEP_ICONS[step]}
                    <span className="hidden sm:inline">{STEP_LABELS[step]}</span>
                    <span className="sm:hidden">{idx + 1}</span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div className={`flex-1 h-px ${idx < stepIndex ? "bg-slate-400" : "bg-slate-200"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center border border-green-200">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-bold text-slate-900 font-serif">Project Registered Successfully</h3>
                <p className="text-xs text-slate-500">
                  <span className="font-mono font-semibold text-slate-700">{form.projectId}</span> — {form.projectName}
                </p>
                <p className="text-[11px] text-slate-400">
                  The project has been added to the NIRMAAN AI infrastructure ledger. AI risk scoring will be computed on next model run.
                </p>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => { setSuccess(false); setForm(DEFAULT_FORM); setCurrentStep("identity"); setFieldErrors({}); }}
                  className="px-4 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Add Another Project
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* STEP: Identity */}
              {currentStep === "identity" && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-400 font-mono border-b border-slate-100 pb-2">
                    PROJECT IDENTIFICATION — Provide core administrative details
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldGroup label="Project ID" required hint="Unique identifier as per MoSPI / CUF records">
                      <input id="add-project-id" className={inputCls} placeholder="e.g. NH-2024-MH-0012" value={form.projectId} onChange={update("projectId")} />
                      {fieldErrors.projectId && <p className="text-[10px] text-red-500">{fieldErrors.projectId}</p>}
                    </FieldGroup>
                    <FieldGroup label="Sector" required>
                      <select id="add-sector" className={selectCls} value={form.sector} onChange={update("sector")}>
                        <option value="">Select sector…</option>
                        {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {fieldErrors.sector && <p className="text-[10px] text-red-500">{fieldErrors.sector}</p>}
                    </FieldGroup>
                  </div>

                  <FieldGroup label="Project Name" required>
                    <input id="add-project-name" className={inputCls} placeholder="Full official name of the project" value={form.projectName} onChange={update("projectName")} />
                    {fieldErrors.projectName && <p className="text-[10px] text-red-500">{fieldErrors.projectName}</p>}
                  </FieldGroup>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldGroup label="Ministry / Department" required>
                      <input id="add-ministry" className={inputCls} placeholder="e.g. MoRTH" value={form.ministryDepartment} onChange={update("ministryDepartment")} />
                      {fieldErrors.ministryDepartment && <p className="text-[10px] text-red-500">{fieldErrors.ministryDepartment}</p>}
                    </FieldGroup>
                    <FieldGroup label="Sub-Sector">
                      <input id="add-subsector" className={inputCls} placeholder="e.g. Expressway, Metro Rail" value={form.subSector} onChange={update("subSector")} />
                    </FieldGroup>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldGroup label="State / UT" required>
                      <select id="add-state" className={selectCls} value={form.state} onChange={update("state")}>
                        <option value="">Select state…</option>
                        {STATES_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {fieldErrors.state && <p className="text-[10px] text-red-500">{fieldErrors.state}</p>}
                    </FieldGroup>
                    <FieldGroup label="District">
                      <input id="add-district" className={inputCls} placeholder="District (optional)" value={form.district} onChange={update("district")} />
                    </FieldGroup>
                  </div>

                  <FieldGroup label="Implementing Agency" required>
                    <input id="add-agency" className={inputCls} placeholder="e.g. NHAI, RVNL, NTPC" value={form.implementingAgency} onChange={update("implementingAgency")} />
                    {fieldErrors.implementingAgency && <p className="text-[10px] text-red-500">{fieldErrors.implementingAgency}</p>}
                  </FieldGroup>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldGroup label="Project Status">
                      <select id="add-status" className={selectCls} value={form.projectStatus} onChange={update("projectStatus")}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </FieldGroup>
                    <FieldGroup label="Year of Approval">
                      <input id="add-approval-year" className={inputCls} type="number" placeholder="e.g. 2020" min="1990" max="2030" value={form.yearOfApproval} onChange={update("yearOfApproval")} />
                    </FieldGroup>
                  </div>
                </div>
              )}

              {/* STEP: Financial */}
              {currentStep === "financial" && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-400 font-mono border-b border-slate-100 pb-2">
                    FINANCIAL DATA — All amounts in Indian Rupees (₹ Crore)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldGroup label="Original Cost (₹ Cr)" required>
                      <input id="add-orig-cost" className={inputCls} type="number" step="0.01" placeholder="0.00" min="0" value={form.originalCostCrore} onChange={update("originalCostCrore")} />
                      {fieldErrors.originalCostCrore && <p className="text-[10px] text-red-500">{fieldErrors.originalCostCrore}</p>}
                    </FieldGroup>
                    <FieldGroup label="Revised Cost (₹ Cr)" required>
                      <input id="add-rev-cost" className={inputCls} type="number" step="0.01" placeholder="0.00" min="0" value={form.revisedCostCrore} onChange={update("revisedCostCrore")} />
                      {fieldErrors.revisedCostCrore && <p className="text-[10px] text-red-500">{fieldErrors.revisedCostCrore}</p>}
                    </FieldGroup>
                  </div>

                  {/* Auto-computed overrun preview */}
                  {origCost > 0 && revCost > 0 && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded border text-xs font-mono ${parseFloat(costOverrunPreview) > 0 ? "border-amber-200 bg-amber-50 text-amber-800" : "border-green-200 bg-green-50 text-green-800"}`}>
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      Computed Cost Overrun: <strong>{costOverrunPreview}%</strong>
                      {parseFloat(costOverrunPreview) > 20 && <span className="ml-1 text-[10px] font-semibold text-amber-600">— flagged for review</span>}
                    </div>
                  )}

                  <FieldGroup label="Cumulative Expenditure (₹ Cr)" required>
                    <input id="add-cum-exp" className={inputCls} type="number" step="0.01" placeholder="0.00" min="0" value={form.cumulativeExpenditureCrore} onChange={update("cumulativeExpenditureCrore")} />
                    {fieldErrors.cumulativeExpenditureCrore && <p className="text-[10px] text-red-500">{fieldErrors.cumulativeExpenditureCrore}</p>}
                  </FieldGroup>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldGroup label="Current Year Expenditure (₹ Cr)">
                      <input id="add-curr-yr-exp" className={inputCls} type="number" step="0.01" placeholder="0.00" min="0" value={form.expenditureCurrentYearCrore} onChange={update("expenditureCurrentYearCrore")} />
                    </FieldGroup>
                    <FieldGroup label="Previous Year Expenditure (₹ Cr)">
                      <input id="add-prev-yr-exp" className={inputCls} type="number" step="0.01" placeholder="0.00" min="0" value={form.expenditurePreviousYearCrore} onChange={update("expenditurePreviousYearCrore")} />
                    </FieldGroup>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldGroup label="Anticipated Cost (₹ Cr)">
                      <input id="add-ant-cost" className={inputCls} type="number" step="0.01" placeholder="0.00" min="0" value={form.anticipatedCostCrore} onChange={update("anticipatedCostCrore")} />
                    </FieldGroup>
                    <FieldGroup label="Land Acquisition Cost (₹ Cr)">
                      <input id="add-land-cost" className={inputCls} type="number" step="0.01" placeholder="0.00" min="0" value={form.landAcquisitionCostCrore} onChange={update("landAcquisitionCostCrore")} />
                    </FieldGroup>
                  </div>
                </div>
              )}

              {/* STEP: Timeline */}
              {currentStep === "timeline" && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-400 font-mono border-b border-slate-100 pb-2">
                    TIMELINE — Project dates and schedule revisions
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldGroup label="Original Start Date">
                      <input id="add-start-date" className={inputCls} type="date" value={form.originalStartDate} onChange={update("originalStartDate")} />
                    </FieldGroup>
                    <FieldGroup label="Original Completion Date">
                      <input id="add-orig-comp-date" className={inputCls} type="date" value={form.originalCompletionDate} onChange={update("originalCompletionDate")} />
                    </FieldGroup>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldGroup label="Revised Completion Date" hint="Used to auto-compute time overrun">
                      <input id="add-rev-comp-date" className={inputCls} type="date" value={form.revisedCompletionDate} onChange={update("revisedCompletionDate")} />
                    </FieldGroup>
                    <FieldGroup label="Anticipated Completion Date">
                      <input id="add-ant-comp-date" className={inputCls} type="date" value={form.anticipatedCompletionDate} onChange={update("anticipatedCompletionDate")} />
                    </FieldGroup>
                  </div>
                  <FieldGroup label="Reason for Delay">
                    <textarea
                      id="add-delay-reason"
                      className={`${inputCls} resize-none`}
                      rows={3}
                      placeholder="e.g. Land acquisition issues, forest clearance pending, statutory approvals delay…"
                      value={form.reasonForDelay}
                      onChange={update("reasonForDelay")}
                    />
                  </FieldGroup>
                </div>
              )}

              {/* STEP: Progress */}
              {currentStep === "progress" && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-400 font-mono border-b border-slate-100 pb-2">
                    IMPLEMENTATION PROGRESS — Physical, financial, and milestone metrics
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldGroup label="Physical Progress (%)" required>
                      <input id="add-phys-prog" className={inputCls} type="number" step="0.1" placeholder="0–100" min="0" max="100" value={form.physicalProgressPercent} onChange={update("physicalProgressPercent")} />
                      {fieldErrors.physicalProgressPercent && <p className="text-[10px] text-red-500">{fieldErrors.physicalProgressPercent}</p>}
                    </FieldGroup>
                    <FieldGroup label="Financial Progress (%)" required>
                      <input id="add-fin-prog" className={inputCls} type="number" step="0.1" placeholder="0–100" min="0" max="100" value={form.financialProgressPercent} onChange={update("financialProgressPercent")} />
                      {fieldErrors.financialProgressPercent && <p className="text-[10px] text-red-500">{fieldErrors.financialProgressPercent}</p>}
                    </FieldGroup>
                  </div>

                  {/* Progress bars preview */}
                  {form.physicalProgressPercent && (
                    <div className="space-y-2 p-3 bg-slate-50 rounded border border-slate-100">
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                          <span>Physical Progress</span>
                          <span className="font-mono">{form.physicalProgressPercent}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-200">
                          <div className="h-1.5 rounded-full bg-gov-teal transition-all" style={{ width: `${Math.min(100, parseFloat(form.physicalProgressPercent) || 0)}%` }} />
                        </div>
                      </div>
                      {form.financialProgressPercent && (
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                            <span>Financial Progress</span>
                            <span className="font-mono">{form.financialProgressPercent}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-200">
                            <div className="h-1.5 rounded-full bg-gov-saffron transition-all" style={{ width: `${Math.min(100, parseFloat(form.financialProgressPercent) || 0)}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <FieldGroup label="Milestones Achieved">
                      <input id="add-ms-achieved" className={inputCls} type="number" min="0" placeholder="0" value={form.milestoneAchievedCount} onChange={update("milestoneAchievedCount")} />
                    </FieldGroup>
                    <FieldGroup label="Milestones Total">
                      <input id="add-ms-total" className={inputCls} type="number" min="0" placeholder="0" value={form.milestoneTotalCount} onChange={update("milestoneTotalCount")} />
                    </FieldGroup>
                    <FieldGroup label="Cost Revisions">
                      <input id="add-cost-rev" className={inputCls} type="number" min="0" placeholder="0" value={form.costRevisionCount} onChange={update("costRevisionCount")} />
                    </FieldGroup>
                    <FieldGroup label="Schedule Revisions">
                      <input id="add-sched-rev" className={inputCls} type="number" min="0" placeholder="0" value={form.scheduleRevisionCount} onChange={update("scheduleRevisionCount")} />
                    </FieldGroup>
                  </div>
                </div>
              )}

              {/* STEP: Review */}
              {currentStep === "review" && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-400 font-mono border-b border-slate-100 pb-2">
                    REVIEW — Confirm all details before submitting to the NIRMAAN AI ledger
                  </p>

                  {/* Review cards */}
                  {[
                    {
                      title: "Identity",
                      icon: <Briefcase className="w-3.5 h-3.5" />,
                      rows: [
                        ["Project ID", form.projectId],
                        ["Name", form.projectName],
                        ["Ministry", form.ministryDepartment],
                        ["Sector", form.sector + (form.subSector ? ` / ${form.subSector}` : "")],
                        ["State", form.state + (form.district ? `, ${form.district}` : "")],
                        ["Agency", form.implementingAgency],
                        ["Status", form.projectStatus],
                      ],
                    },
                    {
                      title: "Financials (₹ Crore)",
                      icon: <IndianRupee className="w-3.5 h-3.5" />,
                      rows: [
                        ["Original Cost", `₹${form.originalCostCrore} Cr`],
                        ["Revised Cost", `₹${form.revisedCostCrore} Cr`],
                        ["Cost Overrun", `${costOverrunPreview}%`],
                        ["Cumulative Expenditure", `₹${form.cumulativeExpenditureCrore} Cr`],
                      ],
                    },
                    {
                      title: "Progress",
                      icon: <BarChart2 className="w-3.5 h-3.5" />,
                      rows: [
                        ["Physical Progress", `${form.physicalProgressPercent}%`],
                        ["Financial Progress", `${form.financialProgressPercent}%`],
                        ["Milestones", `${form.milestoneAchievedCount} / ${form.milestoneTotalCount}`],
                      ],
                    },
                  ].map((section) => (
                    <div key={section.title} className="border border-slate-200 rounded overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-100">
                        <span className="text-slate-500">{section.icon}</span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{section.title}</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {section.rows.filter(([, v]) => v && v !== "").map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between px-3 py-1.5 text-[11px]">
                            <span className="text-slate-500">{k}</span>
                            <span className="text-slate-900 font-medium font-mono text-right">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex items-start gap-2 px-3 py-2 rounded bg-blue-50 border border-blue-100 text-[11px] text-blue-800">
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>After registration, AI risk scoring (ML model + SHAP explainability) will run automatically on the next model cycle. The project will appear in the ledger immediately.</span>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded bg-red-50 border border-red-200 text-xs text-red-700">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between shrink-0 bg-white">
            <button
              onClick={goBack}
              disabled={stepIndex === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>

            <span className="text-[11px] text-slate-400 font-mono">
              Step {stepIndex + 1} of {STEPS.length}
            </span>

            {currentStep === "review" ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                id="add-project-submit"
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded transition-colors disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Registering…
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    Register Project
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={goNext}
                id={`add-project-next-${currentStep}`}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded transition-colors cursor-pointer"
              >
                Continue
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

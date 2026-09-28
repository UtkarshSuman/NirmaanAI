"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Download,
  Database,
  Layers,
  Cpu,
  FileText,
  BarChart2,
  ExternalLink,
  ShieldCheck,
  Check,
} from "lucide-react";
import {
  parseCufFile,
  validateAndFormatCufRecords,
  downloadCufTemplate,
  DEMO_CUF_RECORDS,
  type ParsedCufRecord,
  type CufValidationResult,
  OFFICIAL_CUF_COLUMNS,
} from "@/lib/cufParser";
import { triggerDeviceAlert } from "@/lib/deviceAlert";

interface CufIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestionSuccess?: (result: any) => void;
}

type IngestionStep = "upload" | "preview" | "processing" | "success";

export default function CufIngestionModal({
  isOpen,
  onClose,
  onIngestionSuccess,
}: CufIngestionModalProps) {
  const [step, setStep] = useState<IngestionStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [validationResult, setValidationResult] = useState<CufValidationResult | null>(null);
  const [updateType, setUpdateType] = useState<"incremental" | "full_refresh">("incremental");
  const [isDryRun, setIsDryRun] = useState(false);
  const [processingPhase, setProcessingPhase] = useState(0);
  const [ingestionOutcome, setIngestionOutcome] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleReset = () => {
    setStep("upload");
    setSelectedFile(null);
    setValidationResult(null);
    setProcessingPhase(0);
    setIngestionOutcome(null);
    setErrorMessage(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileProcess = async (file: File) => {
    try {
      setParsing(true);
      setErrorMessage(null);
      setSelectedFile(file);
      const res = await parseCufFile(file);
      setValidationResult(res);
      setStep("preview");
    } catch (err: any) {
      console.error("File parse error:", err);
      setErrorMessage("Failed to parse file. Ensure it is a valid .csv or .xlsx file.");
    } finally {
      setParsing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleLoadDemoData = () => {
    setErrorMessage(null);
    setSelectedFile(null);
    const res = validateAndFormatCufRecords(DEMO_CUF_RECORDS);
    setValidationResult(res);
    setStep("preview");
  };

  const triggerIngestion = async () => {
    if (!validationResult || validationResult.records.length === 0) return;

    setStep("processing");
    setProcessingPhase(1);

    // Multi-phase animation simulation while making the API call
    const phaseTimer1 = setTimeout(() => setProcessingPhase(2), 600);
    const phaseTimer2 = setTimeout(() => setProcessingPhase(3), 1300);

    try {
      let response: Response;

      if (selectedFile) {
        // Upload with FormData
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("update_type", updateType);
        formData.append("dry_run", isDryRun ? "true" : "false");

        response = await fetch("/api/projects/upload", {
          method: "POST",
          body: formData,
        });
      } else {
        // Upload pre-parsed records
        response = await fetch("/api/projects/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            records: validationResult.records,
            update_type: updateType,
            dry_run: isDryRun,
          }),
        });
      }

      const outcome = await response.json();

      if (!response.ok) {
        throw new Error(outcome.error || "Ingestion API returned failure status");
      }

      setProcessingPhase(4);
      setTimeout(() => {
        setIngestionOutcome(outcome);
        setStep("success");
        if (onIngestionSuccess) {
          onIngestionSuccess(outcome);
        }

        // Send alert to the device on which file ingested (showing why triggered & that project data)
        if (!isDryRun && validationResult && validationResult.records.length > 0) {
          const riskyProject = validationResult.records.find(
            (r) => r.costOverrunPercent >= 15 || r.timeOverrunMonths >= 12
          ) || validationResult.records[0];

          if (riskyProject) {
            const costOverrun = riskyProject.costOverrunPercent || 0;
            const timeOverrun = riskyProject.timeOverrunMonths || 0;
            const reasons: string[] = [];

            if (costOverrun > 20) {
              reasons.push(`MoSPI Cost Overrun Ceiling Exceeded: Project reports +${costOverrun.toFixed(1)}% cost variance in the ingested CUF spreadsheet.`);
            } else if (costOverrun > 10) {
              reasons.push(`Budget Escalation Notice: +${costOverrun.toFixed(1)}% cost variance above initial approved baseline.`);
            }

            if (timeOverrun >= 18) {
              reasons.push(`Severe Schedule Protraction: Delay of ${timeOverrun} months breaches critical path milestone boundary.`);
            } else if (timeOverrun > 6) {
              reasons.push(`Schedule Slippage: ${timeOverrun} months project delay recorded.`);
            }

            if (riskyProject.reasonForDelay) {
              reasons.push(`Reported Impediment: ${riskyProject.reasonForDelay}`);
            }

            if (reasons.length === 0) {
              reasons.push("CUF file ingested and validated into national project ledger.");
            }

            const calculatedScore = Number(Math.min(99.4, Math.max(15, (costOverrun * 1.4) + (timeOverrun * 1.1) + 12)).toFixed(1));
            const severity = calculatedScore >= 75 ? "CRITICAL" : calculatedScore >= 50 ? "HIGH" : "MODERATE";

            triggerDeviceAlert({
              title: `CUF File Ingestion Alert: ${riskyProject.projectName}`,
              severity,
              reasons,
              project: {
                projectId: riskyProject.projectId,
                projectName: riskyProject.projectName,
                sector: riskyProject.sector,
                state: riskyProject.state,
                implementingAgency: riskyProject.implementingAgency,
                originalCostCrore: riskyProject.originalCostCrore,
                revisedCostCrore: riskyProject.revisedCostCrore,
                costOverrunPercent: costOverrun,
                timeOverrunMonths: timeOverrun,
                riskScore: calculatedScore,
                riskCategory: severity,
                reasonForDelay: riskyProject.reasonForDelay,
              },
              cufGenerated: false,
            });
          }
        }
      }, 700);
    } catch (err: any) {
      console.error("Ingestion failed:", err);
      setErrorMessage(err.message || "Ingestion pipeline failure");
      setStep("preview");
    } finally {
      clearTimeout(phaseTimer1);
      clearTimeout(phaseTimer2);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0b1324] border border-[#1e2e4f] rounded-2xl shadow-2xl text-slate-100 overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top MoSPI / PAIMANA Badge Header */}
        <div className="px-6 py-4 border-b border-[#1e2e4f] bg-gradient-to-r from-[#0c162c] via-[#101e3d] to-[#0c162c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-orange-400 font-mono">
                  MoSPI PAIMANA • CUF Protocol
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold uppercase">
                  Live ML Connected
                </span>
              </div>
              <h2 className="text-lg font-serif font-bold text-white tracking-tight">
                Live CUF Ingestion Console
              </h2>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="px-6 py-2.5 bg-[#080d19] border-b border-[#16233d] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-6">
            <div
              className={`flex items-center gap-2 ${
                step === "upload" ? "text-orange-400 font-semibold" : "text-slate-400"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                  step === "upload"
                    ? "bg-orange-500 text-white"
                    : validationResult
                    ? "bg-emerald-500/30 text-emerald-300"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                1
              </span>
              <span>Upload &amp; Options</span>
            </div>
            <span className="text-slate-700">/</span>
            <div
              className={`flex items-center gap-2 ${
                step === "preview" ? "text-orange-400 font-semibold" : "text-slate-400"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                  step === "preview"
                    ? "bg-orange-500 text-white"
                    : step === "processing" || step === "success"
                    ? "bg-emerald-500/30 text-emerald-300"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                2
              </span>
              <span>Validation &amp; Preview</span>
            </div>
            <span className="text-slate-700">/</span>
            <div
              className={`flex items-center gap-2 ${
                step === "processing"
                  ? "text-orange-400 font-semibold"
                  : step === "success"
                  ? "text-emerald-400 font-semibold"
                  : "text-slate-400"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                  step === "processing"
                    ? "bg-orange-500 text-white animate-pulse"
                    : step === "success"
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                3
              </span>
              <span>Pipeline &amp; Summary</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
            <span>Standard: 30 CUF Fields</span>
            <span>•</span>
            <span>Inference: 47 Features</span>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <p className="font-semibold">Ingestion Notice</p>
                <p className="mt-0.5 text-rose-200/90">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* STEP 1: FILE UPLOAD & CONFIGURATION */}
          {step === "upload" && (
            <div className="space-y-6">
              {/* Drag and drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                  dragActive
                    ? "border-orange-500 bg-orange-500/10 scale-[1.008]"
                    : "border-slate-700/80 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-900/80"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                  accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600/30 to-amber-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shadow-inner">
                  {parsing ? (
                    <div className="w-8 h-8 border-3 border-orange-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UploadCloud className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <h3 className="text-base font-semibold text-white">
                    {parsing ? "Parsing CUF Document..." : "Drop Common Upload Form (CUF) File Here"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Upload official MoSPI/PAIMANA monthly project progress reports in Excel (
                    <strong className="text-slate-300">.xlsx / .xls</strong>) or{" "}
                    <strong className="text-slate-300">.csv</strong> format.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-700">
                    .CSV
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-700">
                    .XLSX
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-700">
                    .XLS
                  </span>
                  <span className="text-xs text-slate-500">• Max 50MB</span>
                </div>
              </div>

              {/* Template & Demo Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs mb-1">
                      <Download className="w-3.5 h-3.5 text-orange-400" />
                      <span>Official MoSPI CUF Template</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Download pre-formatted headers with all 30 mandatory and optional CUF fields.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => downloadCufTemplate("csv")}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>CSV Template</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadCufTemplate("xlsx")}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Excel (.xlsx)</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border border-blue-800/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-blue-200 font-semibold text-xs mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Instant 1-Click Verification Batch</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Load 5 realistic Central Sector infrastructure projects across NHAI, DFCCIL, NTPC, BMRCL to test the live ML pipeline.
                    </p>
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleLoadDemoData}
                      className="w-full px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-900/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Load 5-Project MoSPI Batch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Ingestion Parameters */}
              <div className="p-4 rounded-xl bg-[#0e1628] border border-slate-800 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Ingestion Policy Configuration
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/70 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="radio"
                      name="updateType"
                      value="incremental"
                      checked={updateType === "incremental"}
                      onChange={() => setUpdateType("incremental")}
                      className="mt-0.5 text-orange-500 focus:ring-orange-500"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white">Incremental Upsert (Recommended)</div>
                      <div className="text-[11px] text-slate-400">
                        Updates existing projects by Project ID and inserts new entries. Preserves past historical snapshots.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/70 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={isDryRun}
                      onChange={(e) => setIsDryRun(e.target.checked)}
                      className="mt-0.5 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white">Dry Run Simulation Mode</div>
                      <div className="text-[11px] text-slate-400">
                        Simulate schema mapping and run validation without committing any records to database.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: VALIDATION & DATA PREVIEW */}
          {step === "preview" && validationResult && (
            <div className="space-y-5">
              {/* Summary Metric Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Total Rows</span>
                  <div className="text-xl font-bold font-mono text-white mt-0.5">
                    {validationResult.totalRows}
                  </div>
                  <span className="text-[10px] text-slate-500">Processed from file</span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                  <span className="text-[10px] text-emerald-400 uppercase font-medium">Valid Records</span>
                  <div className="text-xl font-bold font-mono text-emerald-300 mt-0.5">
                    {validationResult.validCount}
                  </div>
                  <span className="text-[10px] text-emerald-500/80">Ready for ML sync</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Portfolio Volume</span>
                  <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">
                    ₹{validationResult.totalCostCrore.toLocaleString()} Cr
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {validationResult.sectorsDetected.length} sectors detected
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Validation Status</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    {validationResult.errorCount === 0 ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-300">Clean Schema</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-semibold text-amber-300">
                          {validationResult.errorCount} skipped
                        </span>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {validationResult.warnings.length} auto-imputed
                  </span>
                </div>
              </div>

              {/* Detected Sectors Badges */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] text-slate-400 font-medium">Sectors:</span>
                {validationResult.sectorsDetected.map((sector) => (
                  <span
                    key={sector}
                    className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[11px] text-slate-300 border border-slate-700"
                  >
                    {sector}
                  </span>
                ))}
              </div>

              {/* Data Preview Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/70">
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">
                    CUF Record Validation Grid ({validationResult.records.length} items)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    All 30 CUF columns normalized
                  </span>
                </div>

                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#0b1220] sticky top-0 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2.5">Project ID</th>
                        <th className="px-3 py-2.5">Project Name</th>
                        <th className="px-3 py-2.5">Sector</th>
                        <th className="px-3 py-2.5">State</th>
                        <th className="px-3 py-2.5 text-right">Revised Cost</th>
                        <th className="px-3 py-2.5 text-right">Cost Overrun</th>
                        <th className="px-3 py-2.5 text-right">Delay (Mo)</th>
                        <th className="px-3 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {validationResult.records.map((r, i) => (
                        <tr key={r.projectId || i} className="hover:bg-slate-900/60 transition-colors">
                          <td className="px-3 py-2 font-mono text-orange-400 font-medium whitespace-nowrap">
                            {r.projectId}
                          </td>
                          <td className="px-3 py-2 text-slate-200 max-w-[220px] truncate" title={r.projectName}>
                            {r.projectName}
                          </td>
                          <td className="px-3 py-2 text-slate-400 whitespace-nowrap">{r.sector}</td>
                          <td className="px-3 py-2 text-slate-400 whitespace-nowrap">{r.state}</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-200 whitespace-nowrap">
                            ₹{r.revisedCostCrore.toLocaleString()} Cr
                          </td>
                          <td className="px-3 py-2 text-right font-mono whitespace-nowrap">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                                r.costOverrunPercent > 20
                                  ? "bg-rose-500/20 text-rose-400"
                                  : r.costOverrunPercent > 0
                                  ? "bg-amber-500/20 text-amber-400"
                                  : "bg-emerald-500/20 text-emerald-400"
                              }`}
                            >
                              {r.costOverrunPercent > 0 ? `+${r.costOverrunPercent}%` : `${r.costOverrunPercent}%`}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-mono whitespace-nowrap">
                            <span
                              className={`font-semibold ${
                                r.timeOverrunMonths > 12
                                  ? "text-rose-400"
                                  : r.timeOverrunMonths > 0
                                  ? "text-amber-400"
                                  : "text-slate-400"
                              }`}
                            >
                              {r.timeOverrunMonths}m
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                              {r.projectStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Choose Another File</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDryRun(true);
                      triggerIngestion();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                  >
                    Run Dry-Run Audit
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDryRun(false);
                      triggerIngestion();
                    }}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-xs font-bold text-white shadow-lg shadow-orange-600/30 transition-all flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    <span>Commit Live CUF Ingestion</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: HIGH-TECH PROCESSING ANIMATION */}
          {step === "processing" && (
            <div className="py-10 px-4 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
                <div className="absolute inset-2 rounded-full border-4 border-blue-500/20 border-b-blue-400 animate-spin [animation-duration:1.5s]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="w-8 h-8 text-orange-400 animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-serif font-bold text-white tracking-tight">
                  Executing Live CUF Ingestion Pipeline
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  Normalizing Common Upload Form data, writing to persistent database, and updating ML ensemble risk inference.
                </p>
              </div>

              {/* Pipeline Step Progress Visualizer */}
              <div className="w-full max-w-md space-y-2.5 text-left text-xs bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>1. CUF Schema Parsing &amp; Type Sanitization</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">COMPLETE</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-2">
                    {processingPhase >= 2 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                    )}
                    <span>2. SQLite / Prisma Database Upsert</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono ${
                      processingPhase >= 2 ? "text-emerald-400" : "text-orange-400 animate-pulse"
                    }`}
                  >
                    {processingPhase >= 2 ? "SAVED" : "WRITING..."}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-2">
                    {processingPhase >= 3 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : processingPhase === 2 ? (
                      <div className="w-4 h-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700" />
                    )}
                    <span>3. 47-Feature Transformation &amp; Lag Index</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono ${
                      processingPhase >= 3
                        ? "text-emerald-400"
                        : processingPhase === 2
                        ? "text-orange-400 animate-pulse"
                        : "text-slate-600"
                    }`}
                  >
                    {processingPhase >= 3 ? "ENGINEERED" : processingPhase === 2 ? "COMPUTING..." : "PENDING"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-2">
                    {processingPhase >= 4 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : processingPhase === 3 ? (
                      <div className="w-4 h-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700" />
                    )}
                    <span>4. XGBoost/LightGBM Risk Scoring</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono ${
                      processingPhase >= 4
                        ? "text-emerald-400"
                        : processingPhase === 3
                        ? "text-orange-400 animate-pulse"
                        : "text-slate-600"
                    }`}
                  >
                    {processingPhase >= 4 ? "CALIBRATED" : processingPhase === 3 ? "INFERRING..." : "QUEUED"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS & AUDIT SUMMARY */}
          {step === "success" && ingestionOutcome && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/40 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-900/30">
                  <Check className="w-7 h-7 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-white tracking-tight">
                    {ingestionOutcome.dry_run ? "Simulation Audit Completed" : "CUF Data Successfully Ingested"}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-lg mx-auto">
                    {ingestionOutcome.dry_run
                      ? "Validation check passed. All records conform to PAIMANA Common Upload Form standard."
                      : "The projects ledger has been refreshed. Predictive risk models and early warning alerts have been recalibrated."}
                  </p>
                </div>
              </div>

              {/* Metric Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-medium">New Projects Created</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                    {ingestionOutcome.records_created ?? ingestionOutcome.records_valid}
                  </div>
                  <span className="text-[10px] text-slate-500">Added to repository</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Existing Updated</span>
                  <div className="text-2xl font-bold font-mono text-blue-400 mt-0.5">
                    {ingestionOutcome.records_updated ?? 0}
                  </div>
                  <span className="text-[10px] text-slate-500">Incremental revision</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Portfolio Delta</span>
                  <div className="text-2xl font-bold font-mono text-amber-300 mt-0.5">
                    ₹{ingestionOutcome.total_cost_crore?.toLocaleString()} Cr
                  </div>
                  <span className="text-[10px] text-slate-500">Total volume represented</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Pipeline Latency</span>
                  <div className="text-2xl font-bold font-mono text-purple-400 mt-0.5">
                    {ingestionOutcome.processing_time_ms} ms
                  </div>
                  <span className="text-[10px] text-slate-500">End-to-end execution</span>
                </div>
              </div>

              {/* Next Steps CTA */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  Ingest Another Batch
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-700/30 transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Done &amp; View Ledger</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Audit Notice */}
        <div className="px-6 py-2.5 bg-[#070b15] border-t border-[#16233d] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Grounded on MoSPI OCMS / PAIMANA Architecture</span>
          </div>
          <div className="font-mono text-[10px] text-slate-500">
            NIRMAAN AI • Common Upload Form Ingestion v1.4
          </div>
        </div>
      </div>
    </div>
  );
}

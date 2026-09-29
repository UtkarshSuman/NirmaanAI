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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white border border-slate-200 rounded-lg shadow-2xl text-slate-900 overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top MoSPI / PAIMANA Badge Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-slate-900 flex items-center justify-center text-white shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-gov-saffron font-mono">
                  MoSPI PAIMANA • CUF Protocol
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold uppercase">
                  Live ML Connected
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-tight">
                Live CUF Ingestion Console
              </h2>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-3 sm:gap-6">
            <div
              className={`flex items-center gap-2 ${
                step === "upload" ? "text-slate-900 font-bold" : "text-slate-500"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                  step === "upload"
                    ? "bg-slate-900 text-white"
                    : validationResult
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                1
              </span>
              <span>Upload &amp; Options</span>
            </div>
            <span className="text-slate-300">/</span>
            <div
              className={`flex items-center gap-2 ${
                step === "preview" ? "text-slate-900 font-bold" : "text-slate-500"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                  step === "preview"
                    ? "bg-slate-900 text-white"
                    : step === "processing" || step === "success"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                2
              </span>
              <span>Validation &amp; Preview</span>
            </div>
            <span className="text-slate-300">/</span>
            <div
              className={`flex items-center gap-2 ${
                step === "processing"
                  ? "text-gov-saffron font-bold"
                  : step === "success"
                  ? "text-emerald-700 font-bold"
                  : "text-slate-500"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                  step === "processing"
                    ? "bg-gov-saffron text-white animate-pulse"
                    : step === "success"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                3
              </span>
              <span>Pipeline &amp; Summary</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>Standard: 30 CUF Fields</span>
            <span>•</span>
            <span>Inference: 47 Features</span>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-semibold">Ingestion Notice</p>
                <p className="mt-0.5 text-rose-700">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* STEP 1: FILE UPLOAD & CONFIGURATION */}
          {step === "upload" && (
            <div className="space-y-5">
              {/* Drag and drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-lg p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                  dragActive
                    ? "border-gov-saffron bg-orange-50/50 scale-[1.005]"
                    : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100/60"
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

                <div className="w-14 h-14 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-gov-saffron shadow-2xs">
                  {parsing ? (
                    <div className="w-7 h-7 border-2 border-gov-saffron border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UploadCloud className="w-7 h-7" />
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    {parsing ? "Parsing CUF Document..." : "Drop Common Upload Form (CUF) File Here"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Upload official MoSPI/PAIMANA monthly project progress reports in Excel (
                    <strong className="text-slate-800">.xlsx / .xls</strong>) or{" "}
                    <strong className="text-slate-800">.csv</strong> format.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded bg-white text-[10px] text-slate-700 font-mono border border-slate-200 shadow-2xs font-semibold">
                    .CSV
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white text-[10px] text-slate-700 font-mono border border-slate-200 shadow-2xs font-semibold">
                    .XLSX
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white text-[10px] text-slate-700 font-mono border border-slate-200 shadow-2xs font-semibold">
                    .XLS
                  </span>
                  <span className="text-xs text-slate-400 font-mono">• Max 50MB</span>
                </div>
              </div>

              {/* Template & Demo Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xs mb-1">
                      <Download className="w-3.5 h-3.5 text-gov-saffron" />
                      <span>Official MoSPI CUF Template</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Download pre-formatted headers with all 30 mandatory and optional CUF fields.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => downloadCufTemplate("csv")}
                      className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>CSV Template</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadCufTemplate("xlsx")}
                      className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Excel (.xlsx)</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-orange-50/50 border border-orange-200/80 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xs mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-gov-saffron" />
                      <span>Instant 1-Click Verification Batch</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Load 5 realistic Central Sector infrastructure projects across NHAI, DFCCIL, NTPC, BMRCL to test the live ML pipeline.
                    </p>
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleLoadDemoData}
                      className="w-full px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Load 5-Project MoSPI Batch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Ingestion Parameters */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Ingestion Policy Configuration
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="flex items-start gap-3 p-3 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-slate-300 shadow-2xs">
                    <input
                      type="radio"
                      name="updateType"
                      value="incremental"
                      checked={updateType === "incremental"}
                      onChange={() => setUpdateType("incremental")}
                      className="mt-0.5 text-gov-saffron focus:ring-orange-500"
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Incremental Upsert (Recommended)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Updates existing projects by Project ID and inserts new entries. Preserves historical records.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-slate-300 shadow-2xs">
                    <input
                      type="checkbox"
                      checked={isDryRun}
                      onChange={(e) => setIsDryRun(e.target.checked)}
                      className="mt-0.5 text-gov-saffron rounded focus:ring-orange-500"
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Dry Run Simulation Mode</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
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
            <div className="space-y-4">
              {/* Summary Metric Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Rows</span>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    {validationResult.totalRows}
                  </div>
                  <span className="text-[10px] text-slate-500">Processed from file</span>
                </div>

                <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200 shadow-2xs">
                  <span className="text-[10px] text-emerald-700 uppercase font-semibold">Valid Records</span>
                  <div className="text-xl font-bold font-mono text-emerald-800 mt-0.5">
                    {validationResult.validCount}
                  </div>
                  <span className="text-[10px] text-emerald-600">Ready for ML sync</span>
                </div>

                <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Portfolio Volume</span>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    ₹{validationResult.totalCostCrore.toLocaleString()} Cr
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {validationResult.sectorsDetected.length} sectors detected
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Validation Status</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    {validationResult.errorCount === 0 ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700">Clean Schema</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-semibold text-amber-700">
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
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Sectors:</span>
                {validationResult.sectorsDetected.map((sector) => (
                  <span
                    key={sector}
                    className="px-2 py-0.5 rounded bg-slate-100 text-[11px] text-slate-700 border border-slate-200 font-medium"
                  >
                    {sector}
                  </span>
                ))}
              </div>

              {/* Data Preview Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    CUF Record Validation Grid ({validationResult.records.length} items)
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    All 30 CUF columns normalized
                  </span>
                </div>

                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/80 sticky top-0 text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
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
                    <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
                      {validationResult.records.map((r, i) => (
                        <tr key={r.projectId || i} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-3 py-2 font-mono text-slate-900 font-semibold whitespace-nowrap">
                            {r.projectId}
                          </td>
                          <td className="px-3 py-2 text-slate-900 font-medium max-w-[220px] truncate" title={r.projectName}>
                            {r.projectName}
                          </td>
                          <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{r.sector}</td>
                          <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{r.state}</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-900 whitespace-nowrap">
                            ₹{r.revisedCostCrore.toLocaleString()} Cr
                          </td>
                          <td className="px-3 py-2 text-right font-mono whitespace-nowrap">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[11px] font-semibold border ${
                                r.costOverrunPercent > 20
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : r.costOverrunPercent > 0
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {r.costOverrunPercent > 0 ? `+${r.costOverrunPercent}%` : `${r.costOverrunPercent}%`}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-mono whitespace-nowrap">
                            <span
                              className={`font-semibold ${
                                r.timeOverrunMonths > 12
                                  ? "text-rose-600"
                                  : r.timeOverrunMonths > 0
                                  ? "text-amber-600"
                                  : "text-slate-600"
                              }`}
                            >
                              {r.timeOverrunMonths}m
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
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
                  className="px-3.5 py-1.5 rounded bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Choose Another File</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDryRun(true);
                      triggerIngestion();
                    }}
                    className="px-3.5 py-1.5 rounded bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    Run Dry-Run Audit
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDryRun(false);
                      triggerIngestion();
                    }}
                    className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5 text-gov-saffron" />
                    <span>Commit Live CUF Ingestion</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: HIGH-TECH PROCESSING ANIMATION */}
          {step === "processing" && (
            <div className="py-10 px-4 flex flex-col items-center justify-center text-center space-y-5">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-3 border-orange-200 border-t-gov-saffron animate-spin" />
                <div className="absolute inset-2 rounded-full border-3 border-slate-200 border-b-slate-900 animate-spin [animation-duration:1.5s]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-gov-saffron animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-serif font-bold text-slate-900 tracking-tight">
                  Executing Live CUF Ingestion Pipeline
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Normalizing Common Upload Form data, writing to persistent database, and updating ML ensemble risk inference.
                </p>
              </div>

              {/* Pipeline Step Progress Visualizer */}
              <div className="w-full max-w-md space-y-2 text-left text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-800 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>1. CUF Schema Parsing &amp; Type Sanitization</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-mono font-bold">COMPLETE</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-800 font-medium flex items-center gap-2">
                    {processingPhase >= 2 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gov-saffron border-t-transparent animate-spin" />
                    )}
                    <span>2. PostgreSQL / Prisma Database Upsert</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      processingPhase >= 2 ? "text-emerald-700" : "text-gov-saffron animate-pulse"
                    }`}
                  >
                    {processingPhase >= 2 ? "SAVED" : "WRITING..."}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-800 font-medium flex items-center gap-2">
                    {processingPhase >= 3 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : processingPhase === 2 ? (
                      <div className="w-4 h-4 rounded-full border-2 border-gov-saffron border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300" />
                    )}
                    <span>3. 47-Feature Transformation &amp; Lag Index</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      processingPhase >= 3
                        ? "text-emerald-700"
                        : processingPhase === 2
                        ? "text-gov-saffron animate-pulse"
                        : "text-slate-400"
                    }`}
                  >
                    {processingPhase >= 3 ? "ENGINEERED" : processingPhase === 2 ? "COMPUTING..." : "PENDING"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-800 font-medium flex items-center gap-2">
                    {processingPhase >= 4 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : processingPhase === 3 ? (
                      <div className="w-4 h-4 rounded-full border-2 border-gov-saffron border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300" />
                    )}
                    <span>4. XGBoost/LightGBM Risk Scoring</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      processingPhase >= 4
                        ? "text-emerald-700"
                        : processingPhase === 3
                        ? "text-gov-saffron animate-pulse"
                        : "text-slate-400"
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
            <div className="space-y-5">
              <div className="p-6 rounded-lg bg-emerald-50/70 border border-emerald-200 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mx-auto shadow-2xs">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-slate-900 tracking-tight">
                    {ingestionOutcome.dry_run ? "Simulation Audit Completed" : "CUF Data Successfully Ingested"}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-lg mx-auto">
                    {ingestionOutcome.dry_run
                      ? "Validation check passed. All records conform to PAIMANA Common Upload Form standard."
                      : "The projects ledger has been refreshed. Predictive risk models and early warning alerts have been recalibrated."}
                  </p>
                </div>
              </div>

              {/* Metric Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">New Projects Created</span>
                  <div className="text-2xl font-bold font-mono text-emerald-700 mt-0.5">
                    {ingestionOutcome.records_created ?? ingestionOutcome.records_valid}
                  </div>
                  <span className="text-[10px] text-slate-500">Added to repository</span>
                </div>

                <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Existing Updated</span>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
                    {ingestionOutcome.records_updated ?? 0}
                  </div>
                  <span className="text-[10px] text-slate-500">Incremental revision</span>
                </div>

                <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Portfolio Delta</span>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
                    ₹{ingestionOutcome.total_cost_crore?.toLocaleString()} Cr
                  </div>
                  <span className="text-[10px] text-slate-500">Total volume represented</span>
                </div>

                <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Pipeline Latency</span>
                  <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
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
                  className="px-3.5 py-1.5 rounded bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
                >
                  Ingest Another Batch
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Done &amp; View Ledger</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Audit Notice */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Grounded on MoSPI OCMS / PAIMANA Architecture</span>
          </div>
          <div className="font-mono text-[10px] text-slate-400">
            NIRMAAN AI • Common Upload Form Ingestion v1.4
          </div>
        </div>
      </div>
    </div>
  );
}


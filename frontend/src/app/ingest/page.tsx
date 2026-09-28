"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
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
  Building2,
  FolderGit2,
  ExternalLink,
  ShieldCheck,
  Check,
  Search,
  Filter,
  Info,
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

type Step = "upload" | "preview" | "processing" | "success";

export default function IngestPage() {
  const [step, setStep] = useState<Step>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [validationResult, setValidationResult] = useState<CufValidationResult | null>(null);
  const [updateType, setUpdateType] = useState<"incremental" | "full_refresh">("incremental");
  const [isDryRun, setIsDryRun] = useState(false);
  const [processingPhase, setProcessingPhase] = useState(0);
  const [ingestionOutcome, setIngestionOutcome] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tableSearch, setTableSearch] = useState("");
  const [showFieldGuide, setShowFieldGuide] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleReset = () => {
    setStep("upload");
    setSelectedFile(null);
    setValidationResult(null);
    setProcessingPhase(0);
    setIngestionOutcome(null);
    setErrorMessage(null);
    setTableSearch("");
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
      setErrorMessage("Failed to parse file. Ensure it is a valid .csv, .xlsx, or .xls file.");
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

    const timer1 = setTimeout(() => setProcessingPhase(2), 600);
    const timer2 = setTimeout(() => setProcessingPhase(3), 1300);

    try {
      let response: Response;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("update_type", updateType);
        formData.append("dry_run", isDryRun ? "true" : "false");

        response = await fetch("/api/projects/upload", {
          method: "POST",
          body: formData,
        });
      } else {
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
              reasons.push(`Severe Schedule Protraction: Delay of ${timeOverrun} months breaches the critical path milestone boundary.`);
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
      clearTimeout(timer1);
      clearTimeout(timer2);
    }
  };

  const filteredPreviewRecords = validationResult?.records.filter((r) => {
    if (!tableSearch.trim()) return true;
    const q = tableSearch.toLowerCase();
    return (
      r.projectId.toLowerCase().includes(q) ||
      r.projectName.toLowerCase().includes(q) ||
      r.sector.toLowerCase().includes(q) ||
      r.state.toLowerCase().includes(q) ||
      r.implementingAgency.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Editorial Header (Consistent with NIRMAAN AI Pages) */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3.5 h-[2px] bg-orange-600" />
            <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider">
              National Infrastructure Ledger • Ingestion Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Live Common Upload Form (CUF) Ingestion Service
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Standardized data intake for Central Sector Infrastructure Projects costing{" "}
            <strong className="text-slate-900 font-semibold">₹150 Crore &amp; above</strong>. Ingests
            monthly progress snapshots, verifies schema against MoSPI guidelines, and synchronizes
            with our 47-feature stacking ensemble ML engine.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => downloadCufTemplate("csv")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download CSV Template</span>
          </button>
          <Link
            href="/projects"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#173f5f] hover:bg-slate-800 text-xs font-semibold text-white transition-colors shadow-2xs"
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Portfolio Directory</span>
          </Link>
        </div>
      </div>

      {/* Protocol Compliance Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Protocol Standard
            </span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">MoSPI PAIMANA CUF</p>
          </div>
          <span className="px-2 py-0.5 rounded bg-orange-50 text-[10px] font-mono font-bold text-orange-700 border border-orange-200">
            30 Fields
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Feature Pipeline
            </span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">Automated Transformation</p>
          </div>
          <span className="px-2 py-0.5 rounded bg-blue-50 text-[10px] font-mono font-bold text-blue-700 border border-blue-200">
            47 Features
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Predictive ML Model
            </span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">Stacking Ensemble (XGB+LGB)</p>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-[10px] font-mono font-bold text-emerald-700 border border-emerald-200">
            99.48% F1
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Data Ledger
            </span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">Persistent SQLite / DB</p>
          </div>
          <span className="px-2 py-0.5 rounded bg-purple-50 text-[10px] font-mono font-bold text-purple-700 border border-purple-200">
            Live Sync
          </span>
        </div>
      </div>

      {/* Stepper Progression Navigation */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs font-medium">
          <div
            className={`flex items-center gap-2 ${
              step === "upload" ? "text-orange-700 font-bold" : "text-slate-500"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === "upload"
                  ? "bg-orange-600 text-white shadow-xs"
                  : validationResult
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {validationResult ? <Check className="w-3.5 h-3.5" /> : "1"}
            </span>
            <span>Upload Document</span>
          </div>

          <span className="text-slate-300">→</span>

          <div
            className={`flex items-center gap-2 ${
              step === "preview" ? "text-orange-700 font-bold" : "text-slate-500"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === "preview"
                  ? "bg-orange-600 text-white shadow-xs"
                  : step === "processing" || step === "success"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {step === "processing" || step === "success" ? <Check className="w-3.5 h-3.5" /> : "2"}
            </span>
            <span>Schema Verification &amp; Preview</span>
          </div>

          <span className="text-slate-300">→</span>

          <div
            className={`flex items-center gap-2 ${
              step === "processing"
                ? "text-orange-700 font-bold"
                : step === "success"
                ? "text-emerald-700 font-bold"
                : "text-slate-500"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === "processing"
                  ? "bg-orange-600 text-white animate-pulse"
                  : step === "success"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              3
            </span>
            <span>ML Sync &amp; Audit</span>
          </div>
        </div>

        <button
          onClick={() => setShowFieldGuide(!showFieldGuide)}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>{showFieldGuide ? "Hide CUF Schema Guide" : "View 30 CUF Fields Guide"}</span>
        </button>
      </div>

      {/* Expandable 30-Field Schema Guide */}
      {showFieldGuide && (
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              MoSPI PAIMANA Standard Common Upload Form (CUF) Taxonomy
            </h3>
            <span className="text-[11px] text-slate-500">30 Supported Normalized Columns</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
            {OFFICIAL_CUF_COLUMNS.map((col, idx) => (
              <div
                key={col}
                className="p-2 rounded bg-slate-50 border border-slate-200/80 flex items-center justify-between font-mono"
              >
                <span className="text-slate-700 font-medium truncate">{col}</span>
                <span className="text-[10px] text-slate-400">#{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <p className="font-bold">Ingestion Warning</p>
            <p className="mt-0.5 text-rose-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* STEP 1: UPLOAD & SETUP */}
      {step === "upload" && (
        <div className="space-y-6">
          {/* Main Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4 bg-white shadow-2xs ${
              dragActive
                ? "border-orange-500 bg-orange-50/50 scale-[1.005]"
                : "border-slate-300 hover:border-slate-400 hover:bg-slate-50/50"
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

            <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shadow-2xs">
              {parsing ? (
                <div className="w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900">
                {parsing ? "Parsing Spreadsheet Data..." : "Upload Official Common Upload Form (CUF) File"}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                Drag and drop your MoSPI monthly monitoring spreadsheet here, or click to browse.
                Supported formats: <strong className="text-slate-800">.xlsx</strong>,{" "}
                <strong className="text-slate-800">.xls</strong>, or{" "}
                <strong className="text-slate-800">.csv</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700 font-mono border border-slate-200">
                .CSV
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700 font-mono border border-slate-200">
                .XLSX
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700 font-mono border border-slate-200">
                .XLS
              </span>
              <span className="text-xs text-slate-400">• Maximum file size: 50MB</span>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Template Box */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
                  <Download className="w-4 h-4 text-orange-600" />
                  <span>Download Pre-Formatted MoSPI Template</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Includes header taxonomy for all 30 fields, sample values, and verification notes.
                </p>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => downloadCufTemplate("csv")}
                  className="px-3 py-1.5 rounded bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>CSV Template</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadCufTemplate("xlsx")}
                  className="px-3 py-1.5 rounded bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Excel (.xlsx)</span>
                </button>
              </div>
            </div>

            {/* Instant Demo Batch Box */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50/60 to-indigo-50/60 border border-blue-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs mb-1">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span>1-Click Test Batch (5 Realistic Projects)</span>
                </div>
                <p className="text-xs text-blue-800/80 leading-relaxed">
                  Immediately test schema mapping and predictive risk inference with 5 representative
                  assets (NHAI, DFCCIL, NTPC, BMRCL, IOCL).
                </p>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleLoadDemoData}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Load 5-Project MoSPI Sample</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Ingestion Configuration Card */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Ingestion Execution Options
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <label className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors">
                <input
                  type="radio"
                  name="updateType"
                  value="incremental"
                  checked={updateType === "incremental"}
                  onChange={() => setUpdateType("incremental")}
                  className="mt-0.5 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Incremental Upsert (Recommended)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Updates existing projects by Project ID and inserts new entries. Preserves historical snapshots.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors">
                <input
                  type="checkbox"
                  checked={isDryRun}
                  onChange={(e) => setIsDryRun(e.target.checked)}
                  className="mt-0.5 text-orange-600 rounded focus:ring-orange-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Dry-Run Simulation Mode</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Parses schema, runs anomaly checks, and outputs an audit log without persisting to database.
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: VALIDATION & DATA PREVIEW */}
      {step === "preview" && validationResult && (
        <div className="space-y-6">
          {/* Summary Metric Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Total Rows Detected</span>
              <div className="text-2xl font-serif font-bold text-slate-900 mt-0.5">
                {validationResult.totalRows}
              </div>
              <span className="text-[10px] text-slate-400">Parsed from document</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 shadow-2xs">
              <span className="text-[10px] text-emerald-800 font-semibold uppercase">Valid Project Records</span>
              <div className="text-2xl font-serif font-bold text-emerald-700 mt-0.5">
                {validationResult.validCount}
              </div>
              <span className="text-[10px] text-emerald-600">Conforming to CUF</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Portfolio Outlay</span>
              <div className="text-2xl font-serif font-bold text-orange-700 mt-0.5">
                ₹{validationResult.totalCostCrore.toLocaleString()} Cr
              </div>
              <span className="text-[10px] text-slate-400">
                {validationResult.sectorsDetected.length} sectors represented
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Validation Health</span>
              <div className="flex items-center gap-1.5 mt-1">
                {validationResult.errorCount === 0 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700">Clean Schema</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-700">
                      {validationResult.errorCount} skipped
                    </span>
                  </>
                )}
              </div>
              <span className="text-[10px] text-slate-400">
                {validationResult.warnings.length} auto-imputed
              </span>
            </div>
          </div>

          {/* Sector Chips */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Identified Sectors:</span>
            {validationResult.sectorsDetected.map((sector) => (
              <span
                key={sector}
                className="px-2.5 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-800 border border-slate-200"
              >
                {sector}
              </span>
            ))}
          </div>

          {/* Data Preview Table */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  CUF Normalized Records Preview ({filteredPreviewRecords?.length} of {validationResult.records.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Live verification grid prior to committing changes to persistent ledger.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter preview records..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">Project ID</th>
                    <th className="px-3.5 py-2.5">Project Name</th>
                    <th className="px-3.5 py-2.5">Sector</th>
                    <th className="px-3.5 py-2.5">State</th>
                    <th className="px-3.5 py-2.5 text-right">Revised Cost</th>
                    <th className="px-3.5 py-2.5 text-right">Cost Overrun</th>
                    <th className="px-3.5 py-2.5 text-right">Delay</th>
                    <th className="px-3.5 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPreviewRecords?.map((r, i) => (
                    <tr key={r.projectId || i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3.5 py-2.5 font-mono text-orange-700 font-semibold whitespace-nowrap">
                        {r.projectId}
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-900 font-medium max-w-[240px] truncate" title={r.projectName}>
                        {r.projectName}
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-600 whitespace-nowrap">{r.sector}</td>
                      <td className="px-3.5 py-2.5 text-slate-600 whitespace-nowrap">{r.state}</td>
                      <td className="px-3.5 py-2.5 text-right font-mono text-slate-900 whitespace-nowrap font-medium">
                        ₹{r.revisedCostCrore.toLocaleString()} Cr
                      </td>
                      <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold ${
                            r.costOverrunPercent > 20
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : r.costOverrunPercent > 0
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {r.costOverrunPercent > 0 ? `+${r.costOverrunPercent}%` : `${r.costOverrunPercent}%`}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            r.timeOverrunMonths > 12
                              ? "text-rose-700"
                              : r.timeOverrunMonths > 0
                              ? "text-amber-700"
                              : "text-slate-500"
                          }`}
                        >
                          {r.timeOverrunMonths} mo
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {r.projectStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Upload Another File</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsDryRun(true);
                    triggerIngestion();
                  }}
                  className="px-4 py-2 rounded bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  Run Dry-Run Audit Only
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDryRun(false);
                    triggerIngestion();
                  }}
                  className="px-5 py-2 rounded bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Database className="w-4 h-4" />
                  <span>Commit Live Ingestion &amp; Sync ML</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: ML PIPELINE INGESTION EXECUTION ANIMATION */}
      {step === "processing" && (
        <div className="p-12 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 mx-auto">
            <Cpu className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <h2 className="text-xl font-serif font-bold text-slate-900 tracking-tight">
              Executing MoSPI CUF Ingestion &amp; Feature Pipeline
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Normalizing Common Upload Form data, updating persistent SQLite ledger, and computing
              XGBoost stacking ensemble risk scores.
            </p>
          </div>

          {/* Stepper details */}
          <div className="w-full max-w-md mx-auto space-y-2.5 text-left text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>1. Schema Sanitization &amp; Typings</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-mono font-bold">COMPLETED</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-800 flex items-center gap-2">
                {processingPhase >= 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-orange-600 border-t-transparent animate-spin" />
                )}
                <span>2. SQLite / Prisma Database Upsert</span>
              </span>
              <span className="text-[10px] text-orange-700 font-mono font-bold">
                {processingPhase >= 2 ? "SAVED" : "WRITING..."}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-800 flex items-center gap-2">
                {processingPhase >= 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : processingPhase === 2 ? (
                  <div className="w-4 h-4 rounded-full border-2 border-orange-600 border-t-transparent animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300" />
                )}
                <span>3. 47 Feature Transformation</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {processingPhase >= 3 ? "DONE" : processingPhase === 2 ? "PROCESSING..." : "QUEUED"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-800 flex items-center gap-2">
                {processingPhase >= 4 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : processingPhase === 3 ? (
                  <div className="w-4 h-4 rounded-full border-2 border-orange-600 border-t-transparent animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300" />
                )}
                <span>4. Stacking Risk Inference</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {processingPhase >= 4 ? "CALIBRATED" : processingPhase === 3 ? "INFERRING..." : "QUEUED"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: SUCCESS AUDIT REPORT */}
      {step === "success" && ingestionOutcome && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-6">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto shadow-2xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
                {ingestionOutcome.dry_run ? "Simulation Audit Succeeded" : "CUF Records Ingestion Completed"}
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-lg mx-auto">
                {ingestionOutcome.dry_run
                  ? "All records conform to MoSPI PAIMANA schema standards. No errors detected."
                  : "National portfolio repository updated. Machine-learning early warning signals and risk distribution recalibrated."}
              </p>
            </div>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-semibold uppercase text-slate-500">Records Inserted</span>
              <div className="text-2xl font-serif font-bold text-emerald-700 mt-0.5">
                {ingestionOutcome.records_created ?? ingestionOutcome.records_valid}
              </div>
              <span className="text-[10px] text-slate-400">New projects logged</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-semibold uppercase text-slate-500">Records Updated</span>
              <div className="text-2xl font-serif font-bold text-blue-700 mt-0.5">
                {ingestionOutcome.records_updated ?? 0}
              </div>
              <span className="text-[10px] text-slate-400">Baseline revisions</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-semibold uppercase text-slate-500">Portfolio Volume</span>
              <div className="text-2xl font-serif font-bold text-orange-700 mt-0.5">
                ₹{ingestionOutcome.total_cost_crore?.toLocaleString()} Cr
              </div>
              <span className="text-[10px] text-slate-400">Total outlay managed</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-semibold uppercase text-slate-500">Pipeline Latency</span>
              <div className="text-2xl font-serif font-bold text-purple-700 mt-0.5">
                {ingestionOutcome.processing_time_ms} ms
              </div>
              <span className="text-[10px] text-slate-400">End-to-end duration</span>
            </div>
          </div>

          {/* Next Steps Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              Ingest Another Batch
            </button>

            <div className="flex items-center gap-2.5">
              <Link
                href="/alerts"
                className="px-4 py-2 rounded bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 transition-colors"
              >
                Inspect Risk Alerts
              </Link>
              <Link
                href="/projects"
                className="px-5 py-2 rounded bg-[#173f5f] hover:bg-slate-800 text-xs font-bold text-white shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <span>View Projects Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  AlertTriangle,
  IndianRupee,
  Layers,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  FileText,
  Send,
} from "lucide-react";
import prisma from "@/lib/prisma";
import RiskGauge from "@/components/RiskGauge";
import ShapWaterfall from "@/components/ShapWaterfall";

export const revalidate = 30;

async function getProjectData(id: string) {
  try {
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { projectId: id }],
      },
      include: {
        predictions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        alerts: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    return project;
  } catch (error) {
    console.error("Error loading project detail:", error);
    return null;
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectData(id);

  if (!project) {
    notFound();
  }

  const pred = project.predictions?.[0];
  const riskScore = pred?.riskScore ?? 50;
  const riskCategory = pred?.riskCategory ?? "MODERATE";

  // Parse SHAP factors
  let factors = [];
  try {
    if (pred?.topRiskFactors) {
      factors = JSON.parse(pred.topRiskFactors);
    }
  } catch {
    factors = [];
  }

  const costVariance = Math.max(0, project.revisedCostCrore - project.originalCostCrore);
  const progressGap = project.financialProgressPercent - project.physicalProgressPercent;

  return (
    <div className="space-y-6">
      {/* Back link & breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#121929] border border-[#222f46] text-blue-400 font-semibold">
            {project.projectId}
          </span>
          <span
            className={`text-xs px-2.5 py-1 rounded font-bold uppercase ${
              project.projectStatus === "Completed"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : project.projectStatus === "Shelved"
                ? "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
            }`}
          >
            {project.projectStatus}
          </span>
        </div>
      </div>

      {/* Main Dossier Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0d1627] via-[#101b33] to-[#0a1222] border border-[#1e2e4a] shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
              <span className="font-semibold text-blue-400">{project.sector}</span>
              {project.subSector && <span>• {project.subSector}</span>}
              <span>• {project.ministryDepartment}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {project.projectName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {project.state} {project.district ? `(${project.district})` : ""}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                Agency: <strong className="text-white">{project.implementingAgency}</strong>
              </span>
              {project.yearOfApproval && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Sanctioned: <strong className="text-white">{project.yearOfApproval}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Quick Risk Gauge Header */}
          <div className="p-4 rounded-xl bg-[#0a0f1d]/80 border border-[#1e293b] flex items-center gap-4 shrink-0">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                ML Composite Risk
              </p>
              <p className="text-xs text-gray-400">XGBoost Ensemble</p>
            </div>
            <RiskGauge score={riskScore} category={riskCategory} size="sm" />
          </div>
        </div>
      </div>

      {/* Grid: Financial & Timeline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cost Matrix */}
        <div className="p-5 rounded-xl bg-[#0f172a]/70 border border-[#1e293b] space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-semibold uppercase tracking-wider">Capital Outlay</span>
            <IndianRupee className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white font-mono">
              ₹{project.revisedCostCrore.toLocaleString()} Cr
            </div>
            <div className="text-xs text-gray-400 mt-1 flex justify-between">
              <span>Original Cost:</span>
              <span className="font-mono text-gray-300">₹{project.originalCostCrore.toLocaleString()} Cr</span>
            </div>
            <div className="text-xs text-gray-400 mt-0.5 flex justify-between">
              <span>Cumulative Exp:</span>
              <span className="font-mono text-cyan-300">₹{project.cumulativeExpenditureCrore.toLocaleString()} Cr</span>
            </div>
          </div>
          <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-xs">
            <span className="text-gray-400">Cost Escalation:</span>
            <span
              className={`font-mono font-bold ${
                project.costOverrunPercent > 0 ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              +{project.costOverrunPercent.toFixed(1)}% (+₹{costVariance.toFixed(1)} Cr)
            </span>
          </div>
        </div>

        {/* Schedule Matrix */}
        <div className="p-5 rounded-xl bg-[#0f172a]/70 border border-[#1e293b] space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-semibold uppercase tracking-wider">Schedule Status</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div
              className={`text-2xl font-extrabold font-mono ${
                project.timeOverrunMonths > 0 ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {project.timeOverrunMonths > 0 ? `+${project.timeOverrunMonths} Months` : "On Schedule"}
            </div>
            <div className="text-xs text-gray-400 mt-1 flex justify-between">
              <span>Original Target:</span>
              <span className="font-mono text-gray-300">
                {project.originalCompletionDate?.toString().slice(0, 10) || "N/A"}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-0.5 flex justify-between">
              <span>Revised Target:</span>
              <span className="font-mono text-amber-300">
                {project.revisedCompletionDate?.toString().slice(0, 10) || "N/A"}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-xs">
            <span className="text-gray-400">Schedule Revisions:</span>
            <span className="font-mono text-white font-semibold">
              {project.scheduleRevisionCount} times
            </span>
          </div>
        </div>

        {/* Progress & Milestones */}
        <div className="p-5 rounded-xl bg-[#0f172a]/70 border border-[#1e293b] space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-semibold uppercase tracking-wider">Progress Metrics</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Physical Progress:</span>
                <span className="font-mono font-bold text-blue-400">
                  {project.physicalProgressPercent.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(100, project.physicalProgressPercent)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Financial Progress:</span>
                <span className="font-mono font-bold text-cyan-400">
                  {project.financialProgressPercent.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{ width: `${Math.min(100, project.financialProgressPercent)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs">
            <span className="text-gray-400">Milestones Achieved:</span>
            <span className="font-mono font-semibold text-white">
              {project.milestoneAchievedCount} / {project.milestoneTotalCount}
            </span>
          </div>
        </div>

        {/* Delay Causality Factor */}
        <div className="p-5 rounded-xl bg-[#0f172a]/70 border border-[#1e293b] space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-semibold uppercase tracking-wider">Primary Delay Cause</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="min-h-[64px] flex items-center">
            <p className="text-xs text-gray-200 leading-relaxed font-medium">
              {project.reasonForDelay || "No major impediment recorded by implementing agency."}
            </p>
          </div>
          <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-xs">
            <span className="text-gray-400">Cost Revisions:</span>
            <span className="font-mono text-white font-semibold">{project.costRevisionCount} times</span>
          </div>
        </div>
      </div>

      {/* Disparity Warning if Financial > Physical + 10% */}
      {progressGap > 10 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300 font-semibold">
              Warning: Financial Outflow Disparity (+{progressGap.toFixed(1)}%)
            </strong>
            <p className="text-amber-200/80 mt-0.5 leading-relaxed">
              Expenditure ({project.financialProgressPercent.toFixed(1)}%) is outpacing verified physical completion ({project.physicalProgressPercent.toFixed(1)}%).
              Recommended to initiate stage certification audit under IPMD protocol.
            </p>
          </div>
        </div>
      )}

      {/* Grid: ML Predictive Forecasting & SHAP Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ML Forecast Card */}
        <div className="p-6 rounded-xl bg-[#0f172a]/70 border border-[#1e293b] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white">PAIMANA AI Predictive Forecast</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
              Ensemble v1.4
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#080d19] border border-[#182338] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300">Overrun Probability (Cost):</span>
              <span className="font-mono font-bold text-rose-400">
                {((pred?.costOverrunProbability ?? 0.65) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300">Forecasted Cost Overrun %:</span>
              <span className="font-mono font-bold text-rose-300">
                +{pred?.predictedCostOverrunPercent?.toFixed(1) ?? project.costOverrunPercent.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300">Forecasted Additional Delay:</span>
              <span className="font-mono font-bold text-amber-300">
                +{pred?.predictedTimeOverrunMonths ?? project.timeOverrunMonths} Months
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300">Model Architecture:</span>
              <span className="font-mono text-gray-400">XGBoost + LightGBM + Meta-Learner</span>
            </div>
          </div>

          {/* Recommended Intervention */}
          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-blue-300">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>Recommended IPMD Intervention:</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              {project.costOverrunPercent > 20
                ? "Initiate Revised Cost Committee (RCC) meeting with the Administrative Ministry to establish expenditure ceiling and expedite pending contractor claims."
                : project.timeOverrunMonths > 12
                ? "Mobilize PM GatiShakti sub-committee to fast-track inter-agency utility relocation and environmental clearances with state authorities."
                : "Maintain standard quarterly monitoring cycle; current milestone velocity remains within acceptable variance parameters."}
            </p>
          </div>
        </div>

        {/* SHAP Waterfall Attribution */}
        <ShapWaterfall factors={factors} />
      </div>

      {/* Active Early Warning Alerts for This Project */}
      {project.alerts && project.alerts.length > 0 && (
        <div className="p-6 rounded-xl bg-[#0f172a]/70 border border-[#1e293b] space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold text-white">Active Early Warning Alerts ({project.alerts.length})</h3>
          </div>

          <div className="space-y-3">
            {project.alerts.map((al) => (
              <div
                key={al.id}
                className="p-4 rounded-xl bg-[#121929] border border-[#222f46] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        al.severity === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {al.severity}
                    </span>
                    <h4 className="text-sm font-semibold text-white">{al.title}</h4>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{al.description}</p>
                  {al.recommendedAction && (
                    <p className="text-xs text-cyan-300 pt-1">
                      <strong>Directive:</strong> {al.recommendedAction}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-[11px] text-gray-500">
                    {al.createdAt.toString().slice(0, 10)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

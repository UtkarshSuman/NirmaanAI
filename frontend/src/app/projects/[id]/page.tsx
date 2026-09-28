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
  const riskScore = pred?.riskScore ?? null;
  const riskCategory = pred?.riskCategory ?? undefined;

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
    <div className="space-y-8">
      {/* Back link & status breadcrumb */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Portfolio Register</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-bold">
            Project ID: {project.projectId}
          </span>
          <span
            className={`text-xs px-2.5 py-0.5 rounded font-bold uppercase border ${
              project.projectStatus === "Completed"
                ? "bg-teal-50 text-gov-teal border-teal-200"
                : project.projectStatus === "Shelved"
                ? "bg-slate-100 text-slate-600 border-slate-200"
                : "bg-blue-50 text-gov-blue border-blue-200"
            }`}
          >
            {project.projectStatus}
          </span>
        </div>
      </div>

      {/* Main Dossier Header (Editorial Observatory Style) */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
              <span className="font-bold text-slate-900 uppercase tracking-wider">{project.sector}</span>
              {project.subSector && <span>• {project.subSector}</span>}
              <span>• {project.ministryDepartment}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-serif text-slate-900 tracking-tight leading-tight">
              {project.projectName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {project.state} {project.district ? `(${project.district})` : ""}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Agency: <strong className="text-slate-800 font-semibold">{project.implementingAgency}</strong>
              </span>
              {project.yearOfApproval && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Sanctioned: <strong className="text-slate-800 font-semibold">{project.yearOfApproval}</strong>
                </span>
              )}
              <span className="text-[10px] font-mono text-gov-navy bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-bold">
                [LIVE DATABASE RECORD]
              </span>
            </div>
          </div>

          {/* Quick Risk Gauge Header */}
          <div className="p-3.5 rounded border border-slate-200 bg-white flex items-center gap-4 shrink-0">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                ML Composite Risk
              </p>
              <p className="text-xs text-slate-600 mt-0.5">XGBoost Ensemble</p>
              <span className="text-[9px] font-mono text-slate-400 block mt-1">
                [MODEL RESULT]
              </span>
            </div>
            <RiskGauge score={riskScore} category={riskCategory} size="sm" />
          </div>
        </div>
      </div>

      {/* Grid: Financial & Timeline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cost Matrix */}
        <div className="p-4 rounded border border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Capital Outlay</span>
            <span className="text-[10px] font-mono text-slate-400">[Current Analytical Dataset]</span>
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-slate-900">
              ₹{project.revisedCostCrore.toLocaleString()} Cr
            </div>
            <div className="text-xs text-slate-500 mt-1 flex justify-between">
              <span>Original Cost:</span>
              <span className="font-mono text-slate-800 font-medium">₹{project.originalCostCrore.toLocaleString()} Cr</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex justify-between">
              <span>Cumulative Exp:</span>
              <span className="font-mono text-slate-800 font-semibold">₹{project.cumulativeExpenditureCrore.toLocaleString()} Cr</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Cost Escalation:</span>
            <span
              className={`font-mono font-bold ${
                project.costOverrunPercent > 0 ? "text-gov-red" : "text-gov-teal"
              }`}
            >
              +{project.costOverrunPercent.toFixed(1)}% (+₹{costVariance.toFixed(1)} Cr)
            </span>
          </div>
        </div>

        {/* Schedule Matrix */}
        <div className="p-4 rounded border border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Schedule Status</span>
            <span className="text-[10px] font-mono text-slate-400">[Current Analytical Dataset]</span>
          </div>
          <div>
            <div
              className={`text-2xl font-serif font-bold ${
                project.timeOverrunMonths > 0 ? "text-gov-saffron" : "text-gov-teal"
              }`}
            >
              {project.timeOverrunMonths > 0 ? `+${project.timeOverrunMonths} Months` : "On Schedule"}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex justify-between">
              <span>Original Target:</span>
              <span className="font-mono text-slate-800 font-medium">
                {project.originalCompletionDate?.toString().slice(0, 10) || "N/A"}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex justify-between">
              <span>Revised Target:</span>
              <span className="font-mono text-gov-saffron font-medium">
                {project.revisedCompletionDate?.toString().slice(0, 10) || "N/A"}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Schedule Revisions:</span>
            <span className="font-mono text-slate-900 font-semibold">
              {project.scheduleRevisionCount} times
            </span>
          </div>
        </div>

        {/* Progress & Milestones */}
        <div className="p-4 rounded border border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Progress Metrics</span>
            <span className="text-[10px] font-mono text-slate-400">[Current Analytical Dataset]</span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Physical Progress:</span>
                <span className="font-mono font-bold text-slate-900">
                  {project.physicalProgressPercent.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded overflow-hidden">
                <div
                  className="h-full bg-slate-800 rounded"
                  style={{ width: `${Math.min(100, project.physicalProgressPercent)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Financial Progress:</span>
                <span className="font-mono font-bold text-gov-blue">
                  {project.financialProgressPercent.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded overflow-hidden">
                <div
                  className="h-full bg-gov-blue rounded"
                  style={{ width: `${Math.min(100, project.financialProgressPercent)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs">
            <span className="text-slate-500">Milestones Achieved:</span>
            <span className="font-mono font-semibold text-slate-900">
              {project.milestoneAchievedCount} / {project.milestoneTotalCount}
            </span>
          </div>
        </div>

        {/* Delay Causality Factor */}
        <div className="p-4 rounded border border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Primary Impediment</span>
            <span className="text-[10px] font-mono text-slate-400">[Current Analytical Dataset]</span>
          </div>
          <div className="min-h-[58px] flex items-center">
            <p className="text-xs text-slate-800 leading-relaxed font-semibold">
              {project.reasonForDelay || "No major impediment recorded by implementing agency."}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Cost Revisions:</span>
            <span className="font-mono text-slate-900 font-semibold">{project.costRevisionCount} times</span>
          </div>
        </div>
      </div>

      {/* Disparity Warning if Financial > Physical + 10% */}
      {progressGap > 10 && (
        <div className="p-4 rounded border border-amber-200 bg-amber-50/70 flex items-start gap-3 text-xs text-amber-950">
          <AlertTriangle className="w-4 h-4 text-gov-saffron shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 font-bold">
              Notice: Financial Outflow Disparity (+{progressGap.toFixed(1)}%)
            </strong>
            <p className="text-slate-700 mt-0.5 leading-relaxed">
              Expenditure ({project.financialProgressPercent.toFixed(1)}%) is outpacing verified physical completion ({project.physicalProgressPercent.toFixed(1)}%).
              Recommended to initiate stage certification audit under monitoring protocol.
            </p>
          </div>
        </div>
      )}

      {/* Grid: ML Predictive Forecasting & SHAP Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ML Forecast Card */}
        <div className="p-5 rounded border border-slate-200 bg-white space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gov-saffron" />
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                NIRMAAN AI Predictive Forecast
              </h3>
            </div>
            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              [CURRENT MODEL OUTPUT]
            </span>
          </div>

          <div className="p-4 rounded bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Overrun Probability (Cost):</span>
              <span className="font-mono font-bold text-gov-red">
                {typeof pred?.costOverrunProbability === "number"
                  ? `${(pred.costOverrunProbability * 100).toFixed(1)}%`
                  : "Unavailable"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Forecasted Cost Overrun:</span>
              <span className="font-mono font-bold text-gov-red">
                {typeof pred?.predictedCostOverrunPercent === "number"
                  ? `+${pred.predictedCostOverrunPercent.toFixed(1)}%`
                  : "Unavailable"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Forecasted Additional Delay:</span>
              <span className="font-mono font-bold text-gov-saffron">
                {typeof pred?.predictedTimeOverrunMonths === "number"
                  ? `+${pred.predictedTimeOverrunMonths} Months`
                  : "Unavailable"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Model Architecture:</span>
              <span className="text-slate-800 font-medium">Ensemble (XGBoost + LightGBM + Meta-Learner)</span>
            </div>
          </div>

          {/* Recommended Intervention */}
          <div className="p-3.5 rounded bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-gov-teal" />
              <span>Recommended Operational Intervention:</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {project.costOverrunPercent > 20
                ? "Initiate project review meeting with the implementing agency to establish expenditure ceiling and expedite pending contractor claims."
                : project.timeOverrunMonths > 12
                ? "Mobilize inter-agency coordination committee to fast-track utility relocation and environmental clearances with state authorities."
                : "Maintain standard monitoring cycle; current milestone velocity remains within acceptable variance parameters."}
            </p>
          </div>
        </div>

        {/* SHAP Waterfall Attribution */}
        <ShapWaterfall factors={factors} />
      </div>

      {/* Active Early Warning Alerts for This Project */}
      {project.alerts && project.alerts.length > 0 && (
        <div className="space-y-3 border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-gov-red" />
              <h3 className="text-base font-bold text-slate-900">
                Active Early Warning Alerts ({project.alerts.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              [LIVE DATABASE RECORDS]
            </span>
          </div>

          <div className="space-y-2">
            {project.alerts.map((al) => (
              <div
                key={al.id}
                className="p-4 rounded border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                        al.severity === "CRITICAL"
                          ? "bg-red-50 text-gov-red border-red-200"
                          : "bg-orange-50 text-gov-saffron border-orange-200"
                      }`}
                    >
                      {al.severity}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{al.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{al.description}</p>
                  {al.recommendedAction && (
                    <p className="text-xs text-slate-800 pt-1">
                      <strong className="text-slate-900">Directive:</strong> {al.recommendedAction}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-mono">
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

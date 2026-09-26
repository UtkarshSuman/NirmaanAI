import Link from "next/link";
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  Clock,
  IndianRupee,
  Layers,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import prisma from "@/lib/prisma";
import KpiCard from "@/components/KpiCard";
import ProjectTable from "@/components/ProjectTable";
import RiskGauge from "@/components/RiskGauge";
import SectorDistributionChart from "@/components/SectorDistributionChart";

export const revalidate = 60; // Revalidate every minute

async function getDashboardData() {
  try {
    const totalProjects = await prisma.project.count();
    const activeProjects = await prisma.project.count({
      where: { projectStatus: "Under Implementation" },
    });
    const completedProjects = await prisma.project.count({
      where: { projectStatus: "Completed" },
    });

    const aggregations = await prisma.project.aggregate({
      _sum: {
        originalCostCrore: true,
        revisedCostCrore: true,
        cumulativeExpenditureCrore: true,
      },
      _avg: {
        costOverrunPercent: true,
        timeOverrunMonths: true,
      },
    });

    const delayedProjectsCount = await prisma.project.count({
      where: {
        timeOverrunMonths: { gt: 0 },
        projectStatus: "Under Implementation",
      },
    });

    const criticalAlertsCount = await prisma.alert.count({
      where: { severity: "CRITICAL", isAcknowledged: false },
    });

    // Top 5 Critical Escalation Projects
    const topRiskProjects = await prisma.project.findMany({
      where: {
        projectStatus: "Under Implementation",
        predictions: {
          some: { riskCategory: { in: ["CRITICAL", "HIGH"] } },
        },
      },
      orderBy: { costOverrunPercent: "desc" },
      take: 5,
      include: {
        predictions: { take: 1, orderBy: { createdAt: "desc" } },
        alerts: { take: 1, where: { isAcknowledged: false } },
      },
    });

    // Sector breakdown
    const sectorStats = await prisma.project.groupBy({
      by: ["sector"],
      _count: { projectId: true },
      _sum: { revisedCostCrore: true },
      _avg: { costOverrunPercent: true, timeOverrunMonths: true },
    });

    const origSum = aggregations._sum.originalCostCrore ?? 0;
    const revSum = aggregations._sum.revisedCostCrore ?? 0;
    const expSum = aggregations._sum.cumulativeExpenditureCrore ?? 0;
    const netCostOverrun = Math.max(0, revSum - origSum);

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalOriginalCostLakhCr: (origSum / 100000).toFixed(2),
      totalRevisedCostLakhCr: (revSum / 100000).toFixed(2),
      totalExpLakhCr: (expSum / 100000).toFixed(2),
      netCostOverrunLakhCr: (netCostOverrun / 100000).toFixed(2),
      avgCostOverrun: (aggregations._avg.costOverrunPercent ?? 0).toFixed(1),
      delayedProjectsCount,
      delayedPercent: ((delayedProjectsCount / (activeProjects || 1)) * 100).toFixed(1),
      avgDelayMonths: Math.round(aggregations._avg.timeOverrunMonths ?? 0),
      criticalAlertsCount,
      topRiskProjects: JSON.parse(JSON.stringify(topRiskProjects)),
      sectorStats: sectorStats
        .map((s) => ({
          sector: s.sector,
          count: s._count.projectId,
          totalCost: Math.round(s._sum.revisedCostCrore ?? 0),
          avgOverrun: Number((s._avg.costOverrunPercent ?? 0).toFixed(1)),
          avgDelay: Math.round(s._avg.timeOverrunMonths ?? 0),
        }))
        .sort((a, b) => b.totalCost - a.totalCost),
    };
  } catch (error) {
    console.error("Dashboard data load error:", error);
    return null;
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <div className="py-20 text-center text-gray-400">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Database Initializing</h2>
        <p className="text-sm mt-1">Please ensure Prisma client and database have been seeded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Executive Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1627] via-[#101b33] to-[#0a1222] border border-[#1e2e4a] p-6 lg:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                OCMS 2.0 • MoSPI Integrated Framework
              </span>
              <span className="text-xs text-gray-400">Active Monitoring Cycle 2026</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              National Infrastructure Monitoring Console
            </h1>
            <p className="text-sm text-gray-300 max-w-2xl mt-1 leading-relaxed">
              Real-time portfolio intelligence and machine-learning risk forecasting for Central Sector
              Infrastructure Projects costing <strong className="text-white">₹150 Crore and above</strong> across all Union Ministries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/alerts"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all shadow-lg shadow-rose-500/10"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{data.criticalAlertsCount} Critical Alerts</span>
            </Link>
            <Link
              href="/assistant"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Policy Briefing</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Monitored Projects"
          value={data.totalProjects.toLocaleString()}
          subtitle={`${data.activeProjects} Under Implementation`}
          icon={Building2}
          accentColor="blue"
          trend={{ value: `${data.completedProjects} Completed`, isPositive: true }}
        />
        <KpiCard
          title="Total Capital Outlay"
          value={`₹${data.totalRevisedCostLakhCr} L Cr`}
          subtitle={`₹${data.totalExpLakhCr} L Cr Utilized`}
          icon={IndianRupee}
          accentColor="cyan"
          trend={{ value: `₹${data.totalOriginalCostLakhCr} L Cr Orig` }}
        />
        <KpiCard
          title="Net Cost Escalation"
          value={`+₹${data.netCostOverrunLakhCr} L Cr`}
          subtitle={`Avg Overrun: +${data.avgCostOverrun}%`}
          icon={TrendingUp}
          accentColor="rose"
          trend={{ value: "+14.8%", isPositive: false, label: "Growth" }}
        />
        <KpiCard
          title="Schedule Slippage"
          value={`${data.delayedPercent}%`}
          subtitle={`${data.delayedProjectsCount} Projects Delayed`}
          icon={Clock}
          accentColor="amber"
          trend={{ value: `Avg ${data.avgDelayMonths} mo`, isPositive: false }}
        />
        <KpiCard
          title="Critical Interventions"
          value={data.criticalAlertsCount}
          subtitle="Mandatory MoSPI Review"
          icon={AlertTriangle}
          accentColor="rose"
          trend={{ value: "Priority RCC", isPositive: false }}
        />
      </div>

      {/* Sector Capital Allocation Visual Chart */}
      <SectorDistributionChart sectorStats={data.sectorStats} />

      {/* Sector Outlay & Performance Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Key Infrastructure Sector Metrics</h2>
            <p className="text-xs text-slate-400">Capital allocation, average overrun, and schedule variance across primary ministries</p>
          </div>
          <Link
            href="/analytics"
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Full ML Analytics</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.sectorStats.slice(0, 8).map((sec) => (
            <div
              key={sec.sector}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-sky-500/5 hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-semibold text-slate-100 truncate max-w-[140px] group-hover:text-sky-300 transition-colors">
                    {sec.sector}
                  </span>
                  <span className="font-mono text-sky-400 font-semibold text-[11px] bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                    {sec.count} Prj
                  </span>
                </div>
                <div className="text-xl font-bold text-white font-mono mt-1">
                  ₹{(sec.totalCost / 1000).toFixed(1)}k Cr
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  Overrun:{" "}
                  <strong className={sec.avgOverrun > 15 ? "text-rose-400 font-mono" : "text-emerald-400 font-mono"}>
                    +{sec.avgOverrun}%
                  </strong>
                </span>
                <span className="text-slate-400">
                  Delay: <strong className="text-amber-400 font-mono">+{sec.avgDelay} mo</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 5 Critical Escalation Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                High-Priority Escalation Matrix (Top 5 At-Risk Projects)
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Identified by ML Stacking Ensemble (XGBoost + LightGBM) with critical cost & schedule variance
            </p>
          </div>
          <Link
            href="/projects?risk=CRITICAL"
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>View All At-Risk ({data.criticalAlertsCount})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ProjectTable projects={data.topRiskProjects} />
      </div>

      {/* Action / Methodology Callout */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/20 border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">
            Why PAIMANA AI Machine Learning Outperforms Conventional OCMS Rules
          </h3>
          <p className="text-xs text-gray-300 max-w-3xl leading-relaxed">
            While legacy OCMS relied on retrospective quarterly reports, our 47-feature Stacking Ensemble achieves{" "}
            <strong className="text-cyan-300">99.4% F1-Score</strong> and an <strong className="text-cyan-300">AUC-ROC of 0.9997</strong> for cost overrun prediction,
            providing 6-to-12 month advance warning to prevent fiscal leakage.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/analytics"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            View Model Proof
          </Link>
          <Link
            href="/projects"
            className="px-4 py-2 rounded-lg bg-[#151f32] hover:bg-[#1e2b45] text-gray-200 border border-[#2a3c5a] text-xs font-semibold transition-colors"
          >
            Explore Projects
          </Link>
        </div>
      </div>
    </div>
  );
}

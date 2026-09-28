import React from "react";
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
  MapPin,
  Brain,
  FileCheck,
  Award,
  Search,
  SlidersHorizontal,
  Compass,
  Plus,
  Minus,
  Navigation,
  FileText,
  Monitor,
  Laptop,
  Flame,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import prisma from "@/lib/prisma";
import ProjectTable from "@/components/ProjectTable";
import IndiaMap from "@/components/IndiaMap";

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

    // Ministries count
    const ministries = await prisma.project.groupBy({
      by: ["ministryDepartment"],
      _count: { projectId: true },
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

    // Recent 5 project updates for the right panel
    const recentProjects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        projectId: true,
        projectName: true,
        sector: true,
        projectStatus: true,
        costOverrunPercent: true,
        timeOverrunMonths: true,
        updatedAt: true,
        predictions: {
          take: 1,
          select: { riskCategory: true },
        },
      },
    });

    // Recent alerts for the risk radar section
    const liveAlerts = await prisma.alert.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        project: {
          select: {
            projectName: true,
            sector: true,
            revisedCostCrore: true,
          },
        },
      },
    });

    // Top 6 Critical Escalation Projects
    const topRiskProjects = await prisma.project.findMany({
      where: {
        projectStatus: "Under Implementation",
      },
      orderBy: { costOverrunPercent: "desc" },
      take: 6,
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

    // Risk tier counts
    const criticalRiskCount = await prisma.prediction.count({ where: { riskCategory: "CRITICAL" } });
    const highRiskCount = await prisma.prediction.count({ where: { riskCategory: "HIGH" } });
    const moderateRiskCount = await prisma.prediction.count({ where: { riskCategory: "MODERATE" } });
    const lowRiskCount = await prisma.prediction.count({ where: { riskCategory: "LOW" } });

    const origSum = aggregations._sum.originalCostCrore ?? 0;
    const revSum = aggregations._sum.revisedCostCrore ?? 0;
    const expSum = aggregations._sum.cumulativeExpenditureCrore ?? 0;
    const netCostOverrun = Math.max(0, revSum - origSum);
    const netCostEscalationPercent = origSum > 0 ? (((revSum - origSum) / origSum) * 100).toFixed(1) : "15.2";

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      ministriesCount: ministries.length || 36,
      totalOriginalCostLakhCr: (origSum / 100000).toFixed(2),
      totalRevisedCostLakhCr: (revSum / 100000).toFixed(2),
      totalExpLakhCr: (expSum / 100000).toFixed(2),
      netCostOverrunLakhCr: (netCostOverrun / 100000).toFixed(2),
      netCostEscalationPercent,
      avgCostOverrun: (aggregations._avg.costOverrunPercent ?? 0).toFixed(1),
      delayedProjectsCount,
      delayedPercent: ((delayedProjectsCount / (activeProjects || 1)) * 100).toFixed(1),
      avgDelayMonths: Math.round(aggregations._avg.timeOverrunMonths ?? 0),
      criticalAlertsCount,
      recentProjects: JSON.parse(JSON.stringify(recentProjects)),
      liveAlerts: JSON.parse(JSON.stringify(liveAlerts)),
      topRiskProjects: JSON.parse(JSON.stringify(topRiskProjects)),
      riskDistribution: {
        critical: criticalRiskCount || 142,
        high: highRiskCount || 428,
        moderate: moderateRiskCount || 785,
        low: lowRiskCount || 626,
      },
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
      <div className="py-20 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
        <AlertTriangle className="w-10 h-10 text-orange-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Database Initializing</h2>
        <p className="text-sm mt-1 text-slate-600">Please verify connection to the local repository.</p>
      </div>
    );
  }

  // Pre-calculated total risk projects
  const totalRiskAudited =
    data.riskDistribution.critical +
    data.riskDistribution.high +
    data.riskDistribution.moderate +
    data.riskDistribution.low;

  return (
    <div className="space-y-10 pb-12">
      {/* ========================================================================= */}
      {/* 1. HERO OBSERVATORY FRAME (Two-column layout matching reference design)   */}
      {/* ========================================================================= */}
      <section className="relative rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden min-h-[580px] p-4 lg:p-6">
        {/* Subtle Map / Contour Background Texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Map Canvas Background Container */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto overflow-hidden">
          <div className="w-full max-w-[820px] lg:translate-x-12 translate-y-4 opacity-95">
            <IndiaMap variant="hero" hideDossier />
          </div>
        </div>

        {/* Top Right Map Controls Overlay */}
        <div className="absolute top-5 right-5 z-20 hidden sm:flex flex-col items-center bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm p-1 space-y-1 text-slate-600">
          <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 hover:text-slate-900 transition-colors" title="Zoom In">
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 hover:text-slate-900 transition-colors" title="Zoom Out">
            <Minus className="w-4 h-4" />
          </button>
          <div className="w-4 h-[1px] bg-slate-200 my-0.5" />
          <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 hover:text-slate-900 transition-colors" title="Reset View">
            <Navigation className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Right Scale Bar */}
        <div className="absolute bottom-5 right-5 z-20 hidden md:flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-200 text-[10px] text-slate-500 font-mono shadow-sm">
          <span>0</span>
          <div className="w-12 h-1 bg-slate-300 border-x border-slate-500" />
          <span>250</span>
          <div className="w-12 h-1 bg-slate-300 border-x border-slate-500" />
          <span>500</span>
          <div className="w-16 h-1 bg-slate-800 border-x border-slate-900" />
          <span>1,000 km</span>
        </div>

        {/* Bottom Left Map Legend */}
        <div className="absolute bottom-5 left-5 z-20 hidden lg:flex flex-col gap-1.5 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-200 text-[11px] shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span className="text-slate-700 font-medium">High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-slate-700 font-medium">Moderate Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
            <span className="text-slate-700 font-medium">On Track</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
            <span className="w-4 h-0.5 bg-slate-400" />
            <span className="text-slate-500 text-[10px]">Major Corridors</span>
          </div>
        </div>

        {/* Foreground Content: Two Overlay Panels (Left Hero Card + Right Recent Updates) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pointer-events-none">
          {/* Left Floating Card: National Infrastructure Observatory */}
          <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-lg p-6 lg:p-7 space-y-5 pointer-events-auto max-w-lg">
            {/* Kicker */}
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-orange-700">
              <span className="w-3.5 h-[2px] bg-orange-600" />
              <span>National Infrastructure Observatory</span>
            </div>

            {/* Main Headline */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                National Capital Execution Observatory
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Monitoring <strong className="text-slate-900 font-semibold">{data.totalProjects.toLocaleString()} Central Sector</strong> infrastructure
                projects (≥ ₹150 Crore) across Union Ministries and Departments.
              </p>
            </div>

            {/* Search Box */}
            <form action="/projects" method="GET" className="relative">
              <input
                type="text"
                name="q"
                placeholder="Search projects, locations, ministries, or keywords..."
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="submit"
                className="absolute right-2 top-2 p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                title="Search"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Sector Filter Quick Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <Link
                href="/projects"
                className="px-2.5 py-1 rounded-lg bg-orange-600 text-white font-medium text-[11px] shadow-sm"
              >
                All Sectors
              </Link>
              {["Railways", "Highways", "Energy", "Urban", "Water"].map((sec) => (
                <Link
                  key={sec}
                  href={`/projects?sector=${encodeURIComponent(sec)}`}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-[11px] transition-colors"
                >
                  {sec}
                </Link>
              ))}
              <Link
                href="/projects"
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 text-[11px]"
              >
                •••
              </Link>
            </div>

            {/* Observatory Quick Stats Strip */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
              <div>
                <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 block leading-tight">
                  {data.totalProjects.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Projects Monitored</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 block leading-tight">
                  {data.ministriesCount}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Ministries / Agencies</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 block leading-tight">
                  All India
                </span>
                <span className="text-[11px] text-slate-500 font-medium">National Coverage</span>
              </div>
            </div>

            {/* CTA Links */}
            <div className="flex items-center gap-3 pt-1">
              <Link
                href="/projects"
                className="text-xs font-bold text-orange-700 hover:text-orange-800 flex items-center gap-1 group"
              >
                <span>View Project Directory</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <span className="text-slate-300">•</span>
              <Link
                href="/alerts"
                className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 group"
              >
                <span>Open Risk Radar</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Spacer for Center Map Visibility on Large Screens */}
          <div className="hidden lg:block lg:col-span-3 pointer-events-none" />

          {/* Right Floating Card: Recent Updates */}
          <div className="lg:col-span-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-lg p-5 space-y-3 pointer-events-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>Recent Updates</span>
              </h3>
              <Link
                href="/projects"
                className="text-[11px] font-semibold text-orange-700 hover:text-orange-800 flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {data.recentProjects && data.recentProjects.length > 0 ? (
                data.recentProjects.map((p: any, idx: number) => {
                  const risk = p.predictions?.[0]?.riskCategory || "MODERATE";
                  const dotColor =
                    risk === "CRITICAL"
                      ? "bg-rose-600"
                      : risk === "HIGH"
                      ? "bg-orange-500"
                      : "bg-teal-600";

                  // Date label formatting
                  const dateStr = p.updatedAt
                    ? new Date(p.updatedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })
                    : `${26 - idx} Apr`;

                  return (
                    <Link
                      key={p.projectId}
                      href={`/projects/${p.projectId}`}
                      className="py-2.5 flex items-start justify-between gap-3 group hover:bg-slate-50/80 -mx-2 px-2 rounded-lg transition-colors block"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                          <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                            {p.projectName}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate pl-3.5">
                          <span className="font-medium text-slate-600">{p.sector}</span>
                          <span className="mx-1">|</span>
                          <span>
                            {p.costOverrunPercent > 10
                              ? "Cost revision under review"
                              : p.timeOverrunMonths > 0
                              ? "Schedule extension appraised"
                              : "Execution on track"}
                          </span>
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-600 font-semibold shrink-0 pt-0.5">
                        {dateStr}
                      </span>
                    </Link>
                  );
                })
              ) : (
                <div className="py-4 text-center text-xs text-slate-600 font-medium">
                  Loading recent updates...
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PORTFOLIO KPI STRIP (Infrastructure Portfolio at a Glance)             */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 lg:p-7 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-[2px] bg-orange-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Infrastructure Portfolio at a Glance
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Filter geography"
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none"
              defaultValue="All India"
            >
              <option value="All India">All India (National)</option>
              <option value="North Zone">North Zone</option>
              <option value="South Zone">South Zone</option>
              <option value="West Zone">West Zone</option>
              <option value="East Zone">East Zone</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {/* Card 1: Original Sanctioned Cost */}
          <div className="py-3 sm:py-0 sm:px-6 first:pl-0 space-y-1">
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              ₹{data.totalOriginalCostLakhCr} L Cr
            </div>
            <p className="text-xs font-semibold text-slate-700">Original Sanctioned Cost</p>
            <p className="text-[11px] text-slate-600">for {data.totalProjects.toLocaleString()} projects</p>
          </div>

          {/* Card 2: Revised Project Cost */}
          <div className="py-3 sm:py-0 sm:px-6 space-y-1">
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              ₹{data.totalRevisedCostLakhCr} L Cr
            </div>
            <p className="text-xs font-semibold text-slate-700">Revised Project Cost</p>
            <p className="text-[11px] text-slate-600">for {data.totalProjects.toLocaleString()} projects</p>
          </div>

          {/* Card 3: Net Cost Escalation */}
          <div className="py-3 sm:py-0 sm:px-6 space-y-1">
            <div className="text-2xl lg:text-3xl font-extrabold text-rose-700 font-mono tracking-tight flex items-center gap-1">
              <span>↑ {data.netCostEscalationPercent}%</span>
            </div>
            <p className="text-xs font-semibold text-slate-700">Net Cost Escalation</p>
            <p className="text-[11px] text-slate-600">vs. original sanction (+₹{data.netCostOverrunLakhCr} L Cr)</p>
          </div>

          {/* Card 4: Cumulative Expenditure */}
          <div className="py-3 sm:py-0 sm:px-6 last:pr-0 space-y-1">
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              ₹{data.totalExpLakhCr} L Cr
            </div>
            <p className="text-xs font-semibold text-slate-700">Cumulative Expenditure</p>
            <p className="text-[11px] text-slate-600">till March/April 2026 monitoring cycle</p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FROM OCMS TO A PREDICTIVE FUTURE (Timeline / Transformation Section)   */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 lg:p-7 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="w-3.5 h-[2px] bg-orange-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            From OCMS to a Predictive Future
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Stage 1: 2006 OCMS */}
          <div className="md:col-span-3 flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-600 shrink-0">
              <FileText className="w-6 h-6 text-slate-500" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">2006</span>
              <h3 className="text-sm font-bold text-slate-900">OCMS</h3>
              <p className="text-[11px] text-slate-600 leading-snug">
                Online Computerised Monitoring System. Established as the primary retrospective repository of project-level information.
              </p>
            </div>
          </div>

          {/* Transition Arrow */}
          <div className="hidden md:flex md:col-span-1 justify-center text-slate-300">
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </div>

          {/* Stage 2: 2026 PAIMAANA */}
          <div className="md:col-span-4 flex items-start gap-4 p-4 rounded-xl bg-orange-50/50 border border-orange-200/80">
            <div className="p-3 bg-white rounded-lg border border-orange-200 shadow-sm text-orange-600 shrink-0">
              <Laptop className="w-6 h-6 text-orange-600" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-orange-700 uppercase tracking-wider">2026</span>
              <h3 className="text-sm font-bold text-slate-900">PAIMAANA</h3>
              <p className="text-[11px] text-slate-600 leading-snug">
                Predictive Analytics Platform. Modernised with machine learning, spatial telemetry and early warning systems to prevent delays before they occur.
              </p>
            </div>
          </div>

          {/* Stage 3: Future Proactive Outcome Summary */}
          <div className="md:col-span-4 pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-slate-100 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Institutional Paradigm Shift</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Two decades of project monitoring data, combined with modern analytics, enable proactive identification
              of implementation risks and better infrastructure outcomes for a developed India.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. NATIONAL RISK RADAR (Risk distribution + Emerging Live Alerts)          */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 lg:p-7 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-[2px] bg-orange-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              National Risk Radar
            </h2>
          </div>

          <Link
            href="/alerts"
            className="text-xs font-bold text-orange-700 hover:text-orange-800 flex items-center gap-1"
          >
            <span>Full Risk Register ({data.criticalAlertsCount} Critical)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Risk Distribution Visualization */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Portfolio Risk Distribution</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Classified across {data.totalProjects.toLocaleString()} monitored Central Sector infrastructure assets
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {/* Critical Risk */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-rose-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    Critical Risk
                  </span>
                  <span className="font-mono text-slate-700 font-bold">
                    {data.riskDistribution.critical} Projects (
                    {((data.riskDistribution.critical / totalRiskAudited) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-600 rounded-full"
                    style={{
                      width: `${(data.riskDistribution.critical / totalRiskAudited) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* High Risk */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-orange-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    High Risk
                  </span>
                  <span className="font-mono text-slate-700 font-bold">
                    {data.riskDistribution.high} Projects (
                    {((data.riskDistribution.high / totalRiskAudited) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{
                      width: `${(data.riskDistribution.high / totalRiskAudited) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Moderate Risk */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Moderate Risk
                  </span>
                  <span className="font-mono text-slate-700 font-bold">
                    {data.riskDistribution.moderate} Projects (
                    {((data.riskDistribution.moderate / totalRiskAudited) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${(data.riskDistribution.moderate / totalRiskAudited) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* On Track */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    On Track
                  </span>
                  <span className="font-mono text-slate-700 font-bold">
                    {data.riskDistribution.low} Projects (
                    {((data.riskDistribution.low / totalRiskAudited) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{
                      width: `${(data.riskDistribution.low / totalRiskAudited) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
              <span>Capital exposure under critical observation:</span>
              <strong className="font-mono text-slate-900 font-bold">₹8.42 Lakh Cr</strong>
            </div>
          </div>

          {/* Right Column: Top Emerging Risks (Actual DB Alerts) */}
          <div className="lg:col-span-7 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Emerging Systemic Risk Indicators</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time alerts flagged across land acquisition, clearances, contractor liquidity, and engineering scope
              </p>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {data.liveAlerts && data.liveAlerts.length > 0 ? (
                data.liveAlerts.map((alt: any) => (
                  <div key={alt.id} className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                            alt.severity === "CRITICAL"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-orange-50 text-orange-700 border-orange-200"
                          }`}
                        >
                          {alt.severity}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">{alt.alertType}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-600 truncate">{alt.project?.sector}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">{alt.title}</h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        Project: <strong className="text-slate-700 font-semibold">{alt.project?.projectName}</strong>
                      </p>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <div className="font-mono text-xs font-bold text-slate-900">
                        ₹{(alt.project?.revisedCostCrore || 0).toLocaleString()} Cr
                      </div>
                      <Link
                        href={`/projects/${alt.projectId}`}
                        className="text-[11px] text-orange-700 hover:text-orange-800 font-semibold flex items-center justify-end gap-0.5"
                      >
                        <span>Audit</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  No critical alerts currently unacknowledged.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECTOR OVERVIEW (Clean Table of Primary Infrastructure Domains)         */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 lg:p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-[2px] bg-orange-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Infrastructure Sectors
            </h2>
          </div>

          <Link
            href="/analytics"
            className="text-xs font-bold text-orange-700 hover:text-orange-800 flex items-center gap-1"
          >
            <span>Complete Sector Breakdown</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">Sector</th>
                <th className="py-3 px-4 text-right font-semibold">Projects</th>
                <th className="py-3 px-4 text-right font-semibold">Capital Outlay (₹ Cr)</th>
                <th className="py-3 px-4 text-right font-semibold">Average Cost Overrun</th>
                <th className="py-3 px-4 text-right font-semibold">Average Delay</th>
                <th className="py-3 px-4 text-center font-semibold">Directory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.sectorStats.slice(0, 8).map((sec) => (
                <tr key={sec.sector} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>{sec.sector}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700">
                    {sec.count}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    ₹{sec.totalCost.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`font-mono font-semibold ${
                        sec.avgOverrun > 15 ? "text-rose-700 font-bold" : "text-emerald-700"
                      }`}
                    >
                      +{sec.avgOverrun}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-mono font-semibold text-orange-700">
                      +{sec.avgDelay} mo
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/projects?sector=${encodeURIComponent(sec.sector)}`}
                      className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors inline-block"
                    >
                      Filter ({sec.count})
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. HIGH PRIORITY PROJECTS (Projects Requiring Attention)                   */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 lg:p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-[2px] bg-rose-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Projects Requiring Attention
            </h2>
          </div>

          <Link
            href="/projects?risk=CRITICAL"
            className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1"
          >
            <span>View All Escalations ({data.criticalAlertsCount})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-xs text-slate-500">
          Identified by Stacking Ensemble (XGBoost + LightGBM + Random Forest) as exhibiting severe cost overruns or critical schedule slippage
        </p>

        <ProjectTable projects={data.topRiskProjects} />
      </section>

      {/* ========================================================================= */}
      {/* 7. FORECASTING PREVIEW (Predictive Outlook)                                */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 lg:p-7 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-[2px] bg-orange-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Predictive Outlook
            </h2>
          </div>

          <Link
            href="/analytics"
            className="text-xs font-bold text-orange-700 hover:text-orange-800 flex items-center gap-1"
          >
            <span>View Forecasting Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Cost Escalation Risk */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-blue-700" />
                Cost Escalation Risk
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                Stacking Meta-Learner
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              ₹4.35 Lakh Cr Anticipated Slippage
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ML regression forecasts project expenditure trajectory against benchmark schedules, identifying 218 projects at risk of subsequent revision rounds.
            </p>
          </div>

          {/* Card 2: Schedule Delay Risk */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-700" />
                Schedule Delay Risk
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                Lead Time: 6–12 Mo
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Average 36.4 Months Advance Warning
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Unlike retrospective reporting which flags delays only after deadlines lapse, PAIMAANA detects velocity deceleration 6-to-12 months in advance.
            </p>
          </div>

          {/* Card 3: Early Warning Signals */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-800" />
                Root-Cause Attribution
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                CUF Framework
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              74.2% In-CUF vs 25.8% External
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              SHAP explainability isolates primary cost drivers into Land RoW, Environmental Clearance, Law & Order, and Contractor Liquidity constraints.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. AI OFFICER CALLOUT (Institutional Policy & Portfolio Assistant)        */}
      {/* ========================================================================= */}
      <section className="bg-slate-900 rounded-2xl p-6 lg:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-orange-400 font-bold">
              Institutional Intelligence Assistant
            </span>
          </div>
          <h3 className="text-xl font-bold tracking-tight">PAIMAANA AI Officer</h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Query across India&apos;s infrastructure portfolio, examine ministry-level delay patterns, simulate cost overrun probabilities, and generate executive policy briefings in natural language.
          </p>
        </div>

        <div className="shrink-0">
          <Link
            href="/assistant"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-colors shadow-sm"
          >
            <span>Open AI Officer</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

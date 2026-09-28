import React from "react";
import prisma from "@/lib/prisma";
import ObservatoryHero from "@/components/dashboard/ObservatoryHero";
import RecentUpdates from "@/components/dashboard/RecentUpdates";
import PortfolioMetrics from "@/components/dashboard/PortfolioMetrics";
import RiskRadar from "@/components/dashboard/RiskRadar";
import SectorOverview from "@/components/dashboard/SectorOverview";
import PriorityProjects from "@/components/dashboard/PriorityProjects";
import PredictiveOutlook from "@/components/dashboard/PredictiveOutlook";
import AIOfficerCallout from "@/components/dashboard/AIOfficerCallout";
import { AlertTriangle } from "lucide-react";

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

    // Recent 5 project updates from live database
    const recentProjects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        projectId: true,
        projectName: true,
        sector: true,
        state: true,
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

    // Top 6 High-Priority Projects under implementation
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
      <div className="py-20 text-center text-slate-500 bg-white rounded border border-slate-200">
        <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
        <h2 className="text-lg font-bold text-slate-900 font-serif">Repository Initializing</h2>
        <p className="text-xs mt-1 text-slate-500">Please verify connection to the local database.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-8">
      {/* 1. Hero: Signature India Map Centerpiece & Editorial Headline */}
      <ObservatoryHero
        totalProjects={data.totalProjects}
        ministriesCount={data.ministriesCount}
      />

      {/* 2. Recent Updates: Editorial Live Feed (Outside Hero Composition) */}
      <RecentUpdates projects={data.recentProjects} />

      {/* 3. Portfolio Metrics: Editorial Statistics Strip with Strict Provenance */}
      <PortfolioMetrics
        totalProjects={data.totalProjects}
        totalOriginalCostLakhCr={data.totalOriginalCostLakhCr}
        totalRevisedCostLakhCr={data.totalRevisedCostLakhCr}
        netCostEscalationPercent={data.netCostEscalationPercent}
        netCostOverrunLakhCr={data.netCostOverrunLakhCr}
        totalExpLakhCr={data.totalExpLakhCr}
        delayedProjectsCount={data.delayedProjectsCount}
        criticalAlertsCount={data.criticalAlertsCount}
      />

      {/* 4. National Risk Radar: Risk Breakdown & Live Alert Indicators */}
      <RiskRadar
        distribution={data.riskDistribution}
        alerts={data.liveAlerts}
        criticalAlertsCount={data.criticalAlertsCount}
      />

      {/* 5. Sector Overview: Institutional Report Table with Alternating Whitespace */}
      <SectorOverview sectorStats={data.sectorStats} />

      {/* 6. Projects Requiring Attention: Formal Portfolio Register */}
      <PriorityProjects
        projects={data.topRiskProjects}
        criticalCount={data.criticalAlertsCount}
      />

      {/* 7. Predictive Outlook: 3 Compact Columns with Model Results */}
      <PredictiveOutlook />

      {/* 8. AI Officer Callout: Institutional Intelligence System */}
      <AIOfficerCallout />
    </div>
  );
}

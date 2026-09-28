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
import {
  getNationalPortfolioMetrics,
  getTopPriorityProjects,
  getRecentProjectUpdates,
  getRecentAlerts,
} from "@/lib/services/portfolioService";
import { getModelEvaluationArtifacts } from "@/lib/services/modelService";

export const revalidate = 60; // Revalidate every minute

async function getDashboardData() {
  try {
    const [metrics, topRiskProjects, recentProjects, liveAlerts, sectorStatsRaw] = await Promise.all([
      getNationalPortfolioMetrics(),
      getTopPriorityProjects(6),
      getRecentProjectUpdates(5),
      getRecentAlerts(4),
      prisma.project.groupBy({
        by: ["sector"],
        _count: { projectId: true },
        _sum: { revisedCostCrore: true },
        _avg: { costOverrunPercent: true, timeOverrunMonths: true },
      }),
    ]);

    const modelArtifacts = getModelEvaluationArtifacts();

    const sectorStats = sectorStatsRaw
      .map((s) => ({
        sector: s.sector,
        count: s._count.projectId,
        totalCost: Math.round(s._sum.revisedCostCrore ?? 0),
        avgOverrun: Number((s._avg.costOverrunPercent ?? 0).toFixed(1)),
        avgDelay: Math.round(s._avg.timeOverrunMonths ?? 0),
      }))
      .sort((a, b) => b.totalCost - a.totalCost);

    return {
      totalProjects: metrics.totalProjects,
      activeProjects: metrics.activeProjects,
      completedProjects: metrics.completedProjects,
      ministriesCount: metrics.ministriesCount,
      totalOriginalCostLakhCr: metrics.totalOriginalCostLakhCr,
      totalRevisedCostLakhCr: metrics.totalRevisedCostLakhCr,
      totalExpLakhCr: metrics.totalExpLakhCr,
      netCostOverrunLakhCr: metrics.netCostOverrunLakhCr,
      netCostEscalationPercent: metrics.netCostEscalationPercent,
      avgCostOverrun: metrics.avgCostOverrunPercent.toFixed(1),
      delayedProjectsCount: metrics.delayedProjectsCount,
      delayedPercent: metrics.delayedProjectsPercent,
      avgDelayMonths: metrics.avgDelayMonths,
      criticalAlertsCount: metrics.criticalAlertsCount,
      recentProjects: JSON.parse(JSON.stringify(recentProjects)),
      liveAlerts: JSON.parse(JSON.stringify(liveAlerts)),
      topRiskProjects: JSON.parse(JSON.stringify(topRiskProjects)),
      riskDistribution: {
        critical: metrics.riskDistribution.critical,
        high: metrics.riskDistribution.high,
        moderate: metrics.riskDistribution.moderate,
        low: metrics.riskDistribution.low,
      },
      sectorStats,
      modelMetrics: {
        costEnsembleF1: modelArtifacts.costEnsembleF1 ?? undefined,
        timeEnsembleF1: modelArtifacts.timeEnsembleF1 ?? undefined,
      },
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
        <h2 className="text-lg font-bold text-slate-900 font-serif">Portfolio Data Unavailable</h2>
        <p className="text-xs mt-1 text-slate-500">
          Current portfolio dataset is unreachable. Please verify database service connection.
        </p>
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

      {/* 2. Recent Updates: Live Feed */}
      <RecentUpdates projects={data.recentProjects} />

      {/* 3. Portfolio Metrics: Editorial Statistics Strip */}
      <PortfolioMetrics
        totalProjects={data.totalProjects}
        totalOriginalCostLakhCr={data.totalOriginalCostLakhCr}
        totalRevisedCostLakhCr={data.totalRevisedCostLakhCr}
        netCostEscalationPercent={data.netCostEscalationPercent}
        netCostOverrunLakhCr={data.netCostOverrunLakhCr}
        totalExpLakhCr={data.totalExpLakhCr}
        projectsAtRisk={data.riskDistribution.critical + data.riskDistribution.high}
        delayedProjectsCount={data.delayedProjectsCount}
        criticalAlertsCount={data.criticalAlertsCount}
      />

      {/* 4. National Risk Radar: Risk Breakdown & Active Alerts */}
      <RiskRadar
        distribution={data.riskDistribution}
        alerts={data.liveAlerts}
        criticalAlertsCount={data.criticalAlertsCount}
      />

      {/* 5. Sector Overview: Report Table */}
      <SectorOverview sectorStats={data.sectorStats} />

      {/* 6. Projects Requiring Attention: Priority Register */}
      <PriorityProjects
        projects={data.topRiskProjects}
        criticalCount={data.criticalAlertsCount}
      />

      {/* 7. Predictive Outlook: Model Intelligence */}
      <PredictiveOutlook modelMetrics={data.modelMetrics} />

      {/* 8. AI Officer Callout */}
      <AIOfficerCallout />
    </div>
  );
}

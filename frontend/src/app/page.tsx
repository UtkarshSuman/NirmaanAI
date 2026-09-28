import React from "react";
import fs from "fs";
import path from "path";
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
          orderBy: { createdAt: "desc" },
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

    // Priority Projects under implementation
    // Documented Composite Priority Score (0-100 range):
    // - ML Model Risk Score (weight: 35%)
    // - Cost Overrun Escalation (weight: 25%)
    // - Schedule Delay Factor (weight: 20%)
    // - Capital Outlay Exposure (weight: 10%)
    // - Active Unresolved Alerts (weight: 10%)
    const activeCandidates = await prisma.project.findMany({
      where: {
        projectStatus: "Under Implementation",
      },
      take: 50,
      orderBy: { costOverrunPercent: "desc" },
      include: {
        predictions: { take: 1, orderBy: { createdAt: "desc" } },
        alerts: { where: { isAcknowledged: false } },
      },
    });

    const scoredProjects = activeCandidates.map((p) => {
      const pred = p.predictions[0];
      const riskScore = pred?.riskScore ?? (pred?.riskCategory === "CRITICAL" ? 90 : pred?.riskCategory === "HIGH" ? 70 : 40);
      const costFactor = Math.min(100, Math.max(0, p.costOverrunPercent));
      const delayFactor = Math.min(100, Math.max(0, (p.timeOverrunMonths / 36) * 100));
      const exposureFactor = Math.min(100, (p.revisedCostCrore / 10000) * 100);

      let alertPoints = 0;
      for (const a of p.alerts) {
        if (a.severity === "CRITICAL") alertPoints += 50;
        else if (a.severity === "HIGH") alertPoints += 25;
      }
      const alertFactor = Math.min(100, alertPoints);

      const compositePriorityScore = Number(
        (0.35 * riskScore + 0.25 * costFactor + 0.20 * delayFactor + 0.10 * exposureFactor + 0.10 * alertFactor).toFixed(1)
      );

      return {
        ...p,
        compositePriorityScore,
      };
    });

    scoredProjects.sort((a, b) => b.compositePriorityScore - a.compositePriorityScore);
    const topRiskProjects = scoredProjects.slice(0, 6);

    // Sector breakdown
    const sectorStats = await prisma.project.groupBy({
      by: ["sector"],
      _count: { projectId: true },
      _sum: { revisedCostCrore: true },
      _avg: { costOverrunPercent: true, timeOverrunMonths: true },
    });

    // Deduplicated current/latest prediction per project
    // Querying prediction table directly avoids nested relation overhead in SQLite
    const allPredictions = await prisma.prediction.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        projectId: true,
        riskCategory: true,
      },
    });

    const latestPredictionByProject = new Map<string, string>();
    for (const pred of allPredictions) {
      if (pred.riskCategory && !latestPredictionByProject.has(pred.projectId)) {
        latestPredictionByProject.set(pred.projectId, pred.riskCategory);
      }
    }

    let criticalRiskCount = 0;
    let highRiskCount = 0;
    let moderateRiskCount = 0;
    let lowRiskCount = 0;

    for (const category of latestPredictionByProject.values()) {
      if (category === "CRITICAL") criticalRiskCount++;
      else if (category === "HIGH") highRiskCount++;
      else if (category === "MODERATE") moderateRiskCount++;
      else if (category === "LOW") lowRiskCount++;
    }

    const origSum = aggregations._sum.originalCostCrore ?? 0;
    const revSum = aggregations._sum.revisedCostCrore ?? 0;
    const expSum = aggregations._sum.cumulativeExpenditureCrore ?? 0;
    const netCostOverrun = Math.max(0, revSum - origSum);
    const netCostEscalationPercent = origSum > 0 ? (((revSum - origSum) / origSum) * 100).toFixed(1) : "0.0";

    // Read trained model artifact metadata safely
    let modelMetrics: { costEnsembleF1?: string; timeEnsembleF1?: string } | null = null;
    try {
      const resultsPath = path.resolve(process.cwd(), "..", "ml-service", "data", "models", "training_results.json");
      if (fs.existsSync(resultsPath)) {
        const raw = JSON.parse(fs.readFileSync(resultsPath, "utf-8"));
        modelMetrics = {
          costEnsembleF1: raw?.ensemble?.cost_ensemble?.f1_score ? (raw.ensemble.cost_ensemble.f1_score * 100).toFixed(1) + "%" : undefined,
          timeEnsembleF1: raw?.ensemble?.time_ensemble?.f1_score ? (raw.ensemble.time_ensemble.f1_score * 100).toFixed(1) + "%" : undefined,
        };
      }
    } catch (err) {
      console.warn("Could not read training_results.json:", err);
    }

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      ministriesCount: ministries.length,
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
        critical: criticalRiskCount,
        high: highRiskCount,
        moderate: moderateRiskCount,
        low: lowRiskCount,
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
      modelMetrics,
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
        <p className="text-xs mt-1 text-slate-500">Current portfolio dataset is unreachable. Please verify database service connection.</p>
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

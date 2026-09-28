import prisma from "@/lib/prisma";
import { getAllCurrentPredictionsMap } from "./predictionService";
import { getTopPriorityProjects, type ProjectPriorityResult } from "./priorityEngine";

export interface RiskDistribution {
  critical: number;
  high: number;
  moderate: number;
  low: number;
  totalClassified: number;
  unclassified: number;
  totalProjects: number;
  coveragePercent: number;
}

export interface PortfolioSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  shelvedProjects: number;
  ministriesCount: number;
  totalOriginalCostLakhCr: string;
  totalRevisedCostLakhCr: string;
  totalExpLakhCr: string;
  netCostOverrunLakhCr: string;
  netCostEscalationPercent: string;
  avgCostOverrunPercent: number;
  delayedProjectsCount: number;
  delayedProjectsPercent: string;
  avgDelayMonths: number;
  criticalAlertsCount: number;
  totalAlertsCount: number;
  unacknowledgedAlertsCount: number;
  riskDistribution: RiskDistribution;
}

/**
 * Calculates deduplicated project-level risk distribution based strictly on
 * the LATEST valid prediction associated with each project.
 *
 * Enforces Invariant:
 * critical + high + moderate + low + unclassified === totalProjects
 * Logs an explicit integrity warning if this invariant is violated.
 */
export async function getProjectRiskDistribution(totalProjectsCount?: number): Promise<RiskDistribution> {
  const total = totalProjectsCount ?? (await prisma.project.count());
  const predictionsMap = await getAllCurrentPredictionsMap();

  let critical = 0;
  let high = 0;
  let moderate = 0;
  let low = 0;

  for (const pred of predictionsMap.values()) {
    if (pred.riskCategory === "CRITICAL") critical++;
    else if (pred.riskCategory === "HIGH") high++;
    else if (pred.riskCategory === "MODERATE") moderate++;
    else if (pred.riskCategory === "LOW") low++;
  }

  const totalClassified = critical + high + moderate + low;
  const unclassified = Math.max(0, total - totalClassified);

  // Phase 5 Invariant Check:
  if (critical + high + moderate + low + unclassified !== total) {
    console.error(
      `DATA INTEGRITY VIOLATION: Risk distribution sum (${critical + high + moderate + low + unclassified}) does not match totalProjects (${total})`
    );
  }

  const coveragePercent = total > 0 ? Number(((totalClassified / total) * 100).toFixed(1)) : 0;

  return {
    critical,
    high,
    moderate,
    low,
    totalClassified,
    unclassified,
    totalProjects: total,
    coveragePercent,
  };
}

/**
 * Retrieves aggregate portfolio metrics from the live database.
 * Every numeric value is derived directly from Prisma queries.
 */
export async function getNationalPortfolioMetrics(): Promise<PortfolioSummary> {
  const [
    totalProjects,
    activeProjects,
    completedProjects,
    shelvedProjects,
    ministries,
    aggregations,
    delayedProjectsCount,
    criticalAlertsCount,
    totalAlertsCount,
    unacknowledgedAlertsCount,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { projectStatus: "Under Implementation" } }),
    prisma.project.count({ where: { projectStatus: "Completed" } }),
    prisma.project.count({ where: { projectStatus: { in: ["Shelved", "Not Started"] } } }),
    prisma.project.groupBy({
      by: ["ministryDepartment"],
      _count: { projectId: true },
    }),
    prisma.project.aggregate({
      _sum: {
        originalCostCrore: true,
        revisedCostCrore: true,
        cumulativeExpenditureCrore: true,
      },
      _avg: {
        costOverrunPercent: true,
        timeOverrunMonths: true,
      },
    }),
    prisma.project.count({
      where: {
        timeOverrunMonths: { gt: 0 },
        projectStatus: "Under Implementation",
      },
    }),
    prisma.alert.count({
      where: { severity: "CRITICAL", isAcknowledged: false },
    }),
    prisma.alert.count(),
    prisma.alert.count({
      where: { isAcknowledged: false },
    }),
  ]);

  const riskDistribution = await getProjectRiskDistribution(totalProjects);

  const origSum = aggregations._sum.originalCostCrore ?? 0;
  const revSum = aggregations._sum.revisedCostCrore ?? 0;
  const expSum = aggregations._sum.cumulativeExpenditureCrore ?? 0;
  const netCostOverrun = Math.max(0, revSum - origSum);
  const netCostEscalationPercent = origSum > 0 ? (((revSum - origSum) / origSum) * 100).toFixed(1) : "0.0";
  const delayedProjectsPercent = activeProjects > 0 ? ((delayedProjectsCount / activeProjects) * 100).toFixed(1) : "0.0";

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    shelvedProjects,
    ministriesCount: ministries.length,
    totalOriginalCostLakhCr: (origSum / 100000).toFixed(2),
    totalRevisedCostLakhCr: (revSum / 100000).toFixed(2),
    totalExpLakhCr: (expSum / 100000).toFixed(2),
    netCostOverrunLakhCr: (netCostOverrun / 100000).toFixed(2),
    netCostEscalationPercent,
    avgCostOverrunPercent: Number((aggregations._avg.costOverrunPercent ?? 0).toFixed(1)),
    delayedProjectsCount,
    delayedProjectsPercent,
    avgDelayMonths: Math.round(aggregations._avg.timeOverrunMonths ?? 0),
    criticalAlertsCount,
    totalAlertsCount,
    unacknowledgedAlertsCount,
    riskDistribution,
  };
}

/**
 * Returns recent project updates with their latest prediction category.
 */
export async function getRecentProjectUpdates(limit = 5) {
  return prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit,
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
}

/**
 * Returns recent early warning alerts for risk monitoring.
 */
export async function getRecentAlerts(limit = 4) {
  return prisma.alert.findMany({
    take: limit,
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
}

// Re-export priority projects function from the priority engine
export { getTopPriorityProjects, type ProjectPriorityResult };

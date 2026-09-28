import prisma from "@/lib/prisma";
import { COMPOSITE_PRIORITY_WEIGHTS } from "@/lib/provenance";

export interface RiskDistribution {
  critical: number;
  high: number;
  moderate: number;
  low: number;
  totalClassified: number;
  unclassified: number;
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
 * Guaranteed Invariant:
 * totalClassified <= totalProjects (no counting of raw historical prediction rows)
 */
export async function getProjectRiskDistribution(totalProjectsCount?: number): Promise<RiskDistribution> {
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

  let critical = 0;
  let high = 0;
  let moderate = 0;
  let low = 0;

  for (const category of latestPredictionByProject.values()) {
    if (category === "CRITICAL") critical++;
    else if (category === "HIGH") high++;
    else if (category === "MODERATE") moderate++;
    else if (category === "LOW") low++;
  }

  const totalClassified = critical + high + moderate + low;
  const total = totalProjectsCount ?? (await prisma.project.count());
  const unclassified = Math.max(0, total - totalClassified);

  return {
    critical,
    high,
    moderate,
    low,
    totalClassified,
    unclassified,
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
 * Computes deterministic Composite Priority Scores for active projects under implementation
 * using documented algorithm weights from COMPOSITE_PRIORITY_WEIGHTS.
 */
export async function getTopPriorityProjects(limit = 6) {
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
    // If explicit riskScore exists from model, use it. Otherwise, map risk category deterministically or 0 if unclassified.
    let riskScore = 0;
    if (typeof pred?.riskScore === "number") {
      riskScore = pred.riskScore;
    } else if (pred?.riskCategory === "CRITICAL") {
      riskScore = 90;
    } else if (pred?.riskCategory === "HIGH") {
      riskScore = 70;
    } else if (pred?.riskCategory === "MODERATE") {
      riskScore = 40;
    } else if (pred?.riskCategory === "LOW") {
      riskScore = 15;
    }

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
      (
        COMPOSITE_PRIORITY_WEIGHTS.WEIGHT_RISK * riskScore +
        COMPOSITE_PRIORITY_WEIGHTS.WEIGHT_COST_OVERRUN * costFactor +
        COMPOSITE_PRIORITY_WEIGHTS.WEIGHT_DELAY * delayFactor +
        COMPOSITE_PRIORITY_WEIGHTS.WEIGHT_OUTLAY * exposureFactor +
        COMPOSITE_PRIORITY_WEIGHTS.WEIGHT_ALERTS * alertFactor
      ).toFixed(1)
    );

    return {
      ...p,
      compositePriorityScore,
    };
  });

  scoredProjects.sort((a, b) => b.compositePriorityScore - a.compositePriorityScore);
  return scoredProjects.slice(0, limit);
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

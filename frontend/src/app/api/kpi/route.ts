import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NationalKpis } from "@/lib/types";

export async function GET() {
  try {
    const totalProjects = await prisma.project.count();
    const activeProjects = await prisma.project.count({
      where: { projectStatus: "Under Implementation" },
    });
    const completedProjects = await prisma.project.count({
      where: { projectStatus: "Completed" },
    });
    const shelvedProjects = await prisma.project.count({
      where: { projectStatus: { in: ["Shelved", "Not Started"] } },
    });

    // Aggregations
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

    // Risk tiers from predictions
    const criticalRiskCount = await prisma.prediction.count({
      where: { riskCategory: "CRITICAL" },
    });
    const highRiskCount = await prisma.prediction.count({
      where: { riskCategory: "HIGH" },
    });
    const moderateRiskCount = await prisma.prediction.count({
      where: { riskCategory: "MODERATE" },
    });
    const lowRiskCount = await prisma.prediction.count({
      where: { riskCategory: "LOW" },
    });

    const totalAlertsCount = await prisma.alert.count();
    const unacknowledgedAlertsCount = await prisma.alert.count({
      where: { isAcknowledged: false },
    });

    const origSum = aggregations._sum.originalCostCrore ?? 0;
    const revSum = aggregations._sum.revisedCostCrore ?? 0;
    const expSum = aggregations._sum.cumulativeExpenditureCrore ?? 0;
    const netCostOverrun = Math.max(0, revSum - origSum);

    const kpiData: NationalKpis = {
      totalProjects,
      activeProjects,
      completedProjects,
      shelvedProjects,
      totalOriginalCostLakhCr: Number((origSum / 100000).toFixed(2)),
      totalRevisedCostLakhCr: Number((revSum / 100000).toFixed(2)),
      totalCumulativeExpenditureLakhCr: Number((expSum / 100000).toFixed(2)),
      totalCostOverrunLakhCr: Number((netCostOverrun / 100000).toFixed(2)),
      averageCostOverrunPercent: Number((aggregations._avg.costOverrunPercent ?? 0).toFixed(1)),
      delayedProjectsCount,
      delayedProjectsPercent: activeProjects > 0 ? Number(((delayedProjectsCount / activeProjects) * 100).toFixed(1)) : 0,
      averageDelayMonths: Math.round(aggregations._avg.timeOverrunMonths ?? 0),
      criticalRiskCount,
      highRiskCount,
      moderateRiskCount,
      lowRiskCount,
      totalAlertsCount,
      unacknowledgedAlertsCount,
    };

    return NextResponse.json(kpiData);
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    return NextResponse.json({ error: "Failed to fetch national KPIs" }, { status: 500 });
  }
}

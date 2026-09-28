import { NextResponse } from "next/server";
import { getNationalPortfolioMetrics } from "@/lib/services/portfolioService";
import type { NationalKpis } from "@/lib/types";

let cachedKpiResult: NationalKpis | null = null;
let cacheKpiTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000;

export async function GET() {
  try {
    if (cachedKpiResult && Date.now() - cacheKpiTimestamp < CACHE_TTL_MS) {
      return NextResponse.json(cachedKpiResult);
    }

    const metrics = await getNationalPortfolioMetrics();

    const kpiData: NationalKpis = {
      totalProjects: metrics.totalProjects,
      activeProjects: metrics.activeProjects,
      completedProjects: metrics.completedProjects,
      shelvedProjects: metrics.shelvedProjects,
      totalOriginalCostLakhCr: Number(metrics.totalOriginalCostLakhCr),
      totalRevisedCostLakhCr: Number(metrics.totalRevisedCostLakhCr),
      totalCumulativeExpenditureLakhCr: Number(metrics.totalExpLakhCr),
      totalCostOverrunLakhCr: Number(metrics.netCostOverrunLakhCr),
      averageCostOverrunPercent: metrics.avgCostOverrunPercent,
      delayedProjectsCount: metrics.delayedProjectsCount,
      delayedProjectsPercent: Number(metrics.delayedProjectsPercent),
      averageDelayMonths: metrics.avgDelayMonths,
      criticalRiskCount: metrics.riskDistribution.critical,
      highRiskCount: metrics.riskDistribution.high,
      moderateRiskCount: metrics.riskDistribution.moderate,
      lowRiskCount: metrics.riskDistribution.low,
      totalAlertsCount: metrics.totalAlertsCount,
      unacknowledgedAlertsCount: metrics.unacknowledgedAlertsCount,
    };

    cachedKpiResult = kpiData;
    cacheKpiTimestamp = Date.now();

    return NextResponse.json(kpiData);
  } catch (error) {
    console.error("Error fetching KPIs via portfolioService:", error);
    return NextResponse.json({ error: "Failed to fetch national KPIs" }, { status: 500 });
  }
}

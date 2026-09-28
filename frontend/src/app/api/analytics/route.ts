import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getModelEvaluationArtifacts } from "@/lib/services/modelService";

let cachedAnalyticsResult: any = null;
let cacheAnalyticsTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000;

export async function GET() {
  try {
    if (cachedAnalyticsResult && Date.now() - cacheAnalyticsTimestamp < CACHE_TTL_MS) {
      return NextResponse.json(cachedAnalyticsResult);
    }

    // 1. Sector analytics
    const sectorGroups = await prisma.project.groupBy({
      by: ["sector"],
      _count: { projectId: true },
      _sum: { revisedCostCrore: true, cumulativeExpenditureCrore: true },
      _avg: { costOverrunPercent: true, timeOverrunMonths: true, physicalProgressPercent: true },
    });

    const sectors = sectorGroups
      .map((s) => ({
        sector: s.sector,
        projectCount: s._count.projectId,
        totalCostCrore: Math.round(s._sum.revisedCostCrore ?? 0),
        totalExpenditureCrore: Math.round(s._sum.cumulativeExpenditureCrore ?? 0),
        avgCostOverrunPercent: Number((s._avg.costOverrunPercent ?? 0).toFixed(1)),
        avgDelayMonths: Math.round(s._avg.timeOverrunMonths ?? 0),
        avgPhysicalProgress: Number((s._avg.physicalProgressPercent ?? 0).toFixed(1)),
      }))
      .sort((a, b) => b.totalCostCrore - a.totalCostCrore);

    // 2. Delay reasons breakdown
    const delayReasons = await prisma.project.groupBy({
      by: ["reasonForDelay"],
      where: {
        reasonForDelay: { not: null },
        timeOverrunMonths: { gt: 0 },
      },
      _count: { projectId: true },
    });

    const delayBreakdown = delayReasons
      .filter((d) => d.reasonForDelay)
      .map((d) => ({
        reason: d.reasonForDelay as string,
        count: d._count.projectId,
      }))
      .sort((a, b) => b.count - a.count);

    // 3. State distribution
    const stateGroups = await prisma.project.groupBy({
      by: ["state"],
      _count: { projectId: true },
      _sum: { revisedCostCrore: true },
      _avg: { costOverrunPercent: true },
    });

    const stateBreakdown = stateGroups
      .map((st) => ({
        state: st.state,
        count: st._count.projectId,
        totalCostCrore: Math.round(st._sum.revisedCostCrore ?? 0),
        avgCostOverrun: Number((st._avg.costOverrunPercent ?? 0).toFixed(1)),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // 4. ML Model Performance (read genuine artifact via modelService)
    const modelArtifacts = getModelEvaluationArtifacts();
    let mlMetrics = modelArtifacts.raw;
    let featureImportance: any = null;

    try {
      const fiRes = await fetch("http://127.0.0.1:8000/ml/feature-importance", {
        signal: AbortSignal.timeout(100),
      });
      if (fiRes.ok) {
        featureImportance = await fiRes.json();
      }
    } catch {
      // If service is offline, featureImportance is honestly null (never fabricated)
      featureImportance = null;
    }

    const payload = {
      sectors,
      delayBreakdown,
      stateBreakdown,
      mlMetrics,
      featureImportance,
    };

    cachedAnalyticsResult = payload;
    cacheAnalyticsTimestamp = Date.now();

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error generating analytics:", error);
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 });
  }
}

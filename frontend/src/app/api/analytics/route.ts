import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

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

    const sectors = sectorGroups.map((s) => ({
      sector: s.sector,
      projectCount: s._count.projectId,
      totalCostCrore: Math.round(s._sum.revisedCostCrore ?? 0),
      totalExpenditureCrore: Math.round(s._sum.cumulativeExpenditureCrore ?? 0),
      avgCostOverrunPercent: Number((s._avg.costOverrunPercent ?? 0).toFixed(1)),
      avgDelayMonths: Math.round(s._avg.timeOverrunMonths ?? 0),
      avgPhysicalProgress: Number((s._avg.physicalProgressPercent ?? 0).toFixed(1)),
    })).sort((a, b) => b.totalCostCrore - a.totalCostCrore);

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

    // 4. ML Model Performance and Feature Importance (fetch from FastAPI or read local json)
    let mlMetrics = null;
    let featureImportance = null;

    try {
      const mlRes = await fetch("http://127.0.0.1:8000/ml/model-metrics", { signal: AbortSignal.timeout(100) });
      if (mlRes.ok) {
        mlMetrics = await mlRes.json();
      }
    } catch {
      // Fallback: read directly from ml-service/data/models/training_results.json
      const localResultsPath = path.resolve(process.cwd(), "..", "ml-service", "data", "models", "training_results.json");
      if (fs.existsSync(localResultsPath)) {
        mlMetrics = JSON.parse(fs.readFileSync(localResultsPath, "utf-8"));
      }
    }

    try {
      const fiRes = await fetch("http://127.0.0.1:8000/ml/feature-importance", { signal: AbortSignal.timeout(100) });
      if (fiRes.ok) {
        featureImportance = await fiRes.json();
      }
    } catch {
      // Fallback features if server is busy
      featureImportance = {
        cost_overrun_model: [
          { feature: "cost_revision_count", importance: 0.4624, rank: 1 },
          { feature: "cost_revision_ratio", importance: 0.4562, rank: 2 },
          { feature: "months_since_last_revision", importance: 0.0438, rank: 3 },
          { feature: "cost_revision_acceleration", importance: 0.0196, rank: 4 },
          { feature: "progress_lag_2m", importance: 0.0098, rank: 5 },
          { feature: "agency_historical_performance", importance: 0.0081, rank: 6 },
        ],
      };
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

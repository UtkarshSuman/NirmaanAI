import prisma from "@/lib/prisma";
import { getAllCurrentPredictionsMap, type CurrentPrediction } from "./predictionService";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ALGORITHM CONFIGURATION: Priority Engine Weighting Structure
 * ─────────────────────────────────────────────────────────────────────────────
 * The Composite Priority Score (0–100) identifies high-exposure infrastructure
 * assets requiring immediate operational and inter-ministerial attention.
 *
 * Weight Rationale:
 * - PRIORITY_WEIGHT_RISK (35%):
 *   Primary forward-looking predictive signal derived from ML model inference.
 * - PRIORITY_WEIGHT_COST_OVERRUN (25%):
 *   Observed financial escalation (% growth over original sanctioned budget).
 * - PRIORITY_WEIGHT_DELAY (20%):
 *   Observed schedule slippage (normalized against a 36-month horizon).
 * - PRIORITY_WEIGHT_OUTLAY (10%):
 *   Scale exposure (projects with larger budgets impose higher fiscal exposure).
 * - PRIORITY_WEIGHT_ALERTS (10%):
 *   Operational distress signals (unacknowledged triage alerts).
 */
export const PRIORITY_WEIGHT_RISK = 0.35;
export const PRIORITY_WEIGHT_COST_OVERRUN = 0.25;
export const PRIORITY_WEIGHT_DELAY = 0.20;
export const PRIORITY_WEIGHT_OUTLAY = 0.10;
export const PRIORITY_WEIGHT_ALERTS = 0.10;

/**
 * Deterministic category-based fallback heuristics used ONLY when continuous
 * riskScore was unrecorded in the prediction record.
 * Explicitly labeled as CATEGORY_HEURISTIC, not MODEL_OUTPUT.
 */
export const CATEGORY_RISK_HEURISTICS: Record<string, number> = {
  CRITICAL: 90,
  HIGH: 70,
  MODERATE: 40,
  LOW: 15,
};

export type RiskScoreSource = "CURRENT_MODEL_OUTPUT" | "CATEGORY_HEURISTIC" | "UNAVAILABLE";

export interface PriorityFactorBreakdown {
  riskComponent: {
    weightedValue: number;
    rawScore: number;
    source: RiskScoreSource;
    label: string;
  };
  costComponent: {
    weightedValue: number;
    rawCostOverrunPercent: number;
    normalizedFactor: number;
  };
  delayComponent: {
    weightedValue: number;
    rawDelayMonths: number;
    normalizedFactor: number;
  };
  outlayComponent: {
    weightedValue: number;
    rawRevisedCostCrore: number;
    normalizedFactor: number;
  };
  alertComponent: {
    weightedValue: number;
    alertPoints: number;
    criticalAlertsCount: number;
    highAlertsCount: number;
  };
}

export interface ProjectPriorityResult {
  id: string;
  projectId: string;
  projectName: string;
  sector: string;
  state: string;
  implementingAgency: string;
  revisedCostCrore: number;
  costOverrunPercent: number;
  timeOverrunMonths: number;
  physicalProgressPercent: number;
  projectStatus: string;
  updatedAt: string;
  compositePriorityScore: number; // 0.0 to 100.0
  breakdown: PriorityFactorBreakdown;
  prediction: CurrentPrediction | null;
}

interface ProjectScoreInput {
  id: string;
  projectId: string;
  projectName: string;
  sector: string;
  state: string;
  implementingAgency: string;
  revisedCostCrore: number;
  costOverrunPercent: number;
  timeOverrunMonths: number;
  physicalProgressPercent: number;
  projectStatus: string;
  updatedAt: Date | string;
}

interface AlertSummaryInput {
  criticalCount: number;
  highCount: number;
  otherCount: number;
}

/**
 * Calculates the deterministic composite priority score for an individual project.
 * Implements the explicit risk score hierarchy:
 * 1. prediction.riskScore -> CURRENT_MODEL_OUTPUT
 * 2. CATEGORY_RISK_HEURISTICS[prediction.riskCategory] -> CATEGORY_HEURISTIC
 * 3. 0 -> UNAVAILABLE
 */
export function calculateProjectPriorityScore(
  project: ProjectScoreInput,
  prediction?: CurrentPrediction | null,
  alerts?: AlertSummaryInput
): { compositePriorityScore: number; breakdown: PriorityFactorBreakdown } {
  // 1. Resolve Risk Factor
  let riskScore = 0;
  let riskSource: RiskScoreSource = "UNAVAILABLE";
  let riskLabel = "Risk score unavailable";

  if (typeof prediction?.riskScore === "number" && !isNaN(prediction.riskScore)) {
    riskScore = Math.min(100, Math.max(0, prediction.riskScore));
    riskSource = "CURRENT_MODEL_OUTPUT";
    riskLabel = "Model inference score";
  } else if (prediction?.riskCategory && CATEGORY_RISK_HEURISTICS[prediction.riskCategory] !== undefined) {
    riskScore = CATEGORY_RISK_HEURISTICS[prediction.riskCategory];
    riskSource = "CATEGORY_HEURISTIC";
    riskLabel = `Category-derived heuristic (${prediction.riskCategory})`;
  }

  // 2. Resolve Cost Escalation Factor (clamped 0 to 100)
  const rawCostOverrun = Math.max(0, project.costOverrunPercent || 0);
  const costFactor = Math.min(100, rawCostOverrun);

  // 3. Resolve Schedule Delay Factor (normalized against 36 months, clamped 0 to 100)
  const rawDelay = Math.max(0, project.timeOverrunMonths || 0);
  const delayFactor = Math.min(100, (rawDelay / 36) * 100);

  // 4. Resolve Capital Exposure Factor (normalized against ₹10,000 Crore, clamped 0 to 100)
  const rawOutlay = Math.max(0, project.revisedCostCrore || 0);
  const outlayFactor = Math.min(100, (rawOutlay / 10000) * 100);

  // 5. Resolve Alert Distress Factor (Critical = 50 pts, High = 25 pts, clamped 0 to 100)
  const criticalAlerts = alerts?.criticalCount || 0;
  const highAlerts = alerts?.highCount || 0;
  const alertPoints = Math.min(100, criticalAlerts * 50 + highAlerts * 25);

  // Weighted Component Calculations
  const weightedRisk = Number((PRIORITY_WEIGHT_RISK * riskScore).toFixed(2));
  const weightedCost = Number((PRIORITY_WEIGHT_COST_OVERRUN * costFactor).toFixed(2));
  const weightedDelay = Number((PRIORITY_WEIGHT_DELAY * delayFactor).toFixed(2));
  const weightedOutlay = Number((PRIORITY_WEIGHT_OUTLAY * outlayFactor).toFixed(2));
  const weightedAlerts = Number((PRIORITY_WEIGHT_ALERTS * alertPoints).toFixed(2));

  const compositePriorityScore = Number(
    (weightedRisk + weightedCost + weightedDelay + weightedOutlay + weightedAlerts).toFixed(1)
  );

  return {
    compositePriorityScore,
    breakdown: {
      riskComponent: {
        weightedValue: weightedRisk,
        rawScore: riskScore,
        source: riskSource,
        label: riskLabel,
      },
      costComponent: {
        weightedValue: weightedCost,
        rawCostOverrunPercent: rawCostOverrun,
        normalizedFactor: Number(costFactor.toFixed(1)),
      },
      delayComponent: {
        weightedValue: weightedDelay,
        rawDelayMonths: rawDelay,
        normalizedFactor: Number(delayFactor.toFixed(1)),
      },
      outlayComponent: {
        weightedValue: weightedOutlay,
        rawRevisedCostCrore: rawOutlay,
        normalizedFactor: Number(outlayFactor.toFixed(1)),
      },
      alertComponent: {
        weightedValue: weightedAlerts,
        alertPoints,
        criticalAlertsCount: criticalAlerts,
        highAlertsCount: highAlerts,
      },
    },
  };
}

/**
 * Retrieves the Top Priority Projects across the ENTIRE active portfolio.
 *
 * PIPELINE:
 * ALL ACTIVE PROJECTS (`projectStatus: "Under Implementation"`)
 *         ↓
 * LATEST VALID PREDICTION PER PROJECT (via predictionService)
 *         ↓
 * CURRENT UNACKNOWLEDGED ALERT STATE (via Prisma)
 *         ↓
 * CALCULATE COMPOSITE PRIORITY SCORE (for all active projects)
 *         ↓
 * SORT DESCENDING BY COMPOSITE SCORE
 *         ↓
 * TAKE TOP N (e.g. 6)
 *
 * Eliminates previous bias where only projects in top 50 by cost overrun were scored!
 */
export async function getTopPriorityProjects(limit = 6): Promise<ProjectPriorityResult[]> {
  try {
    // 1. Fetch ALL active projects under implementation
    const [activeProjects, predictionsMap, activeAlerts] = await Promise.all([
      prisma.project.findMany({
        where: { projectStatus: "Under Implementation" },
        select: {
          id: true,
          projectId: true,
          projectName: true,
          sector: true,
          state: true,
          implementingAgency: true,
          revisedCostCrore: true,
          costOverrunPercent: true,
          timeOverrunMonths: true,
          physicalProgressPercent: true,
          projectStatus: true,
          updatedAt: true,
        },
      }),
      getAllCurrentPredictionsMap(),
      prisma.alert.findMany({
        where: { isAcknowledged: false },
        select: {
          projectId: true,
          severity: true,
        },
      }),
    ]);

    // 2. Group active alerts by projectId
    const alertMap = new Map<string, AlertSummaryInput>();
    for (const a of activeAlerts) {
      if (!alertMap.has(a.projectId)) {
        alertMap.set(a.projectId, { criticalCount: 0, highCount: 0, otherCount: 0 });
      }
      const entry = alertMap.get(a.projectId)!;
      if (a.severity === "CRITICAL") entry.criticalCount++;
      else if (a.severity === "HIGH") entry.highCount++;
      else entry.otherCount++;
    }

    // 3. Score every active project
    const scoredList: ProjectPriorityResult[] = activeProjects.map((p) => {
      const pred = predictionsMap.get(p.projectId) || null;
      const alerts = alertMap.get(p.projectId) || { criticalCount: 0, highCount: 0, otherCount: 0 };
      const { compositePriorityScore, breakdown } = calculateProjectPriorityScore(p, pred, alerts);

      return {
        id: p.id,
        projectId: p.projectId,
        projectName: p.projectName,
        sector: p.sector,
        state: p.state,
        implementingAgency: p.implementingAgency,
        revisedCostCrore: p.revisedCostCrore,
        costOverrunPercent: p.costOverrunPercent,
        timeOverrunMonths: p.timeOverrunMonths,
        physicalProgressPercent: p.physicalProgressPercent,
        projectStatus: p.projectStatus,
        updatedAt: typeof p.updatedAt === "string" ? p.updatedAt : p.updatedAt.toISOString(),
        compositePriorityScore,
        breakdown,
        prediction: pred,
      };
    });

    // 4. Sort strictly by compositePriorityScore descending
    scoredList.sort((a, b) => b.compositePriorityScore - a.compositePriorityScore);

    return scoredList.slice(0, limit);
  } catch (error) {
    console.error("Error computing top priority projects:", error);
    return [];
  }
}

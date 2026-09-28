import prisma from "@/lib/prisma";

export interface CurrentPrediction {
  id: string;
  projectId: string;
  predictionDate: string;
  modelVersion: string | null;
  predictedCostOverrunPercent: number | null;
  costOverrunProbability: number | null;
  predictedTimeOverrunMonths: number | null;
  timeOverrunProbability: number | null;
  riskScore: number | null; // Sanitized to 0-100
  riskCategory: "CRITICAL" | "HIGH" | "MODERATE" | "LOW" | null;
  topRiskFactors: string | null;
  shapValues: string | null;
  createdAt: string;
}

/**
 * Sanitizes and validates a numeric risk score into the [0, 100] interval.
 * Returns null if the value is missing or not a valid number.
 */
function sanitizeRiskScore(rawScore: number | null | undefined): number | null {
  if (typeof rawScore !== "number" || isNaN(rawScore)) {
    return null;
  }
  if (rawScore < 0 || rawScore > 100) {
    console.warn(`DATA INTEGRITY WARNING: Out-of-bounds riskScore (${rawScore}) detected. Clamping to [0, 100].`);
    return Math.min(100, Math.max(0, rawScore));
  }
  return Number(rawScore.toFixed(1));
}

/**
 * Sanitizes and normalizes a risk category string.
 */
function sanitizeRiskCategory(rawCategory: string | null | undefined): "CRITICAL" | "HIGH" | "MODERATE" | "LOW" | null {
  if (!rawCategory) return null;
  const upper = rawCategory.trim().toUpperCase();
  if (upper === "CRITICAL" || upper === "HIGH" || upper === "MODERATE" || upper === "LOW") {
    return upper;
  }
  console.warn(`DATA INTEGRITY WARNING: Unrecognized risk category: "${rawCategory}"`);
  return null;
}

/**
 * Resolves the CURRENT PREDICTION for a specific project.
 * Definition: The latest valid prediction record for the project ordered by createdAt DESC.
 * Strict Provenance: CURRENT_MODEL_OUTPUT.
 */
export async function getCurrentPredictionForProject(projectIdOrId: string): Promise<CurrentPrediction | null> {
  try {
    const raw = await prisma.prediction.findFirst({
      where: {
        OR: [{ projectId: projectIdOrId }, { project: { id: projectIdOrId } }],
      },
      orderBy: { createdAt: "desc" },
    });

    if (!raw) return null;

    return {
      id: raw.id,
      projectId: raw.projectId,
      predictionDate: raw.predictionDate.toISOString(),
      modelVersion: raw.modelVersion,
      predictedCostOverrunPercent: raw.predictedCostOverrunPercent,
      costOverrunProbability: raw.costOverrunProbability,
      predictedTimeOverrunMonths: raw.predictedTimeOverrunMonths,
      timeOverrunProbability: raw.timeOverrunProbability,
      riskScore: sanitizeRiskScore(raw.riskScore),
      riskCategory: sanitizeRiskCategory(raw.riskCategory),
      topRiskFactors: raw.topRiskFactors,
      shapValues: raw.shapValues,
      createdAt: raw.createdAt.toISOString(),
    };
  } catch (error) {
    console.error(`Error resolving current prediction for project ${projectIdOrId}:`, error);
    return null;
  }
}

/**
 * Resolves all current predictions across the entire portfolio in a single pass.
 * Returns a Map keyed by projectId mapping to the latest valid prediction.
 *
 * Performance / Scalability note:
 * Retrieves prediction rows ordered by createdAt DESC and selects the first occurrence of each projectId.
 * In a future PostgreSQL migration, this can be offloaded to a `DISTINCT ON (project_id) ... ORDER BY project_id, created_at DESC`
 * or a materialized `current_predictions` view.
 */
export async function getAllCurrentPredictionsMap(): Promise<Map<string, CurrentPrediction>> {
  const map = new Map<string, CurrentPrediction>();

  try {
    const allPredictions = await prisma.prediction.findMany({
      orderBy: { createdAt: "desc" },
    });

    for (const raw of allPredictions) {
      if (!map.has(raw.projectId)) {
        map.set(raw.projectId, {
          id: raw.id,
          projectId: raw.projectId,
          predictionDate: raw.predictionDate.toISOString(),
          modelVersion: raw.modelVersion,
          predictedCostOverrunPercent: raw.predictedCostOverrunPercent,
          costOverrunProbability: raw.costOverrunProbability,
          predictedTimeOverrunMonths: raw.predictedTimeOverrunMonths,
          timeOverrunProbability: raw.timeOverrunProbability,
          riskScore: sanitizeRiskScore(raw.riskScore),
          riskCategory: sanitizeRiskCategory(raw.riskCategory),
          topRiskFactors: raw.topRiskFactors,
          shapValues: raw.shapValues,
          createdAt: raw.createdAt.toISOString(),
        });
      }
    }
  } catch (error) {
    console.error("Error generating portfolio current predictions map:", error);
  }

  return map;
}

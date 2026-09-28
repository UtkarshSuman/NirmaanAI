import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";

export interface DatasetFreshness {
  databaseSource: string;
  latestProjectUpdate: string | null;
  latestAlertTimestamp: string | null;
  latestPredictionTimestamp: string | null;
  modelArtifactTimestamp: string | null;
  datasetCoverage: string;
  systemStatus: "Available" | "Degraded" | "Unavailable";
  statusDescription: string;
}

let cachedFreshness: DatasetFreshness | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

/**
 * Resolves verified data freshness timestamps from actual database records and filesystem artifacts.
 * Strictly adheres to Phase 6 & 7: Never invents timestamps.
 */
export async function getDatasetFreshness(): Promise<DatasetFreshness> {
  if (cachedFreshness && Date.now() - lastCacheTime < CACHE_TTL_MS) {
    return cachedFreshness;
  }

  let latestProjectUpdate: string | null = null;
  let latestAlertTimestamp: string | null = null;
  let latestPredictionTimestamp: string | null = null;
  let modelArtifactTimestamp: string | null = null;
  let isDbAvailable = false;

  try {
    const [latestProject, latestAlert, latestPrediction] = await Promise.all([
      prisma.project.findMany({
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: { updatedAt: true },
      }),
      prisma.alert.findMany({
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      }),
      prisma.prediction.findMany({
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      }),
    ]);

    isDbAvailable = true;

    if (latestProject[0]?.updatedAt) {
      latestProjectUpdate = latestProject[0].updatedAt.toISOString();
    }
    if (latestAlert[0]?.createdAt) {
      latestAlertTimestamp = latestAlert[0].createdAt.toISOString();
    }
    if (latestPrediction[0]?.createdAt) {
      latestPredictionTimestamp = latestPrediction[0].createdAt.toISOString();
    }
  } catch (error) {
    console.error("DATA ACCESS ERROR: Failed to resolve database freshness timestamps:", error);
    isDbAvailable = false;
  }

  try {
    const modelArtifactPath = path.resolve(process.cwd(), "..", "ml-service", "data", "models", "training_results.json");
    if (fs.existsSync(modelArtifactPath)) {
      const stats = fs.statSync(modelArtifactPath);
      modelArtifactTimestamp = stats.mtime.toISOString();
    }
  } catch (error) {
    console.warn("Could not read training_results.json filesystem metadata:", error);
  }

  let systemStatus: "Available" | "Degraded" | "Unavailable" = "Available";
  let statusDescription = "Current portfolio dataset synchronized";

  if (!isDbAvailable) {
    systemStatus = "Unavailable";
    statusDescription = "Primary infrastructure database unreachable";
  } else if (!modelArtifactTimestamp) {
    systemStatus = "Degraded";
    statusDescription = "Database active; ML evaluation artifacts unlinked";
  }

  // Resolve dynamic project count from the database
  let projectCount: number | null = null;
  if (isDbAvailable) {
    try {
      projectCount = await prisma.project.count();
    } catch {
      // Non-critical — coverage string will fall back to a generic label
    }
  }

  const datasetCoverage = projectCount !== null
    ? `${projectCount.toLocaleString("en-IN")} Central Sector Infrastructure Projects (≥ ₹150 Cr) — Current portfolio dataset`
    : "Central Sector Infrastructure Projects (≥ ₹150 Cr) — Current portfolio dataset";

  const freshness: DatasetFreshness = {
    databaseSource: "Local SQLite Repository (Prisma dev.db)",
    latestProjectUpdate,
    latestAlertTimestamp,
    latestPredictionTimestamp,
    modelArtifactTimestamp,
    datasetCoverage,
    systemStatus,
    statusDescription,
  };

  cachedFreshness = freshness;
  lastCacheTime = Date.now();

  return freshness;
}

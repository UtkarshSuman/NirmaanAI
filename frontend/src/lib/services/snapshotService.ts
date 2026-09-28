import fs from "fs";
import path from "path";
import type { SnapshotRecord } from "@/components/charts/SnapshotTrendChart";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? "http://127.0.0.1:8000";

/**
 * Retrieves chronological monthly snapshots for a given project.
 * Uses ML service endpoint with automatic fallback to data/raw/project_snapshots.csv.
 */
export async function getProjectSnapshots(projectId: string): Promise<SnapshotRecord[]> {
  // 1. Try ML Service
  try {
    const res = await fetch(`${ML_SERVICE_URL}/ml/data/snapshots/${encodeURIComponent(projectId)}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.snapshots) && data.snapshots.length > 0) {
        return data.snapshots;
      }
    }
  } catch {
    // Graceful fallback to local file parse
  }

  // 2. Direct CSV Fallback
  try {
    const csvPath = path.resolve(process.cwd(), "..", "data", "raw", "project_snapshots.csv");
    if (fs.existsSync(csvPath)) {
      const fileStream = fs.readFileSync(csvPath, "utf-8");
      const lines = fileStream.split(/\r?\n/);
      if (lines.length > 1) {
        const header = lines[0].split(",");
        const pidIdx = header.indexOf("project_id");
        const dateIdx = header.indexOf("snapshot_date");
        const revCostIdx = header.indexOf("revised_cost_crore");
        const expIdx = header.indexOf("cumulative_expenditure_crore");
        const physIdx = header.indexOf("physical_progress_percent");
        const finIdx = header.indexOf("financial_progress_percent");
        const costOvIdx = header.indexOf("cost_overrun_percent");
        const timeOvIdx = header.indexOf("time_overrun_months");

        const records: SnapshotRecord[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          if (line.startsWith(projectId + ",")) {
            const cols = line.split(",");
            records.push({
              snapshot_date: cols[dateIdx],
              revised_cost_crore: parseFloat(cols[revCostIdx]) || 0,
              cumulative_expenditure_crore: parseFloat(cols[expIdx]) || 0,
              physical_progress_percent: parseFloat(cols[physIdx]) || 0,
              financial_progress_percent: parseFloat(cols[finIdx]) || 0,
              cost_overrun_percent: parseFloat(cols[costOvIdx]) || 0,
              time_overrun_months: parseInt(cols[timeOvIdx], 10) || 0,
            });
          }
        }

        records.sort((a, b) => new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime());
        return records;
      }
    }
  } catch (err) {
    console.error(`Error loading fallback snapshots for ${projectId}:`, err);
  }

  return [];
}

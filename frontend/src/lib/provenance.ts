/**
 * NIRMAAN AI — Data Provenance & Algorithm Configuration
 *
 * Every user-visible value in the system must be classified into exactly one
 * provenance category:
 *
 * 1. LIVE_DATABASE: Direct query from Prisma / SQLite database (e.g., project count, costs).
 * 2. CURRENT_API: Aggregated runtime response derived from current database state.
 * 3. CURRENT_MODEL_OUTPUT: Prediction produced by the ML model for a specific project.
 * 4. MODEL_ARTIFACT_EVALUATION: Historical performance metrics stored in training_results.json.
 * 5. STATIC_BENCHMARK: Documented external or heuristic baselines for comparative evaluation.
 * 6. ALGORITHM_CONFIGURATION: Intentionally documented, deterministic algorithmic parameters.
 * 7. VISUALIZATION_GEOMETRY: Fixed geographic boundary coordinates (e.g., India GeoJSON / SVG paths).
 * 8. UI_CONSTANT: Navigation labels, taxonomy names, and route paths.
 * 9. TEXT_CONTENT: Explanatory policy descriptions and statutory guidance.
 * 10. UNAVAILABLE: State rendered when data does not exist or cannot be retrieved.
 */

export type ProvenanceCategory =
  | "LIVE_DATABASE"
  | "CURRENT_API"
  | "CURRENT_MODEL_OUTPUT"
  | "MODEL_ARTIFACT_EVALUATION"
  | "STATIC_BENCHMARK"
  | "ALGORITHM_CONFIGURATION"
  | "VISUALIZATION_GEOMETRY"
  | "UI_CONSTANT"
  | "TEXT_CONTENT"
  | "UNAVAILABLE";

export interface ProvenanceValue<T> {
  value: T;
  provenance: ProvenanceCategory;
  sourceDescription: string;
  updatedAt?: string | null;
}

/**
 * ALGORITHM CONFIGURATION: Composite Priority Score Weights
 *
 * The Composite Priority Score (0-100) ranks active infrastructure projects
 * for Cabinet / PMU escalation. It is a deterministic multi-criteria index:
 *
 * - WEIGHT_RISK (35%): ML-predicted composite risk index from the latest prediction.
 * - WEIGHT_COST_OVERRUN (25%): Observed cost escalation percentage normalized to 0-100.
 * - WEIGHT_DELAY (20%): Observed schedule slippage normalized to a 36-month horizon.
 * - WEIGHT_OUTLAY (10%): Capital outlay exposure normalized to ₹10,000 Crore.
 * - WEIGHT_ALERTS (10%): Unacknowledged early warning alerts (Critical = 50 pts, High = 25 pts).
 */
export const COMPOSITE_PRIORITY_WEIGHTS = {
  WEIGHT_RISK: 0.35,
  WEIGHT_COST_OVERRUN: 0.25,
  WEIGHT_DELAY: 0.20,
  WEIGHT_OUTLAY: 0.10,
  WEIGHT_ALERTS: 0.10,
} as const;

/**
 * STATUTORY MANDATE: MoSPI Central Sector Threshold
 * Only projects costing ₹150 Crore and above are monitored under Central Sector guidelines.
 */
export const STATUTORY_PROJECT_THRESHOLD_CRORE = 150;

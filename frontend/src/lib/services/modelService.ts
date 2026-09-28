import fs from "fs";
import path from "path";
import type { ModelMetricsResponse } from "@/lib/types";

export interface ModelBenchmarkEntry {
  model: string;
  type: string;
  f1: number | null;
  precision: number | null;
  recall: number | null;
  auc: number | null;
  isBest?: boolean;
}

export interface ModelEvaluationPayload {
  hasArtifact: boolean;
  artifactPath: string;
  raw: ModelMetricsResponse | null;
  costEnsembleF1: string | null;
  timeEnsembleF1: string | null;
  costBenchmarks: ModelBenchmarkEntry[];
  timeBenchmarks: ModelBenchmarkEntry[];
  timeRegressorRmseMonths: number | null;
  costRegressorRmsePercent: number | null;
}

/**
 * Reads and validates genuine model evaluation metrics from training_results.json.
 * Strict Provenance: MODEL_ARTIFACT_EVALUATION.
 * Never invents or substitutes default fallback numbers.
 */
export function getModelEvaluationArtifacts(): ModelEvaluationPayload {
  const artifactRelativePath = "ml-service/data/models/training_results.json";
  const resultsPath = path.resolve(process.cwd(), "..", "ml-service", "data", "models", "training_results.json");

  let raw: ModelMetricsResponse | null = null;
  let hasArtifact = false;

  try {
    if (fs.existsSync(resultsPath)) {
      raw = JSON.parse(fs.readFileSync(resultsPath, "utf-8"));
      hasArtifact = true;
    }
  } catch (err) {
    console.warn("Could not read training_results.json:", err);
  }

  const costBenchmarks: ModelBenchmarkEntry[] = [
    {
      model: "Rule-Based Baseline (Legacy Heuristic)",
      type: "Conventional Decision Threshold",
      f1: raw?.baselines?.rule_based?.f1_score ?? null,
      precision: raw?.baselines?.rule_based?.precision ?? null,
      recall: raw?.baselines?.rule_based?.recall ?? null,
      auc: raw?.baselines?.rule_based?.auc_roc ?? null,
    },
    {
      model: "Logistic Regression (Linear Classifier)",
      type: "Linear Statistical Baseline",
      f1: raw?.baselines?.logistic_regression?.f1_score ?? null,
      precision: raw?.baselines?.logistic_regression?.precision ?? null,
      recall: raw?.baselines?.logistic_regression?.recall ?? null,
      auc: raw?.baselines?.logistic_regression?.auc_roc ?? null,
    },
    {
      model: "Decision Tree (CART Classifier)",
      type: "Single-Tree Baseline",
      f1: raw?.baselines?.decision_tree?.f1_score ?? null,
      precision: raw?.baselines?.decision_tree?.precision ?? null,
      recall: raw?.baselines?.decision_tree?.recall ?? null,
      auc: raw?.baselines?.decision_tree?.auc_roc ?? null,
    },
    {
      model: "Random Forest Classifier",
      type: "Bagging Ensemble (100 Trees)",
      f1: raw?.cost_overrun?.random_forest?.f1_score ?? null,
      precision: raw?.cost_overrun?.random_forest?.precision ?? null,
      recall: raw?.cost_overrun?.random_forest?.recall ?? null,
      auc: raw?.cost_overrun?.random_forest?.auc_roc ?? null,
    },
    {
      model: "LightGBM Gradient Boosting",
      type: "Histogram Gradient Boosting",
      f1: raw?.cost_overrun?.lightgbm?.f1_score ?? null,
      precision: raw?.cost_overrun?.lightgbm?.precision ?? null,
      recall: raw?.cost_overrun?.lightgbm?.recall ?? null,
      auc: raw?.cost_overrun?.lightgbm?.auc_roc ?? null,
    },
    {
      model: "XGBoost Classifier",
      type: "Extreme Gradient Boosting",
      f1: raw?.cost_overrun?.xgboost?.f1_score ?? null,
      precision: raw?.cost_overrun?.xgboost?.precision ?? null,
      recall: raw?.cost_overrun?.xgboost?.recall ?? null,
      auc: raw?.cost_overrun?.xgboost?.auc_roc ?? null,
    },
    {
      model: "NIRMAAN AI Stacking Meta-Learner",
      type: "Multi-Model Stacking Ensemble",
      f1: raw?.ensemble?.cost_ensemble?.f1_score ?? null,
      precision: raw?.ensemble?.cost_ensemble?.precision ?? null,
      recall: raw?.ensemble?.cost_ensemble?.recall ?? null,
      auc: raw?.ensemble?.cost_ensemble?.auc_roc ?? null,
      isBest: true,
    },
  ];

  const timeBenchmarks: ModelBenchmarkEntry[] = [
    {
      model: "Conventional Heuristic Baseline",
      type: "Zero-Lead Retrospective Threshold",
      f1: null,
      precision: null,
      recall: null,
      auc: null,
    },
    {
      model: "Random Forest Classifier",
      type: "Bagging Ensemble",
      f1: raw?.time_overrun?.random_forest?.f1_score ?? null,
      precision: raw?.time_overrun?.random_forest?.precision ?? null,
      recall: raw?.time_overrun?.random_forest?.recall ?? null,
      auc: raw?.time_overrun?.random_forest?.auc_roc ?? null,
    },
    {
      model: "LightGBM Classifier",
      type: "Boosting Ensemble",
      f1: raw?.time_overrun?.lightgbm?.f1_score ?? null,
      precision: raw?.time_overrun?.lightgbm?.precision ?? null,
      recall: raw?.time_overrun?.lightgbm?.recall ?? null,
      auc: raw?.time_overrun?.lightgbm?.auc_roc ?? null,
    },
    {
      model: "XGBoost Classifier",
      type: "Boosting Ensemble",
      f1: raw?.time_overrun?.xgboost?.f1_score ?? null,
      precision: raw?.time_overrun?.xgboost?.precision ?? null,
      recall: raw?.time_overrun?.xgboost?.recall ?? null,
      auc: raw?.time_overrun?.xgboost?.auc_roc ?? null,
    },
    {
      model: "NIRMAAN AI Time Stacking Ensemble",
      type: "Multi-Model Stacking Ensemble",
      f1: raw?.ensemble?.time_ensemble?.f1_score ?? null,
      precision: raw?.ensemble?.time_ensemble?.precision ?? null,
      recall: raw?.ensemble?.time_ensemble?.recall ?? null,
      auc: raw?.ensemble?.time_ensemble?.auc_roc ?? null,
      isBest: true,
    },
  ];

  return {
    hasArtifact,
    artifactPath: artifactRelativePath,
    raw,
    costEnsembleF1: raw?.ensemble?.cost_ensemble?.f1_score
      ? (raw.ensemble.cost_ensemble.f1_score * 100).toFixed(1) + "%"
      : null,
    timeEnsembleF1: raw?.ensemble?.time_ensemble?.f1_score
      ? (raw.ensemble.time_ensemble.f1_score * 100).toFixed(1) + "%"
      : null,
    costBenchmarks,
    timeBenchmarks,
    timeRegressorRmseMonths: raw?.time_overrun?.xgboost_regressor?.rmse ?? null,
    costRegressorRmsePercent: raw?.cost_overrun?.xgboost_regressor?.rmse ?? null,
  };
}

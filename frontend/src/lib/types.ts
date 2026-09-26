export interface ProjectItem {
  id: string;
  projectId: string;
  projectName: string;
  ministryDepartment: string;
  sector: string;
  subSector?: string | null;
  state: string;
  district?: string | null;
  implementingAgency: string;
  originalCostCrore: number;
  revisedCostCrore: number;
  anticipatedCostCrore?: number | null;
  cumulativeExpenditureCrore: number;
  expenditureCurrentYearCrore?: number | null;
  expenditurePreviousYearCrore?: number | null;
  landAcquisitionCostCrore?: number | null;
  originalStartDate?: string | null;
  originalCompletionDate?: string | null;
  revisedCompletionDate?: string | null;
  anticipatedCompletionDate?: string | null;
  yearOfApproval?: number | null;
  physicalProgressPercent: number;
  financialProgressPercent: number;
  milestoneAchievedCount: number;
  milestoneTotalCount: number;
  projectStatus: string;
  costOverrunPercent: number;
  timeOverrunMonths: number;
  reasonForDelay?: string | null;
  costRevisionCount: number;
  scheduleRevisionCount: number;
  lastUpdated?: string | null;
  predictions?: PredictionItem[];
  alerts?: AlertItem[];
}

export interface PredictionItem {
  id: string;
  projectId: string;
  predictionDate: string;
  modelVersion?: string | null;
  predictedCostOverrunPercent?: number | null;
  costOverrunProbability?: number | null;
  predictedTimeOverrunMonths?: number | null;
  timeOverrunProbability?: number | null;
  riskScore?: number | null;
  riskCategory?: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" | string | null;
  topRiskFactors?: string | null; // parsed to array
  shapValues?: string | null; // parsed to obj
}

export interface AlertItem {
  id: string;
  projectId: string;
  alertType: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description?: string | null;
  riskScore?: number | null;
  recommendedAction?: string | null;
  isAcknowledged: boolean;
  acknowledgedAt?: string | null;
  createdAt: string;
  project?: {
    projectName: string;
    ministryDepartment: string;
    state: string;
    sector: string;
  };
}

export interface NationalKpis {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  shelvedProjects: number;
  totalOriginalCostLakhCr: number;
  totalRevisedCostLakhCr: number;
  totalCumulativeExpenditureLakhCr: number;
  totalCostOverrunLakhCr: number;
  averageCostOverrunPercent: number;
  delayedProjectsCount: number;
  delayedProjectsPercent: number;
  averageDelayMonths: number;
  criticalRiskCount: number;
  highRiskCount: number;
  moderateRiskCount: number;
  lowRiskCount: number;
  totalAlertsCount: number;
  unacknowledgedAlertsCount: number;
}

export interface SectorMetric {
  sector: string;
  ministry: string;
  projectCount: number;
  totalCostCrore: number;
  totalExpenditureCrore: number;
  avgCostOverrunPercent: number;
  avgDelayMonths: number;
  avgPhysicalProgress: number;
  highRiskCount: number;
}

export interface ModelMetricsResponse {
  cost_overrun: {
    xgboost: { f1_score: number; precision: number; recall: number; auc_roc: number };
    lightgbm: { f1_score: number; precision: number; recall: number; auc_roc: number };
    random_forest: { f1_score: number; precision: number; recall: number; auc_roc: number };
    xgboost_regressor: { rmse: number; mae: number; r_squared: number };
  };
  time_overrun: {
    xgboost: { f1_score: number; precision: number; recall: number; auc_roc: number };
    lightgbm: { f1_score: number; precision: number; recall: number; auc_roc: number };
    random_forest: { f1_score: number; precision: number; recall: number; auc_roc: number };
    xgboost_regressor: { rmse: number; mae: number; r_squared: number };
  };
  ensemble: {
    cost_ensemble: { f1_score: number; precision: number; recall: number; auc_roc: number; weights: Record<string, number> };
    time_ensemble: { f1_score: number; precision: number; recall: number; auc_roc: number; weights: Record<string, number> };
  };
  baselines: {
    logistic_regression: { f1_score: number; precision: number; recall: number; auc_roc: number };
    decision_tree: { f1_score: number; precision: number; recall: number; auc_roc: number };
    rule_based: { f1_score: number; precision: number; recall: number; auc_roc: number };
  };
}

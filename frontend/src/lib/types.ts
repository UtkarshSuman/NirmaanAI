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

export interface RiskDistribution {
  critical: number;
  high: number;
  moderate: number;
  low: number;
  totalClassified: number;
  unclassified: number;
  totalProjects: number;
  coveragePercent: number;
}

export interface PortfolioMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  shelvedProjects: number;
  ministriesCount: number;
  totalOriginalCostLakhCr: string;
  totalRevisedCostLakhCr: string;
  totalExpLakhCr: string;
  netCostOverrunLakhCr: string;
  netCostEscalationPercent: string;
  avgCostOverrunPercent: number;
  delayedProjectsCount: number;
  delayedProjectsPercent: string;
  avgDelayMonths: number;
  criticalAlertsCount: number;
  totalAlertsCount: number;
  unacknowledgedAlertsCount: number;
  riskDistribution: RiskDistribution;
}

export interface ProjectPriority {
  project: ProjectItem;
  latestPrediction: PredictionItem | null;
  activeAlertsCount: number;
  criticalAlertsCount: number;
  compositePriorityScore: number;
  factorBreakdown: {
    riskComponent: number;
    costOverrunComponent: number;
    delayComponent: number;
    capitalExposureComponent: number;
    alertsComponent: number;
  };
  scoreProvenance: {
    riskScore: number | null;
    source: "CURRENT_MODEL_OUTPUT" | "CATEGORY_HEURISTIC" | "UNAVAILABLE";
    label: string;
  };
}

export interface ModelEvaluation {
  modelName: string;
  modelVersion: string;
  task: string;
  evaluationMethod: string;
  testSetPartition: string;
  featureCount: number;
  artifactPath: string;
  artifactStatus: "AVAILABLE" | "MISSING" | "INVALID";
  evaluationDate: string;
  metrics: {
    f1_score: number | null;
    precision: number | null;
    recall: number | null;
    auc_roc: number | null;
  };
  relativeGainOverBaselinePercent: number | null;
}

export interface ProjectPrediction {
  id: string;
  projectId: string;
  predictionDate: string;
  modelVersion: string | null;
  predictedCostOverrunPercent: number | null;
  costOverrunProbability: number | null;
  predictedTimeOverrunMonths: number | null;
  timeOverrunProbability: number | null;
  riskScore: number | null;
  riskCategory: "CRITICAL" | "HIGH" | "MODERATE" | "LOW" | null;
  topRiskFactors: string | null;
  shapValues: string | null;
  createdAt: string;
}

export interface AlertSummary {
  totalAlerts: number;
  criticalAlerts: number;
  unacknowledgedAlerts: number;
  acknowledgedAlerts: number;
}

export interface StateAggregation {
  state: string;
  stateHindi: string;
  region: string;
  capital: string;
  projectCount: number;
  originalCostCrore: number;
  revisedCostCrore: number;
  cumulativeExpenditureCrore: number;
  netEscalationCrore: number;
  avgCostOverrunPercent: number;
  avgDelayMonths: number;
  avgPhysicalProgressPercent: number;
  avgFinancialProgressPercent: number;
  delayedProjectsCount: number;
  delayedProjectsPercent: number;
  criticalProjectsCount: number;
  riskTier: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  topProjects: any[];
}

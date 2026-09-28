# PAIMANA AI — API Documentation

> **REST API Specification for All Backend Services**

---

## 1. Overview

The PAIMANA AI system exposes two API surfaces:

| Service | Base URL | Technology | Purpose |
|---------|----------|-----------|---------|
| **Data API** | `http://localhost:3000/api` | Next.js API Routes | CRUD, dashboards, auth |
| **ML API** | `http://localhost:8000/ml` | FastAPI | Predictions, training, LLM |

---

## 2. Data API (Next.js)

### 2.1 Projects

#### `GET /api/projects`
List projects with filtering, sorting, and pagination.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `limit` | int | 20 | Items per page (max 100) |
| `sector` | string | - | Filter by sector |
| `ministry` | string | - | Filter by ministry |
| `status` | string | - | Filter by project status |
| `risk_level` | string | - | Filter by risk category (low/moderate/high/critical) |
| `state` | string | - | Filter by state |
| `search` | string | - | Search in project name/ID |
| `sort_by` | string | `risk_score` | Sort field |
| `sort_order` | string | `desc` | Sort direction (asc/desc) |
| `min_cost` | number | - | Minimum original cost (crore) |
| `max_cost` | number | - | Maximum original cost (crore) |

**Response:**
```json
{
  "data": [
    {
      "project_id": "PRJ-NH-001",
      "project_name": "Delhi-Mumbai Expressway Phase III",
      "sector": "National Highways",
      "ministry_department": "Ministry of Road Transport & Highways",
      "state": "Maharashtra",
      "original_cost_crore": 12500.00,
      "revised_cost_crore": 14200.00,
      "cumulative_expenditure_crore": 8750.00,
      "physical_progress_percent": 62.5,
      "project_status": "Under Implementation",
      "risk_score": 67.3,
      "risk_category": "High",
      "cost_overrun_percent": 13.6,
      "time_overrun_months": 18
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1981,
    "total_pages": 100
  }
}
```

---

#### `GET /api/projects/:id`
Get detailed project information with latest prediction.

**Response:**
```json
{
  "project": {
    "project_id": "PRJ-NH-001",
    "project_name": "Delhi-Mumbai Expressway Phase III",
    "ministry_department": "Ministry of Road Transport & Highways",
    "sector": "National Highways",
    "sub_sector": "Expressway",
    "state": "Maharashtra",
    "district": "Pune",
    "implementing_agency": "NHAI",
    "original_cost_crore": 12500.00,
    "revised_cost_crore": 14200.00,
    "anticipated_cost_crore": 15000.00,
    "cumulative_expenditure_crore": 8750.00,
    "expenditure_current_year_crore": 2100.00,
    "expenditure_previous_year_crore": 1800.00,
    "land_acquisition_cost_crore": 1250.00,
    "original_start_date": "2019-04-01",
    "original_completion_date": "2023-03-31",
    "revised_completion_date": "2025-09-30",
    "anticipated_completion_date": "2026-03-31",
    "year_of_approval": 2018,
    "physical_progress_percent": 62.5,
    "financial_progress_percent": 61.6,
    "milestone_achieved_count": 8,
    "milestone_total_count": 14,
    "project_status": "Under Implementation",
    "cost_overrun_percent": 13.6,
    "time_overrun_months": 18,
    "reason_for_delay": "Land acquisition delays in Raigad district; Contractor mobilization issues"
  },
  "prediction": {
    "risk_score": 67.3,
    "risk_category": "High",
    "cost_overrun_probability": 0.78,
    "predicted_cost_overrun_percent": 20.0,
    "time_overrun_probability": 0.82,
    "predicted_time_overrun_months": 24,
    "risk_components": {
      "cost_risk": 72.5,
      "time_risk": 78.2,
      "milestone_risk": 55.0,
      "sector_risk": 42.0,
      "agency_risk": 35.0
    },
    "top_risk_factors": [
      {
        "feature": "cost_revision_ratio",
        "impact": 0.15,
        "direction": "increases risk",
        "explanation": "Cost has been revised upward by 13.6% from original estimate"
      },
      {
        "feature": "progress_stagnation_months",
        "impact": 0.12,
        "direction": "increases risk",
        "explanation": "3 months of progress stagnation detected"
      }
    ],
    "model_version": "v1.2.0",
    "prediction_date": "2026-09-26T10:00:00Z"
  },
  "historical_snapshots": [
    {
      "snapshot_date": "2024-01-01",
      "cumulative_expenditure_crore": 5200.00,
      "physical_progress_percent": 42.0,
      "cost_overrun_percent": 8.5,
      "risk_score": 52.0
    }
  ]
}
```

---

#### `POST /api/projects/upload`
Upload CUF data file (CSV/Excel).

**Request:** `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| `file` | File | CSV or Excel file |
| `update_type` | string | `full_refresh` or `incremental` |

**Response:**
```json
{
  "status": "success",
  "records_processed": 1981,
  "records_created": 45,
  "records_updated": 1936,
  "errors": [],
  "processing_time_ms": 3200
}
```

---

### 2.2 Dashboard

#### `GET /api/dashboard/overview`
National overview metrics.

**Response:**
```json
{
  "total_projects": 1981,
  "total_original_cost_lakh_crore": 37.13,
  "total_revised_cost_lakh_crore": 42.78,
  "total_expenditure_lakh_crore": 20.36,
  "projects_with_cost_overrun": 842,
  "projects_with_time_overrun": 891,
  "average_cost_overrun_percent": 15.2,
  "average_time_overrun_months": 32,
  "risk_distribution": {
    "critical": 187,
    "high": 342,
    "moderate": 621,
    "low": 831
  },
  "sector_distribution": [
    { "sector": "Railways", "count": 312, "total_cost_crore": 825000 },
    { "sector": "National Highways", "count": 287, "total_cost_crore": 612000 }
  ],
  "monthly_trend": [
    { "month": "2026-03", "avg_risk_score": 45.2, "new_alerts": 23 },
    { "month": "2026-04", "avg_risk_score": 44.8, "new_alerts": 19 }
  ]
}
```

---

#### `GET /api/dashboard/sector-summary`
Sector-wise summary with KPIs.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `ministry` | string | Filter by ministry (optional) |

**Response:**
```json
{
  "sectors": [
    {
      "sector": "Railways",
      "ministry": "Ministry of Railways",
      "total_projects": 312,
      "total_cost_crore": 825000,
      "total_expenditure_crore": 412000,
      "avg_cost_overrun_percent": 22.3,
      "avg_time_overrun_months": 30,
      "avg_risk_score": 52.1,
      "completion_rate": 0.35,
      "projects_at_risk": 156,
      "trend": "worsening"
    }
  ]
}
```

---

### 2.3 Alerts

#### `GET /api/alerts`
List alerts with filtering.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `severity` | string | critical/high/moderate/low |
| `acknowledged` | boolean | Filter by acknowledgment status |
| `sector` | string | Filter by sector |
| `limit` | int | Number of alerts (default 50) |

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert-uuid-001",
      "project_id": "PRJ-NH-001",
      "project_name": "Delhi-Mumbai Expressway Phase III",
      "alert_type": "COST_OVERRUN_RISK",
      "severity": "high",
      "title": "Cost overrun risk elevated to 78%",
      "description": "Project shows 78% probability of cost overrun exceeding 20%. Top contributing factors: land acquisition delays, cost revision acceleration.",
      "risk_score": 67.3,
      "recommended_action": "Review land acquisition status; Assess contractor performance; Consider cost revision approval timeline",
      "is_acknowledged": false,
      "created_at": "2026-09-25T14:30:00Z"
    }
  ],
  "summary": {
    "total": 529,
    "critical": 87,
    "high": 142,
    "moderate": 210,
    "low": 90,
    "unacknowledged": 312
  }
}
```

---

#### `PATCH /api/alerts/:id/acknowledge`
Acknowledge an alert.

**Request Body:**
```json
{
  "acknowledged_by": "user-uuid",
  "notes": "Reviewed and escalated to project director"
}
```

---

### 2.4 Analytics

#### `GET /api/analytics/cost-overrun`
Cost overrun analytics data.

**Response:**
```json
{
  "sector_comparison": [
    { "sector": "Railways", "avg_overrun": 22.3, "median_overrun": 18.0, "max_overrun": 85.2 }
  ],
  "distribution": {
    "bins": ["0-5%", "5-10%", "10-20%", "20-50%", "50%+"],
    "counts": [312, 245, 198, 156, 89]
  },
  "top_drivers": [
    { "factor": "Land acquisition delays", "impact_score": 0.23 },
    { "factor": "Regulatory approvals", "impact_score": 0.18 }
  ],
  "trend": [
    { "year": 2020, "avg_cost_overrun": 12.5 },
    { "year": 2021, "avg_cost_overrun": 14.2 }
  ]
}
```

#### `GET /api/analytics/time-overrun`
Time overrun analytics data. (Similar structure to cost-overrun)

#### `GET /api/analytics/benchmarking`
Benchmarking and comparative analytics.

**Response:**
```json
{
  "sector_benchmarks": [
    {
      "sector": "National Highways",
      "avg_completion_time_months": 48,
      "avg_cost_per_km_crore": 18.5,
      "on_time_completion_rate": 0.42,
      "on_budget_completion_rate": 0.38,
      "efficiency_score": 65.2
    }
  ],
  "ministry_performance": [
    {
      "ministry": "Ministry of Railways",
      "total_projects": 312,
      "on_time_rate": 0.35,
      "on_budget_rate": 0.40,
      "avg_risk_score": 52.1
    }
  ],
  "agency_rankings": [
    {
      "agency": "NHAI",
      "project_count": 185,
      "success_rate": 0.62,
      "avg_overrun": 12.3,
      "rank": 1
    }
  ]
}
```

---

## 3. ML API (FastAPI)

### 3.1 Predictions

#### `POST /ml/predict`
Generate prediction for a single project.

**Request Body:**
```json
{
  "project_id": "PRJ-NH-001"
}
```

**Response:**
```json
{
  "project_id": "PRJ-NH-001",
  "predictions": {
    "cost_overrun": {
      "will_overrun": true,
      "probability": 0.78,
      "predicted_percentage": 20.0,
      "confidence_interval": [15.2, 24.8],
      "model_used": "ensemble_v1.2"
    },
    "time_overrun": {
      "will_overrun": true,
      "probability": 0.82,
      "predicted_months": 24,
      "confidence_interval": [18, 30],
      "model_used": "ensemble_v1.2"
    },
    "risk_score": {
      "total": 67.3,
      "category": "High",
      "components": {
        "cost_risk": 72.5,
        "time_risk": 78.2,
        "milestone_risk": 55.0,
        "sector_risk": 42.0,
        "agency_risk": 35.0
      }
    }
  },
  "generated_at": "2026-09-26T10:00:00Z"
}
```

---

#### `POST /ml/predict/batch`
Batch prediction for multiple/all projects.

**Request Body:**
```json
{
  "project_ids": ["PRJ-NH-001", "PRJ-RW-015"],  // or omit for all
  "save_to_db": true
}
```

---

#### `GET /ml/explain/:project_id`
Get SHAP explainability for a prediction.

**Response:**
```json
{
  "project_id": "PRJ-NH-001",
  "model_type": "xgboost_cost_overrun",
  "base_value": 0.42,
  "predicted_value": 0.78,
  "shap_values": {
    "cost_revision_ratio": 0.15,
    "progress_stagnation_months": 0.12,
    "expenditure_ratio": -0.05,
    "sector_avg_cost_overrun": 0.08,
    "milestone_completion_rate": 0.06
  },
  "top_risk_factors": [
    {
      "feature": "cost_revision_ratio",
      "shap_value": 0.15,
      "feature_value": 1.136,
      "direction": "increases risk",
      "explanation": "Cost has been revised upward by 13.6% from original estimate",
      "recommendation": "Review cost estimation methodology; Conduct independent cost audit"
    }
  ],
  "waterfall_chart_data": {
    "features": ["base", "cost_revision_ratio", "progress_stagnation", "..."],
    "values": [0.42, 0.15, 0.12, "..."],
    "cumulative": [0.42, 0.57, 0.69, "..."]
  }
}
```

---

#### `GET /ml/feature-importance`
Global feature importance across all models.

**Response:**
```json
{
  "cost_overrun_model": [
    { "feature": "cost_revision_ratio", "importance": 0.142, "rank": 1 },
    { "feature": "expenditure_rate", "importance": 0.118, "rank": 2 },
    { "feature": "sector_avg_cost_overrun", "importance": 0.095, "rank": 3 }
  ],
  "time_overrun_model": [
    { "feature": "elapsed_ratio", "importance": 0.135, "rank": 1 },
    { "feature": "milestone_completion_rate", "importance": 0.121, "rank": 2 }
  ]
}
```

---

### 3.2 Model Management

#### `POST /ml/train`
Trigger model training pipeline.

**Request Body:**
```json
{
  "models": ["xgboost", "lightgbm", "random_forest", "lstm"],
  "targets": ["cost_overrun", "time_overrun"],
  "optuna_trials": 100,
  "cross_validation_folds": 5
}
```

---

#### `GET /ml/model-metrics`
Get current model performance metrics.

**Response:**
```json
{
  "models": {
    "ensemble_cost_overrun": {
      "version": "v1.2.0",
      "metrics": {
        "f1_score": 0.89,
        "precision": 0.87,
        "recall": 0.91,
        "auc_roc": 0.94,
        "rmse": 6.2,
        "mae": 4.8,
        "r_squared": 0.82
      },
      "trained_at": "2026-09-25T08:00:00Z",
      "training_samples": 1387,
      "test_samples": 297
    },
    "ensemble_time_overrun": {
      "version": "v1.2.0",
      "metrics": {
        "f1_score": 0.85,
        "precision": 0.83,
        "recall": 0.87,
        "auc_roc": 0.91,
        "rmse": 5.5,
        "mae": 4.2
      }
    }
  },
  "comparison_with_baselines": {
    "rule_based": { "f1": 0.61 },
    "logistic_regression": { "f1": 0.68 },
    "decision_tree": { "f1": 0.72 },
    "our_ensemble": { "f1": 0.89 }
  }
}
```

---

### 3.3 LLM Assistant

#### `POST /ml/assistant/chat`
Send a message to the LLM assistant.

**Request Body:**
```json
{
  "message": "Which railway projects are most at risk of cost overrun?",
  "conversation_id": "conv-uuid-001",
  "stream": true
}
```

**Response (SSE stream):**
```
data: {"type": "token", "content": "Based"}
data: {"type": "token", "content": " on"}
data: {"type": "token", "content": " my"}
data: {"type": "token", "content": " analysis"}
...
data: {"type": "complete", "content": "Based on my analysis of 312 railway projects...", "sources": ["PRJ-RW-001", "PRJ-RW-015"]}
```

---

### 3.4 Risk Scores

#### `GET /ml/risk-scores`
Get risk scores for all projects (for heatmap/overview).

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `sector` | string | Filter by sector |
| `state` | string | Filter by state |
| `min_score` | number | Minimum risk score |

**Response:**
```json
{
  "risk_scores": [
    {
      "project_id": "PRJ-NH-001",
      "risk_score": 67.3,
      "risk_category": "High",
      "sector": "National Highways",
      "state": "Maharashtra",
      "lat": 19.076,
      "lng": 72.877
    }
  ],
  "aggregations": {
    "by_state": [
      { "state": "Maharashtra", "avg_risk": 52.1, "project_count": 145 }
    ],
    "by_sector": [
      { "sector": "Railways", "avg_risk": 52.1, "project_count": 312 }
    ]
  }
}
```

---

## 4. Error Handling

All APIs follow a consistent error response format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid sector filter value",
    "details": {
      "field": "sector",
      "provided": "InvalidSector",
      "allowed": ["Railways", "National Highways", "..."]
    }
  },
  "status": 400,
  "timestamp": "2026-09-26T10:00:00Z"
}
```

**Error Codes:**
| Code | HTTP Status | Description |
|------|------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `NOT_FOUND` | 404 | Resource not found |
| `AUTH_REQUIRED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `MODEL_NOT_READY` | 503 | ML model not loaded/trained |
| `PREDICTION_FAILED` | 500 | ML prediction error |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

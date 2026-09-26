"""
PAIMANA AI — FastAPI ML Service
================================
Main application entry point for the ML prediction and analytics API.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import pandas as pd
import numpy as np
import joblib
import json
import shap
from pathlib import Path

app = FastAPI(
    title="PAIMANA AI - ML Service",
    description="AI-Powered Predictive Analytics for Infrastructure Project Monitoring",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── PATHS ──────────────────────────────────────────────────────────────────────

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent  # SIH2 root
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = DATA_DIR / "models"
RAW_DIR = PROJECT_ROOT / "data" / "raw"

# ─── GLOBAL MODEL CACHE ────────────────────────────────────────────────────────

models = {}
feature_engineer = None
scaler = None
projects_df = None
snapshots_df = None


def load_models():
    """Load all trained models and data into memory."""
    global models, feature_engineer, scaler, projects_df, snapshots_df

    try:
        # Load feature engineer
        fe_path = MODEL_DIR / "feature_engineer.pkl"
        if fe_path.exists():
            feature_engineer = joblib.load(fe_path)
            print("  Loaded feature engineer")

        # Load scaler
        scaler_path = MODEL_DIR / "scaler.pkl"
        if scaler_path.exists():
            scaler = joblib.load(scaler_path)
            print("  Loaded scaler")

        # Load ML models
        model_files = {
            'cost_xgboost': 'cost_overrun_xgboost.pkl',
            'cost_lightgbm': 'cost_overrun_lightgbm.pkl',
            'cost_rf': 'cost_overrun_rf.pkl',
            'cost_reg': 'cost_overrun_xgboost_reg.pkl',
            'cost_meta': 'cost_overrun_meta_learner.pkl',
            'time_xgboost': 'time_overrun_xgboost.pkl',
            'time_lightgbm': 'time_overrun_lightgbm.pkl',
            'time_rf': 'time_overrun_rf.pkl',
            'time_reg': 'time_overrun_xgboost_reg.pkl',
            'time_meta': 'time_overrun_meta_learner.pkl',
        }

        for key, filename in model_files.items():
            path = MODEL_DIR / filename
            if path.exists():
                models[key] = joblib.load(path)
                print(f"  Loaded {key}")

        # Load data
        projects_path = RAW_DIR / "projects.csv"
        if projects_path.exists():
            projects_df = pd.read_csv(projects_path)
            print(f"  Loaded {len(projects_df)} projects")

        snapshots_path = RAW_DIR / "project_snapshots.csv"
        if snapshots_path.exists():
            snapshots_df = pd.read_csv(snapshots_path)
            print(f"  Loaded {len(snapshots_df)} snapshots")

        # Load training results
        results_path = MODEL_DIR / "training_results.json"
        if results_path.exists():
            with open(results_path) as f:
                models['training_results'] = json.load(f)
            print("  Loaded training results")

        print(f"\n  Total models loaded: {len(models)}")

    except Exception as e:
        print(f"  Warning: Could not load all models: {e}")


@app.on_event("startup")
async def startup():
    """Load models on startup."""
    print("\nLoading PAIMANA AI models...")
    load_models()
    print("Ready!\n")


# ─── PYDANTIC MODELS ────────────────────────────────────────────────────────────

class PredictionRequest(BaseModel):
    project_id: str

class BatchPredictionRequest(BaseModel):
    project_ids: Optional[List[str]] = None

class CustomProjectInput(BaseModel):
    project_id: Optional[str] = "PRJ-CUSTOM-NEW"
    project_name: str
    sector: str = "National Highways"
    ministry_department: str = "Ministry of Road Transport & Highways"
    state: str = "Maharashtra"
    implementing_agency: str = "NHAI"
    original_cost_crore: float = 1200.0
    revised_cost_crore: float = 1450.0
    cumulative_expenditure_crore: float = 650.0
    physical_progress_percent: float = 45.0
    financial_progress_percent: float = 52.0
    time_overrun_months: Optional[int] = 6
    cost_revision_count: Optional[int] = 1
    schedule_revision_count: Optional[int] = 1
    reason_for_delay: Optional[str] = "Land acquisition"

class PredictionResponse(BaseModel):
    project_id: str
    predictions: Dict[str, Any]
    generated_at: str


# ─── API ENDPOINTS ──────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "service": "PAIMANA AI - ML Service",
        "version": "1.0.0",
        "models_loaded": len(models),
        "status": "ready" if len(models) > 0 else "no models loaded"
    }


@app.get("/ml/health")
async def health():
    return {
        "status": "healthy",
        "models_loaded": list(models.keys()),
        "projects_loaded": len(projects_df) if projects_df is not None else 0,
    }


@app.post("/ml/predict")
async def predict(request: PredictionRequest):
    """Generate predictions for a single project."""
    if projects_df is None or feature_engineer is None:
        raise HTTPException(status_code=503, detail="Models not loaded. Run training pipeline first.")

    project = projects_df[projects_df['project_id'] == request.project_id]
    if len(project) == 0:
        raise HTTPException(status_code=404, detail=f"Project {request.project_id} not found")

    try:
        result = _generate_prediction(project.iloc[0])
        return PredictionResponse(
            project_id=request.project_id,
            predictions=result,
            generated_at=pd.Timestamp.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/ml/predict/custom")
async def predict_custom(data: CustomProjectInput):
    """Analyze a new project submitted on-the-fly (from frontend form, Supabase, or external API)."""
    if feature_engineer is None:
        raise HTTPException(status_code=503, detail="Feature engineering pipeline not initialized")

    try:
        # Convert Pydantic model to dictionary row
        row_dict = data.dict()
        row_dict['cost_overrun_percent'] = (
            ((row_dict['revised_cost_crore'] - row_dict['original_cost_crore']) / row_dict['original_cost_crore']) * 100
            if row_dict['original_cost_crore'] > 0 else 0.0
        )
        row_dict['project_status'] = 'Under Implementation'
        
        # Ensure all required feature fields have robust fallback defaults
        defaults = {
            'original_start_date': '2023-01-01',
            'original_completion_date': '2027-01-01',
            'revised_completion_date': '2028-06-01',
            'last_updated': '2026-03-31',
            'milestone_achieved_count': 4,
            'milestone_total_count': 10,
            'land_acquisition_cost_crore': row_dict.get('original_cost_crore', 1000) * 0.12,
            'expenditure_current_year_crore': 150.0,
            'expenditure_previous_year_crore': 120.0,
            'sub_sector': 'General',
            'district': 'Central',
            'cost_revision_count': 0,
            'schedule_revision_count': 0,
            'time_overrun_months': 0,
            'reason_for_delay': 'None',
        }
        for k, v in defaults.items():
            if k not in row_dict or row_dict[k] is None:
                row_dict[k] = v

        result = _generate_prediction(row_dict)
        return {
            "status": "success",
            "project_id": data.project_id,
            "project_name": data.project_name,
            "analysis": result,
            "analyzed_at": pd.Timestamp.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Custom analysis failed: {str(e)}")


@app.post("/ml/predict/batch")
async def predict_batch(request: BatchPredictionRequest):
    """Generate predictions for multiple projects."""
    if projects_df is None:
        raise HTTPException(status_code=503, detail="Models not loaded")

    if request.project_ids:
        df = projects_df[projects_df['project_id'].isin(request.project_ids)]
    else:
        df = projects_df[projects_df['project_status'] == 'Under Implementation']

    results = []
    for _, row in df.iterrows():
        try:
            pred = _generate_prediction(row)
            results.append({
                'project_id': row['project_id'],
                'predictions': pred
            })
        except Exception:
            continue

    return {
        'predictions': results,
        'total': len(results),
        'generated_at': pd.Timestamp.now().isoformat()
    }


@app.get("/ml/explain/{project_id}")
async def explain(project_id: str):
    """Get SHAP explainability for a project prediction."""
    if projects_df is None or 'cost_xgboost' not in models:
        raise HTTPException(status_code=503, detail="Models not loaded")

    project = projects_df[projects_df['project_id'] == project_id]
    if len(project) == 0:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    try:
        return _generate_explanation(project.iloc[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explanation failed: {str(e)}")


@app.get("/ml/feature-importance")
async def feature_importance():
    """Get global feature importance rankings."""
    if 'cost_xgboost' not in models:
        raise HTTPException(status_code=503, detail="Models not loaded")

    xgb_model = models['cost_xgboost']
    importance = xgb_model.feature_importances_

    feature_names = feature_engineer.get_feature_names()
    # Use only features that exist in the model
    n_features = len(importance)
    feature_names = feature_names[:n_features] if len(feature_names) >= n_features else feature_names

    fi = sorted(
        zip(feature_names, importance.tolist()),
        key=lambda x: x[1], reverse=True
    )

    return {
        'cost_overrun_model': [
            {'feature': f, 'importance': round(imp, 4), 'rank': i+1}
            for i, (f, imp) in enumerate(fi[:20])
        ]
    }


@app.get("/ml/model-metrics")
async def model_metrics():
    """Get current model performance metrics."""
    if 'training_results' not in models:
        raise HTTPException(status_code=503, detail="No training results available")
    return models['training_results']


@app.get("/ml/risk-scores")
async def risk_scores(sector: Optional[str] = None, min_score: Optional[float] = None):
    """Get risk scores for all projects."""
    if projects_df is None:
        raise HTTPException(status_code=503, detail="Data not loaded")

    df = projects_df[projects_df['project_status'] == 'Under Implementation'].copy()

    if sector:
        df = df[df['sector'] == sector]

    # Generate quick risk scores
    scores = []
    for _, row in df.iterrows():
        try:
            pred = _generate_prediction(row)
            score = pred.get('risk_score', {}).get('total', 50)
            if min_score and score < min_score:
                continue
            scores.append({
                'project_id': row['project_id'],
                'project_name': row['project_name'],
                'risk_score': score,
                'risk_category': pred.get('risk_score', {}).get('category', 'Unknown'),
                'sector': row['sector'],
                'state': row['state'],
            })
        except Exception:
            continue

    scores.sort(key=lambda x: x['risk_score'], reverse=True)

    return {
        'risk_scores': scores,
        'total': len(scores),
    }


# ─── DATA ENDPOINTS ────────────────────────────────────────────────────────────

@app.get("/ml/data/projects")
async def get_projects(
    sector: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
):
    """Get project data."""
    if projects_df is None:
        raise HTTPException(status_code=503, detail="Data not loaded")

    df = projects_df.copy()
    if sector:
        df = df[df['sector'] == sector]
    if status:
        df = df[df['project_status'] == status]

    total = len(df)
    df = df.iloc[offset:offset + limit]

    return {
        'projects': df.to_dict(orient='records'),
        'total': total,
        'offset': offset,
        'limit': limit,
    }


@app.get("/ml/data/dashboard")
async def dashboard_overview():
    """National overview dashboard data."""
    if projects_df is None:
        raise HTTPException(status_code=503, detail="Data not loaded")

    df = projects_df

    return {
        'total_projects': int(len(df)),
        'total_original_cost_lakh_crore': round(df['original_cost_crore'].sum() / 100000, 2),
        'total_revised_cost_lakh_crore': round(df['revised_cost_crore'].sum() / 100000, 2),
        'total_expenditure_lakh_crore': round(df['cumulative_expenditure_crore'].sum() / 100000, 2),
        'projects_with_cost_overrun': int((df['cost_overrun_percent'] > 5).sum()),
        'projects_with_time_overrun': int((df['time_overrun_months'] > 6).sum()),
        'average_cost_overrun_percent': round(df['cost_overrun_percent'].mean(), 1),
        'average_time_overrun_months': round(df['time_overrun_months'].mean(), 1),
        'status_distribution': df['project_status'].value_counts().to_dict(),
        'sector_distribution': df.groupby('sector').agg(
            count=('project_id', 'count'),
            total_cost_crore=('revised_cost_crore', 'sum'),
            avg_cost_overrun=('cost_overrun_percent', 'mean'),
        ).reset_index().to_dict(orient='records'),
    }


@app.get("/ml/data/sectors")
async def sector_summary():
    """Sector-wise summary."""
    if projects_df is None:
        raise HTTPException(status_code=503, detail="Data not loaded")

    sectors = projects_df.groupby('sector').agg(
        ministry=('ministry_department', 'first'),
        total_projects=('project_id', 'count'),
        total_cost_crore=('revised_cost_crore', 'sum'),
        total_expenditure_crore=('cumulative_expenditure_crore', 'sum'),
        avg_cost_overrun_percent=('cost_overrun_percent', 'mean'),
        avg_time_overrun_months=('time_overrun_months', 'mean'),
        avg_physical_progress=('physical_progress_percent', 'mean'),
    ).reset_index()

    return {'sectors': sectors.to_dict(orient='records')}


# ─── INTERNAL HELPERS ───────────────────────────────────────────────────────────

def _generate_prediction(project_row) -> Dict[str, Any]:
    """Generate full prediction for a single project."""
    # Create DataFrame from row
    project_df = pd.DataFrame([project_row.to_dict() if hasattr(project_row, 'to_dict') else project_row])

    # Get snapshots for this project
    project_snapshots = None
    if snapshots_df is not None:
        project_snapshots = snapshots_df[snapshots_df['project_id'] == project_row.get('project_id', project_row.get('project_id'))]
        if len(project_snapshots) == 0:
            project_snapshots = None

    # Engineer features
    try:
        features_df = feature_engineer.transform(project_df, project_snapshots)
    except Exception:
        features_df = feature_engineer.transform(project_df)

    feature_names = feature_engineer.get_feature_names()
    available = [f for f in feature_names if f in features_df.columns]
    X = features_df[available].replace([np.inf, -np.inf], np.nan).fillna(0)

    # Scale
    if scaler is not None:
        # Handle mismatch in number of features
        try:
            X_scaled = pd.DataFrame(scaler.transform(X), columns=X.columns, index=X.index)
        except Exception:
            X_scaled = X  # Fallback to unscaled
    else:
        X_scaled = X

    result = {}

    # Cost overrun prediction
    if 'cost_xgboost' in models:
        try:
            xgb_prob = models['cost_xgboost'].predict_proba(X_scaled)[:, 1][0]
            lgb_prob = models['cost_lightgbm'].predict_proba(X_scaled)[:, 1][0] if 'cost_lightgbm' in models else xgb_prob
            rf_prob = models['cost_rf'].predict_proba(X_scaled)[:, 1][0] if 'cost_rf' in models else xgb_prob

            if 'cost_meta' in models:
                stacking = np.array([[xgb_prob, lgb_prob, rf_prob]])
                cost_prob = float(models['cost_meta'].predict_proba(stacking)[:, 1][0])
            else:
                cost_prob = float(0.4 * xgb_prob + 0.35 * lgb_prob + 0.25 * rf_prob)

            cost_pct = float(models['cost_reg'].predict(X_scaled)[0]) if 'cost_reg' in models else 0.0

            result['cost_overrun'] = {
                'will_overrun': bool(cost_prob >= 0.5),
                'probability': round(cost_prob, 4),
                'predicted_percentage': round(max(0, cost_pct), 1),
                'model_used': 'ensemble_v1.0'
            }
        except Exception as e:
            result['cost_overrun'] = {'error': str(e)}

    # Time overrun prediction
    if 'time_xgboost' in models:
        try:
            xgb_prob = models['time_xgboost'].predict_proba(X_scaled)[:, 1][0]
            lgb_prob = models['time_lightgbm'].predict_proba(X_scaled)[:, 1][0] if 'time_lightgbm' in models else xgb_prob
            rf_prob = models['time_rf'].predict_proba(X_scaled)[:, 1][0] if 'time_rf' in models else xgb_prob

            if 'time_meta' in models:
                stacking = np.array([[xgb_prob, lgb_prob, rf_prob]])
                time_prob = float(models['time_meta'].predict_proba(stacking)[:, 1][0])
            else:
                time_prob = float(0.4 * xgb_prob + 0.35 * lgb_prob + 0.25 * rf_prob)

            time_months = float(models['time_reg'].predict(X_scaled)[0]) if 'time_reg' in models else 0.0

            result['time_overrun'] = {
                'will_overrun': bool(time_prob >= 0.5),
                'probability': round(time_prob, 4),
                'predicted_months': round(max(0, time_months), 0),
                'model_used': 'ensemble_v1.0'
            }
        except Exception as e:
            result['time_overrun'] = {'error': str(e)}

    # Risk score computation
    cost_prob = result.get('cost_overrun', {}).get('probability', 0.5)
    cost_pct = result.get('cost_overrun', {}).get('predicted_percentage', 0)
    time_prob = result.get('time_overrun', {}).get('probability', 0.5)
    time_months = result.get('time_overrun', {}).get('predicted_months', 0)

    cost_risk = (0.6 * cost_prob + 0.4 * min(cost_pct / 50, 1.0)) * 100
    time_risk = (0.6 * time_prob + 0.4 * min(time_months / 48, 1.0)) * 100

    # Milestone risk
    milestone_total = project_row.get('milestone_total_count', 1)
    milestone_achieved = project_row.get('milestone_achieved_count', 0)
    milestone_rate = milestone_achieved / max(milestone_total, 1)
    milestone_risk = min((1 - milestone_rate) * 100, 100)

    total_risk = cost_risk * 0.30 + time_risk * 0.30 + milestone_risk * 0.20 + 25 * 0.10 + 25 * 0.10
    total_risk = round(min(100, max(0, total_risk)), 1)

    category = 'Low'
    if total_risk > 75:
        category = 'Critical'
    elif total_risk > 50:
        category = 'High'
    elif total_risk > 25:
        category = 'Moderate'

    result['risk_score'] = {
        'total': total_risk,
        'category': category,
        'components': {
            'cost_risk': round(cost_risk, 1),
            'time_risk': round(time_risk, 1),
            'milestone_risk': round(milestone_risk, 1),
        }
    }

    return result


def _generate_explanation(project_row) -> Dict[str, Any]:
    """Generate SHAP explanation for a project prediction."""
    project_df = pd.DataFrame([project_row.to_dict()])
    features_df = feature_engineer.transform(project_df)

    feature_names = feature_engineer.get_feature_names()
    available = [f for f in feature_names if f in features_df.columns]
    X = features_df[available].replace([np.inf, -np.inf], np.nan).fillna(0)

    if scaler is not None:
        try:
            X_scaled = pd.DataFrame(scaler.transform(X), columns=X.columns, index=X.index)
        except Exception:
            X_scaled = X
    else:
        X_scaled = X

    # SHAP explanation
    xgb_model = models['cost_xgboost']
    explainer = shap.TreeExplainer(xgb_model)
    shap_values = explainer.shap_values(X_scaled)

    if isinstance(shap_values, list):
        shap_vals = shap_values[1] if len(shap_values) > 1 else shap_values[0]
    else:
        shap_vals = shap_values

    shap_vals = shap_vals.flatten()

    # Create feature importance ranking
    feature_importance = sorted(
        zip(available[:len(shap_vals)], shap_vals.tolist()),
        key=lambda x: abs(x[1]), reverse=True
    )

    top_factors = []
    for feat, val in feature_importance[:10]:
        top_factors.append({
            'feature': feat,
            'shap_value': round(float(val), 4),
            'direction': 'increases risk' if val > 0 else 'decreases risk',
            'feature_value': round(float(X[feat].values[0]), 4) if feat in X.columns else None,
        })

    return {
        'project_id': project_row.get('project_id'),
        'model_type': 'xgboost_cost_overrun',
        'base_value': round(float(explainer.expected_value if isinstance(explainer.expected_value, (int, float)) else explainer.expected_value[1]), 4),
        'top_risk_factors': top_factors,
        'all_shap_values': {
            feat: round(float(val), 4)
            for feat, val in zip(available[:len(shap_vals)], shap_vals.tolist())
        },
        'waterfall_data': {
            'features': [f[0] for f in feature_importance[:15]],
            'values': [round(float(f[1]), 4) for f in feature_importance[:15]],
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

"""
NIRMAAN AI — ML Training Pipeline
===================================
End-to-end training pipeline for cost overrun, time overrun,
and risk scoring models using ensemble of XGBoost, LightGBM,
Random Forest, and stacking.
"""

import os
import sys
import json
import pickle
import warnings
from pathlib import Path
from datetime import datetime

import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (
    f1_score, precision_score, recall_score, roc_auc_score,
    mean_squared_error, mean_absolute_error, r2_score,
    classification_report, confusion_matrix
)
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
import xgboost as xgb
import lightgbm as lgb
import optuna
from optuna.samplers import TPESampler
import joblib

warnings.filterwarnings('ignore')

# Add parent to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
from app.pipeline.feature_engineering import FeatureEngineer


class ModelTrainer:
    """
    End-to-end ML training pipeline for NIRMAAN AI.
    
    Trains and evaluates:
    - Cost Overrun Classifier (binary: will overrun yes/no)
    - Cost Overrun Regressor (predict overrun %)
    - Time Overrun Classifier (binary: will be delayed yes/no)
    - Time Overrun Regressor (predict delay months)
    - Ensemble (stacking meta-learner)
    
    Also trains baseline models for comparison:
    - Logistic/Linear Regression
    - Decision Tree
    """

    def __init__(self, data_dir: str = None, model_dir: str = None, optuna_trials: int = 50):
        base_dir = Path(__file__).resolve().parent.parent.parent
        project_root = base_dir.parent  # SIH2 root
        self.data_dir = Path(data_dir) if data_dir else project_root / "data" / "raw"
        self.model_dir = Path(model_dir) if model_dir else base_dir / "data" / "models"
        self.model_dir.mkdir(parents=True, exist_ok=True)
        self.optuna_trials = optuna_trials
        self.feature_engineer = FeatureEngineer(reference_date="2026-04-01")
        self.results = {}

    def run_pipeline(self):
        """Execute the full training pipeline."""
        print("=" * 70)
        print("NIRMAAN AI - ML Training Pipeline")
        print("=" * 70)

        # Step 1: Load data
        print("\n[1/7] Loading data...")
        df, snapshots_df = self._load_data()
        print(f"  Loaded {len(df)} projects, {len(snapshots_df)} snapshots")

        # Step 2: Feature engineering
        print("\n[2/7] Engineering features...")
        df_features = self.feature_engineer.fit_transform(df, snapshots_df)
        print(f"  Generated {len(self.feature_engineer.get_feature_names())} features")

        # Step 3: Prepare datasets
        print("\n[3/7] Preparing train/val/test splits...")
        datasets = self._prepare_datasets(df_features)

        # Step 4: Train cost overrun models
        print("\n[4/7] Training COST OVERRUN models...")
        cost_results = self._train_cost_overrun_models(datasets)
        self.results['cost_overrun'] = cost_results

        # Step 5: Train time overrun models
        print("\n[5/7] Training TIME OVERRUN models...")
        time_results = self._train_time_overrun_models(datasets)
        self.results['time_overrun'] = time_results

        # Step 6: Train ensemble
        print("\n[6/7] Building ENSEMBLE models...")
        ensemble_results = self._train_ensemble(datasets)
        self.results['ensemble'] = ensemble_results

        # Step 7: Train baselines for comparison
        print("\n[7/7] Training BASELINE models for comparison...")
        baseline_results = self._train_baselines(datasets)
        self.results['baselines'] = baseline_results

        # Save results
        self._save_results()
        self._print_comparison()

        # Save feature engineer
        joblib.dump(self.feature_engineer, self.model_dir / "feature_engineer.pkl")

        print("\n" + "=" * 70)
        print("Pipeline complete! Models saved to:", self.model_dir)
        print("=" * 70)

        return self.results

    def _load_data(self):
        """Load project and snapshot data."""
        projects_df = pd.read_csv(self.data_dir / "projects.csv")
        snapshots_df = pd.read_csv(self.data_dir / "project_snapshots.csv")
        return projects_df, snapshots_df

    def _prepare_datasets(self, df):
        """Prepare train/validation/test splits."""
        # Filter to projects that are under implementation or completed (not shelved/not started)
        df_active = df[df['project_status'].isin(['Under Implementation', 'Completed'])].copy()
        print(f"  Active projects: {len(df_active)}")

        # Get feature columns
        feature_names = self.feature_engineer.get_feature_names()
        available_features = [f for f in feature_names if f in df_active.columns]
        print(f"  Available features: {len(available_features)}")

        # Fill NaN with 0 and replace infinities
        X = df_active[available_features].copy()
        X = X.replace([np.inf, -np.inf], np.nan)
        X = X.fillna(0)

        # Targets
        y_cost_cls = self.feature_engineer.get_classification_target(df_active)
        y_cost_reg = self.feature_engineer.get_regression_target(df_active)
        y_time_cls = self.feature_engineer.get_time_overrun_classification_target(df_active)
        y_time_reg = self.feature_engineer.get_time_overrun_regression_target(df_active)

        # Stratified split: 70/15/15
        X_train_val, X_test, y_cost_cls_train_val, y_cost_cls_test = train_test_split(
            X, y_cost_cls, test_size=0.15, random_state=42, stratify=y_cost_cls
        )
        X_train, X_val, y_cost_cls_train, y_cost_cls_val = train_test_split(
            X_train_val, y_cost_cls_train_val, test_size=0.176, random_state=42,
            stratify=y_cost_cls_train_val
        )

        # Get corresponding regression targets
        y_cost_reg_train = y_cost_reg.loc[X_train.index]
        y_cost_reg_val = y_cost_reg.loc[X_val.index]
        y_cost_reg_test = y_cost_reg.loc[X_test.index]

        y_time_cls_train = y_time_cls.loc[X_train.index]
        y_time_cls_val = y_time_cls.loc[X_val.index]
        y_time_cls_test = y_time_cls.loc[X_test.index]

        y_time_reg_train = y_time_reg.loc[X_train.index]
        y_time_reg_val = y_time_reg.loc[X_val.index]
        y_time_reg_test = y_time_reg.loc[X_test.index]

        # Scale features
        scaler = StandardScaler()
        X_train_scaled = pd.DataFrame(
            scaler.fit_transform(X_train), columns=X_train.columns, index=X_train.index
        )
        X_val_scaled = pd.DataFrame(
            scaler.transform(X_val), columns=X_val.columns, index=X_val.index
        )
        X_test_scaled = pd.DataFrame(
            scaler.transform(X_test), columns=X_test.columns, index=X_test.index
        )

        # Save scaler
        joblib.dump(scaler, self.model_dir / "scaler.pkl")

        print(f"  Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")
        print(f"  Cost overrun rate - Train: {y_cost_cls_train.mean():.2%}, Test: {y_cost_cls_test.mean():.2%}")
        print(f"  Time overrun rate - Train: {y_time_cls_train.mean():.2%}, Test: {y_time_cls_test.mean():.2%}")

        return {
            'X_train': X_train_scaled, 'X_val': X_val_scaled, 'X_test': X_test_scaled,
            'X_train_raw': X_train, 'X_val_raw': X_val, 'X_test_raw': X_test,
            'y_cost_cls_train': y_cost_cls_train, 'y_cost_cls_val': y_cost_cls_val, 'y_cost_cls_test': y_cost_cls_test,
            'y_cost_reg_train': y_cost_reg_train, 'y_cost_reg_val': y_cost_reg_val, 'y_cost_reg_test': y_cost_reg_test,
            'y_time_cls_train': y_time_cls_train, 'y_time_cls_val': y_time_cls_val, 'y_time_cls_test': y_time_cls_test,
            'y_time_reg_train': y_time_reg_train, 'y_time_reg_val': y_time_reg_val, 'y_time_reg_test': y_time_reg_test,
            'feature_names': available_features,
        }

    # ─── COST OVERRUN MODELS ────────────────────────────────────────────────────

    def _train_cost_overrun_models(self, datasets):
        """Train XGBoost, LightGBM, and Random Forest for cost overrun prediction."""
        results = {}

        X_train = datasets['X_train']
        X_val = datasets['X_val']
        X_test = datasets['X_test']
        y_train = datasets['y_cost_cls_train']
        y_val = datasets['y_cost_cls_val']
        y_test = datasets['y_cost_cls_test']

        # ─── XGBoost ────────────────────────────────────────────────────────
        print("\n  Training XGBoost (Cost Overrun)...")
        xgb_params = self._optimize_xgboost(X_train, y_train, X_val, y_val)
        xgb_model = xgb.XGBClassifier(**xgb_params, random_state=42, eval_metric='logloss')
        xgb_model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)

        xgb_preds = xgb_model.predict(X_test)
        xgb_probs = xgb_model.predict_proba(X_test)[:, 1]
        results['xgboost'] = self._evaluate_classifier(y_test, xgb_preds, xgb_probs, "XGBoost")
        joblib.dump(xgb_model, self.model_dir / "cost_overrun_xgboost.pkl")

        # ─── LightGBM ───────────────────────────────────────────────────────
        print("  Training LightGBM (Cost Overrun)...")
        lgb_params = self._optimize_lightgbm(X_train, y_train, X_val, y_val)
        lgb_model = lgb.LGBMClassifier(**lgb_params, random_state=42, verbose=-1)
        lgb_model.fit(X_train, y_train, eval_set=[(X_val, y_val)])

        lgb_preds = lgb_model.predict(X_test)
        lgb_probs = lgb_model.predict_proba(X_test)[:, 1]
        results['lightgbm'] = self._evaluate_classifier(y_test, lgb_preds, lgb_probs, "LightGBM")
        joblib.dump(lgb_model, self.model_dir / "cost_overrun_lightgbm.pkl")

        # ─── Random Forest ──────────────────────────────────────────────────
        print("  Training Random Forest (Cost Overrun)...")
        rf_model = RandomForestClassifier(
            n_estimators=500, max_depth=12, min_samples_split=5,
            min_samples_leaf=2, max_features='sqrt', random_state=42, n_jobs=-1
        )
        rf_model.fit(X_train, y_train)

        rf_preds = rf_model.predict(X_test)
        rf_probs = rf_model.predict_proba(X_test)[:, 1]
        results['random_forest'] = self._evaluate_classifier(y_test, rf_preds, rf_probs, "RandomForest")
        joblib.dump(rf_model, self.model_dir / "cost_overrun_rf.pkl")

        # ─── Cost Overrun Regression ────────────────────────────────────────
        print("  Training XGBoost Regressor (Cost Overrun %)...")
        y_reg_train = datasets['y_cost_reg_train']
        y_reg_test = datasets['y_cost_reg_test']

        xgb_reg = xgb.XGBRegressor(
            n_estimators=500, max_depth=8, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8, random_state=42
        )
        xgb_reg.fit(X_train, y_reg_train, eval_set=[(X_val, datasets['y_cost_reg_val'])], verbose=False)

        reg_preds = xgb_reg.predict(X_test)
        results['xgboost_regressor'] = self._evaluate_regressor(y_reg_test, reg_preds, "XGBoost Regressor")
        joblib.dump(xgb_reg, self.model_dir / "cost_overrun_xgboost_reg.pkl")

        return results

    # ─── TIME OVERRUN MODELS ────────────────────────────────────────────────────

    def _train_time_overrun_models(self, datasets):
        """Train models for time overrun prediction."""
        results = {}

        X_train = datasets['X_train']
        X_val = datasets['X_val']
        X_test = datasets['X_test']
        y_train = datasets['y_time_cls_train']
        y_val = datasets['y_time_cls_val']
        y_test = datasets['y_time_cls_test']

        # ─── XGBoost ────────────────────────────────────────────────────────
        print("\n  Training XGBoost (Time Overrun)...")
        xgb_params = self._optimize_xgboost(X_train, y_train, X_val, y_val)
        xgb_model = xgb.XGBClassifier(**xgb_params, random_state=42, eval_metric='logloss')
        xgb_model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)

        xgb_preds = xgb_model.predict(X_test)
        xgb_probs = xgb_model.predict_proba(X_test)[:, 1]
        results['xgboost'] = self._evaluate_classifier(y_test, xgb_preds, xgb_probs, "XGBoost")
        joblib.dump(xgb_model, self.model_dir / "time_overrun_xgboost.pkl")

        # ─── LightGBM ───────────────────────────────────────────────────────
        print("  Training LightGBM (Time Overrun)...")
        lgb_params = self._optimize_lightgbm(X_train, y_train, X_val, y_val)
        lgb_model = lgb.LGBMClassifier(**lgb_params, random_state=42, verbose=-1)
        lgb_model.fit(X_train, y_train, eval_set=[(X_val, y_val)])

        lgb_preds = lgb_model.predict(X_test)
        lgb_probs = lgb_model.predict_proba(X_test)[:, 1]
        results['lightgbm'] = self._evaluate_classifier(y_test, lgb_preds, lgb_probs, "LightGBM")
        joblib.dump(lgb_model, self.model_dir / "time_overrun_lightgbm.pkl")

        # ─── Random Forest ──────────────────────────────────────────────────
        print("  Training Random Forest (Time Overrun)...")
        rf_model = RandomForestClassifier(
            n_estimators=500, max_depth=12, min_samples_split=5,
            min_samples_leaf=2, max_features='sqrt', random_state=42, n_jobs=-1
        )
        rf_model.fit(X_train, y_train)

        rf_preds = rf_model.predict(X_test)
        rf_probs = rf_model.predict_proba(X_test)[:, 1]
        results['random_forest'] = self._evaluate_classifier(y_test, rf_preds, rf_probs, "RandomForest")
        joblib.dump(rf_model, self.model_dir / "time_overrun_rf.pkl")

        # ─── Time Overrun Regression ────────────────────────────────────────
        print("  Training XGBoost Regressor (Time Overrun months)...")
        y_reg_train = datasets['y_time_reg_train']
        y_reg_test = datasets['y_time_reg_test']

        xgb_reg = xgb.XGBRegressor(
            n_estimators=500, max_depth=8, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8, random_state=42
        )
        xgb_reg.fit(X_train, y_reg_train, eval_set=[(X_val, datasets['y_time_reg_val'])], verbose=False)

        reg_preds = xgb_reg.predict(X_test)
        results['xgboost_regressor'] = self._evaluate_regressor(y_reg_test, reg_preds, "XGBoost Regressor")
        joblib.dump(xgb_reg, self.model_dir / "time_overrun_xgboost_reg.pkl")

        return results

    # ─── ENSEMBLE ────────────────────────────────────────────────────────────────

    def _train_ensemble(self, datasets):
        """Train stacking ensemble for cost and time overrun."""
        results = {}

        for target_type in ['cost', 'time']:
            print(f"\n  Building {target_type.upper()} overrun ensemble...")

            X_train = datasets['X_train']
            X_test = datasets['X_test']
            y_train = datasets[f'y_{target_type}_cls_train']
            y_test = datasets[f'y_{target_type}_cls_test']

            # Load base models
            xgb_model = joblib.load(self.model_dir / f"{target_type}_overrun_xgboost.pkl")
            lgb_model = joblib.load(self.model_dir / f"{target_type}_overrun_lightgbm.pkl")
            rf_model = joblib.load(self.model_dir / f"{target_type}_overrun_rf.pkl")

            # Generate stacking features (out-of-fold predictions)
            skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
            oof_xgb = np.zeros(len(X_train))
            oof_lgb = np.zeros(len(X_train))
            oof_rf = np.zeros(len(X_train))

            for fold_idx, (train_idx, val_idx) in enumerate(skf.split(X_train, y_train)):
                X_fold_train = X_train.iloc[train_idx]
                y_fold_train = y_train.iloc[train_idx]
                X_fold_val = X_train.iloc[val_idx]

                # XGBoost
                xgb_fold = xgb.XGBClassifier(**xgb_model.get_params())
                xgb_fold.fit(X_fold_train, y_fold_train, verbose=False)
                oof_xgb[val_idx] = xgb_fold.predict_proba(X_fold_val)[:, 1]

                # LightGBM
                lgb_fold = lgb.LGBMClassifier(**lgb_model.get_params())
                lgb_fold.set_params(verbose=-1)
                lgb_fold.fit(X_fold_train, y_fold_train)
                oof_lgb[val_idx] = lgb_fold.predict_proba(X_fold_val)[:, 1]

                # Random Forest
                rf_fold = RandomForestClassifier(**rf_model.get_params())
                rf_fold.fit(X_fold_train, y_fold_train)
                oof_rf[val_idx] = rf_fold.predict_proba(X_fold_val)[:, 1]

            # Stack with logistic regression meta-learner
            stacking_train = np.column_stack([oof_xgb, oof_lgb, oof_rf])
            meta_learner = LogisticRegression(C=1.0, random_state=42)
            meta_learner.fit(stacking_train, y_train)

            # Test predictions
            test_xgb = xgb_model.predict_proba(X_test)[:, 1]
            test_lgb = lgb_model.predict_proba(X_test)[:, 1]
            test_rf = rf_model.predict_proba(X_test)[:, 1]

            stacking_test = np.column_stack([test_xgb, test_lgb, test_rf])
            ensemble_probs = meta_learner.predict_proba(stacking_test)[:, 1]
            ensemble_preds = (ensemble_probs >= 0.5).astype(int)

            results[f'{target_type}_ensemble'] = self._evaluate_classifier(
                y_test, ensemble_preds, ensemble_probs, f"Ensemble ({target_type.title()})"
            )

            # Save meta-learner
            joblib.dump(meta_learner, self.model_dir / f"{target_type}_overrun_meta_learner.pkl")

            # Also save ensemble weights (from meta-learner coefficients)
            weights = meta_learner.coef_[0]
            weights_normalized = np.exp(weights) / np.sum(np.exp(weights))
            results[f'{target_type}_ensemble']['weights'] = {
                'xgboost': float(weights_normalized[0]),
                'lightgbm': float(weights_normalized[1]),
                'random_forest': float(weights_normalized[2]),
            }
            print(f"    Ensemble weights: XGB={weights_normalized[0]:.3f}, "
                  f"LGB={weights_normalized[1]:.3f}, RF={weights_normalized[2]:.3f}")

        return results

    # ─── BASELINES ──────────────────────────────────────────────────────────────

    def _train_baselines(self, datasets):
        """Train baseline models for comparison."""
        results = {}

        X_train = datasets['X_train']
        X_test = datasets['X_test']
        y_train = datasets['y_cost_cls_train']
        y_test = datasets['y_cost_cls_test']

        # Logistic Regression
        print("  Training Logistic Regression...")
        lr = LogisticRegression(max_iter=1000, random_state=42)
        lr.fit(X_train, y_train)
        lr_preds = lr.predict(X_test)
        lr_probs = lr.predict_proba(X_test)[:, 1]
        results['logistic_regression'] = self._evaluate_classifier(y_test, lr_preds, lr_probs, "LogisticReg")

        # Decision Tree
        print("  Training Decision Tree...")
        dt = DecisionTreeClassifier(max_depth=5, random_state=42)
        dt.fit(X_train, y_train)
        dt_preds = dt.predict(X_test)
        dt_probs = dt.predict_proba(X_test)[:, 1]
        results['decision_tree'] = self._evaluate_classifier(y_test, dt_preds, dt_probs, "DecisionTree")

        # Rule-based (simple threshold on cost_revision_ratio)
        print("  Training Rule-based baseline...")
        if 'cost_revision_ratio' in X_test.columns:
            col_idx = list(X_test.columns).index('cost_revision_ratio')
            # Use scaled threshold
            threshold = X_train.iloc[:, col_idx].median()
            rule_preds = (X_test.iloc[:, col_idx] > threshold).astype(int)
            rule_probs = X_test.iloc[:, col_idx].values
            rule_probs = (rule_probs - rule_probs.min()) / (rule_probs.max() - rule_probs.min() + 1e-8)
            results['rule_based'] = self._evaluate_classifier(y_test, rule_preds, rule_probs, "Rule-Based")
        else:
            results['rule_based'] = {'f1': 0.0, 'note': 'cost_revision_ratio not available'}

        return results

    # ─── HYPERPARAMETER OPTIMIZATION ────────────────────────────────────────────

    def _optimize_xgboost(self, X_train, y_train, X_val, y_val):
        """Optimize XGBoost hyperparameters with Optuna."""
        optuna.logging.set_verbosity(optuna.logging.WARNING)

        def objective(trial):
            params = {
                'n_estimators': trial.suggest_int('n_estimators', 100, 800),
                'max_depth': trial.suggest_int('max_depth', 3, 10),
                'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3, log=True),
                'subsample': trial.suggest_float('subsample', 0.6, 1.0),
                'colsample_bytree': trial.suggest_float('colsample_bytree', 0.6, 1.0),
                'reg_alpha': trial.suggest_float('reg_alpha', 0.0, 10.0),
                'reg_lambda': trial.suggest_float('reg_lambda', 0.0, 10.0),
                'min_child_weight': trial.suggest_int('min_child_weight', 1, 10),
                'gamma': trial.suggest_float('gamma', 0.0, 5.0),
            }

            model = xgb.XGBClassifier(**params, random_state=42, eval_metric='logloss')
            model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
            preds = model.predict(X_val)
            return f1_score(y_val, preds)

        study = optuna.create_study(direction='maximize', sampler=TPESampler(seed=42))
        study.optimize(objective, n_trials=self.optuna_trials, show_progress_bar=False)

        best_params = study.best_params
        print(f"    XGBoost best F1: {study.best_value:.4f}")
        return best_params

    def _optimize_lightgbm(self, X_train, y_train, X_val, y_val):
        """Optimize LightGBM hyperparameters with Optuna."""
        optuna.logging.set_verbosity(optuna.logging.WARNING)

        def objective(trial):
            params = {
                'n_estimators': trial.suggest_int('n_estimators', 100, 800),
                'num_leaves': trial.suggest_int('num_leaves', 20, 150),
                'max_depth': trial.suggest_int('max_depth', 3, 12),
                'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3, log=True),
                'feature_fraction': trial.suggest_float('feature_fraction', 0.6, 1.0),
                'bagging_fraction': trial.suggest_float('bagging_fraction', 0.6, 1.0),
                'bagging_freq': trial.suggest_int('bagging_freq', 1, 7),
                'reg_alpha': trial.suggest_float('reg_alpha', 0.0, 10.0),
                'reg_lambda': trial.suggest_float('reg_lambda', 0.0, 10.0),
            }

            model = lgb.LGBMClassifier(**params, random_state=42, verbose=-1)
            model.fit(X_train, y_train, eval_set=[(X_val, y_val)])
            preds = model.predict(X_val)
            return f1_score(y_val, preds)

        study = optuna.create_study(direction='maximize', sampler=TPESampler(seed=42))
        study.optimize(objective, n_trials=self.optuna_trials, show_progress_bar=False)

        best_params = study.best_params
        print(f"    LightGBM best F1: {study.best_value:.4f}")
        return best_params

    # ─── EVALUATION ──────────────────────────────────────────────────────────────

    def _evaluate_classifier(self, y_true, y_pred, y_prob, model_name):
        """Evaluate a classifier and return metrics."""
        f1 = f1_score(y_true, y_pred)
        precision = precision_score(y_true, y_pred)
        recall = recall_score(y_true, y_pred)
        try:
            auc_roc = roc_auc_score(y_true, y_prob)
        except ValueError:
            auc_roc = 0.0

        metrics = {
            'f1_score': round(f1, 4),
            'precision': round(precision, 4),
            'recall': round(recall, 4),
            'auc_roc': round(auc_roc, 4),
        }

        print(f"    {model_name}: F1={f1:.4f}, Precision={precision:.4f}, "
              f"Recall={recall:.4f}, AUC-ROC={auc_roc:.4f}")

        return metrics

    def _evaluate_regressor(self, y_true, y_pred, model_name):
        """Evaluate a regressor and return metrics."""
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        mae = mean_absolute_error(y_true, y_pred)
        r2 = r2_score(y_true, y_pred)

        metrics = {
            'rmse': round(rmse, 4),
            'mae': round(mae, 4),
            'r_squared': round(r2, 4),
        }

        print(f"    {model_name}: RMSE={rmse:.4f}, MAE={mae:.4f}, R2={r2:.4f}")

        return metrics

    # ─── SAVE & REPORT ──────────────────────────────────────────────────────────

    def _save_results(self):
        """Save training results to JSON."""
        # Convert numpy types for JSON serialization
        def convert(obj):
            if isinstance(obj, (np.integer, np.int64)):
                return int(obj)
            elif isinstance(obj, (np.floating, np.float64)):
                return float(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            return obj

        results_file = self.model_dir / "training_results.json"
        with open(results_file, 'w') as f:
            json.dump(self.results, f, indent=2, default=convert)
        print(f"\n  Results saved to: {results_file}")

    def _print_comparison(self):
        """Print ML vs baseline comparison table."""
        print("\n" + "=" * 70)
        print("MODEL COMPARISON: ML vs CONVENTIONAL METHODS")
        print("=" * 70)
        print(f"{'Model':<25} {'F1-Score':>10} {'Precision':>10} {'Recall':>10} {'AUC-ROC':>10}")
        print("-" * 70)

        # Baselines
        if 'baselines' in self.results:
            for name, metrics in self.results['baselines'].items():
                if isinstance(metrics, dict) and 'f1_score' in metrics:
                    print(f"  {name:<23} {metrics['f1_score']:>10.4f} {metrics['precision']:>10.4f} "
                          f"{metrics['recall']:>10.4f} {metrics['auc_roc']:>10.4f}")

        print("-" * 70)

        # ML models (cost overrun)
        if 'cost_overrun' in self.results:
            for name, metrics in self.results['cost_overrun'].items():
                if isinstance(metrics, dict) and 'f1_score' in metrics:
                    print(f"  {name:<23} {metrics['f1_score']:>10.4f} {metrics['precision']:>10.4f} "
                          f"{metrics['recall']:>10.4f} {metrics['auc_roc']:>10.4f}")

        # Ensemble
        if 'ensemble' in self.results:
            for name, metrics in self.results['ensemble'].items():
                if isinstance(metrics, dict) and 'f1_score' in metrics:
                    print(f"  {name:<23} {metrics['f1_score']:>10.4f} {metrics['precision']:>10.4f} "
                          f"{metrics['recall']:>10.4f} {metrics['auc_roc']:>10.4f}")

        print("=" * 70)


if __name__ == "__main__":
    # Configurable via CLI args
    trials = int(sys.argv[1]) if len(sys.argv) > 1 else 30
    print(f"Running with {trials} Optuna trials per model")

    trainer = ModelTrainer(optuna_trials=trials)
    results = trainer.run_pipeline()

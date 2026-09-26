"""
PAIMANA AI — Feature Engineering Pipeline
==========================================
Transforms raw CUF project data into 47+ engineered features
for ML model training and prediction.
"""

import pandas as pd
import numpy as np
from datetime import datetime
from typing import Optional


class FeatureEngineer:
    """
    Feature engineering pipeline that transforms raw project data into ML-ready features.
    
    Feature Categories:
        1. Basic Derived Features (12)
        2. Statistical Aggregation Features (10)
        3. Temporal / Lag Features (15)
        4. Interaction Features (10)
    
    Total: 47+ features
    """

    def __init__(self, reference_date: Optional[str] = None):
        """
        Args:
            reference_date: The date to compute features relative to (default: today)
        """
        self.reference_date = pd.to_datetime(reference_date) if reference_date else pd.Timestamp.now()
        self._sector_stats = None
        self._ministry_stats = None
        self._agency_stats = None
        self._state_stats = None

    def fit_transform(self, df: pd.DataFrame, snapshots_df: Optional[pd.DataFrame] = None) -> pd.DataFrame:
        """
        Fit aggregation statistics and transform the dataset.
        
        Args:
            df: Raw project dataframe
            snapshots_df: Historical snapshot dataframe (optional, for temporal features)
        
        Returns:
            DataFrame with all engineered features
        """
        df = df.copy()
        
        # Parse dates
        date_cols = [
            'original_start_date', 'original_completion_date',
            'revised_completion_date', 'anticipated_completion_date', 'last_updated'
        ]
        for col in date_cols:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce')

        # Fit aggregation statistics
        self._compute_aggregation_stats(df)

        # Apply feature engineering categories
        df = self._basic_derived_features(df)
        df = self._statistical_aggregation_features(df)
        if snapshots_df is not None:
            df = self._temporal_features(df, snapshots_df)
        else:
            df = self._temporal_features_from_static(df)
        df = self._interaction_features(df)

        return df

    def transform(self, df: pd.DataFrame, snapshots_df: Optional[pd.DataFrame] = None) -> pd.DataFrame:
        """Transform using pre-fitted aggregation statistics."""
        df = df.copy()
        
        date_cols = [
            'original_start_date', 'original_completion_date',
            'revised_completion_date', 'anticipated_completion_date', 'last_updated'
        ]
        for col in date_cols:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce')

        df = self._basic_derived_features(df)
        df = self._statistical_aggregation_features(df)
        if snapshots_df is not None:
            df = self._temporal_features(df, snapshots_df)
        else:
            df = self._temporal_features_from_static(df)
        df = self._interaction_features(df)

        return df

    # ─── CATEGORY 1: BASIC DERIVED FEATURES (12) ────────────────────────────────

    def _basic_derived_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """12 basic derived features from CUF fields."""

        # 1. Cost revision ratio
        df['cost_revision_ratio'] = np.where(
            df['original_cost_crore'] > 0,
            df['revised_cost_crore'] / df['original_cost_crore'],
            1.0
        )

        # 2. Expenditure ratio (how much budget consumed)
        df['expenditure_ratio'] = np.where(
            df['revised_cost_crore'] > 0,
            df['cumulative_expenditure_crore'] / df['revised_cost_crore'],
            0.0
        )

        # 3. Project age in months
        df['project_age_months'] = (
            (self.reference_date - df['original_start_date']).dt.days / 30.44
        ).clip(lower=0).fillna(0)

        # 4. Planned duration in months
        df['planned_duration_months'] = (
            (df['original_completion_date'] - df['original_start_date']).dt.days / 30.44
        ).clip(lower=1).fillna(1)

        # 5. Elapsed ratio (time consumed / planned)
        df['elapsed_ratio'] = np.where(
            df['planned_duration_months'] > 0,
            df['project_age_months'] / df['planned_duration_months'],
            0.0
        )

        # 6. Burn rate (expenditure per month)
        df['burn_rate'] = np.where(
            df['project_age_months'] > 0,
            df['cumulative_expenditure_crore'] / df['project_age_months'],
            0.0
        )

        # 7. Budget remaining ratio
        df['budget_remaining_ratio'] = np.where(
            df['revised_cost_crore'] > 0,
            (df['revised_cost_crore'] - df['cumulative_expenditure_crore']) / df['revised_cost_crore'],
            1.0
        )

        # 8. Physical-financial progress gap
        df['physical_financial_gap'] = (
            df['physical_progress_percent'] - df['financial_progress_percent']
        )

        # 9. Milestone completion rate
        df['milestone_completion_rate'] = np.where(
            df['milestone_total_count'] > 0,
            df['milestone_achieved_count'] / df['milestone_total_count'],
            0.0
        )

        # 10. Land cost ratio
        df['land_cost_ratio'] = np.where(
            df['original_cost_crore'] > 0,
            df['land_acquisition_cost_crore'] / df['original_cost_crore'],
            0.0
        )

        # 11. Annual expenditure growth
        df['annual_expenditure_growth'] = np.where(
            df['expenditure_previous_year_crore'] > 0,
            df['expenditure_current_year_crore'] / df['expenditure_previous_year_crore'],
            1.0
        )

        # 12. Cost per month (expected)
        df['cost_per_month'] = np.where(
            df['planned_duration_months'] > 0,
            df['revised_cost_crore'] / df['planned_duration_months'],
            0.0
        )

        return df

    # ─── CATEGORY 2: STATISTICAL AGGREGATION FEATURES (10) ──────────────────────

    def _compute_aggregation_stats(self, df: pd.DataFrame):
        """Pre-compute sector, ministry, agency, and state level statistics."""

        # Sector statistics
        self._sector_stats = df.groupby('sector').agg(
            sector_avg_cost_overrun=('cost_overrun_percent', 'mean'),
            sector_avg_time_overrun=('time_overrun_months', 'mean'),
            sector_completion_rate=('project_status', lambda x: (x == 'Completed').mean()),
            sector_median_duration=('planned_duration_months', 'median') if 'planned_duration_months' in df.columns else ('year_of_approval', 'count'),
        ).reset_index()

        # Ministry statistics
        self._ministry_stats = df.groupby('ministry_department').agg(
            ministry_avg_overrun=('cost_overrun_percent', 'mean'),
        ).reset_index()

        # Agency statistics
        self._agency_stats = df.groupby('implementing_agency').agg(
            agency_historical_performance=('cost_overrun_percent', lambda x: 1 - (x > 5).mean()),
            agency_project_count=('project_id', 'count'),
        ).reset_index()

        # State statistics
        self._state_stats = df.groupby('state').agg(
            state_project_success_rate=('project_status', lambda x: (x == 'Completed').mean()),
        ).reset_index()

        # Cost category statistics
        df['_cost_category'] = pd.cut(
            df['original_cost_crore'],
            bins=[0, 500, 1000, 5000, 10000, 50000, float('inf')],
            labels=['150-500Cr', '500-1000Cr', '1000-5000Cr', '5000-10000Cr', '10000-50000Cr', '50000Cr+']
        )
        self._cost_category_stats = df.groupby('_cost_category', observed=True).agg(
            cost_category_overrun_avg=('cost_overrun_percent', 'mean'),
        ).reset_index()
        self._cost_category_stats.rename(columns={'_cost_category': 'cost_category'}, inplace=True)

        # Year-of-approval cohort statistics
        self._cohort_stats = df.groupby('year_of_approval').agg(
            approval_cohort_performance=('cost_overrun_percent', 'mean'),
        ).reset_index()

    def _statistical_aggregation_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """10 statistical aggregation features using group-level statistics."""

        # 1-2. Sector average cost & time overrun
        df = df.merge(self._sector_stats[['sector', 'sector_avg_cost_overrun', 'sector_avg_time_overrun']],
                       on='sector', how='left')

        # 3. Ministry average overrun
        df = df.merge(self._ministry_stats, on='ministry_department', how='left')

        # 4-5. Agency historical performance & project count
        df = df.merge(self._agency_stats, on='implementing_agency', how='left')

        # 6. State success rate
        df = df.merge(self._state_stats, on='state', how='left')

        # 7. Sector completion rate (already computed in sector_stats)
        if 'sector_completion_rate' not in df.columns:
            df = df.merge(
                self._sector_stats[['sector', 'sector_completion_rate']],
                on='sector', how='left'
            )

        # 8. Sector median duration
        if 'sector_median_duration' not in df.columns and 'sector_median_duration' in self._sector_stats.columns:
            df = df.merge(
                self._sector_stats[['sector', 'sector_median_duration']],
                on='sector', how='left'
            )

        # 9. Cost category overrun average
        df['cost_category'] = pd.cut(
            df['original_cost_crore'],
            bins=[0, 500, 1000, 5000, 10000, 50000, float('inf')],
            labels=['150-500Cr', '500-1000Cr', '1000-5000Cr', '5000-10000Cr', '10000-50000Cr', '50000Cr+']
        )
        df = df.merge(self._cost_category_stats, on='cost_category', how='left')

        # 10. Approval cohort performance
        df = df.merge(self._cohort_stats, on='year_of_approval', how='left')

        return df

    # ─── CATEGORY 3: TEMPORAL / LAG FEATURES (15) ───────────────────────────────

    def _temporal_features(self, df: pd.DataFrame, snapshots_df: pd.DataFrame) -> pd.DataFrame:
        """15 temporal features derived from monthly snapshots."""

        snapshots_df = snapshots_df.copy()
        snapshots_df['snapshot_date'] = pd.to_datetime(snapshots_df['snapshot_date'])

        # Sort by date
        snapshots_df = snapshots_df.sort_values(['project_id', 'snapshot_date'])

        # Compute per-project temporal features
        temporal_features = {}

        for pid, group in snapshots_df.groupby('project_id'):
            group = group.sort_values('snapshot_date')

            if len(group) < 2:
                temporal_features[pid] = self._default_temporal_features()
                continue

            # Expenditure growth rates
            exp_values = group['cumulative_expenditure_crore'].values
            recent_3m = exp_values[-3:] if len(exp_values) >= 3 else exp_values
            recent_6m = exp_values[-6:] if len(exp_values) >= 6 else exp_values

            exp_growth_3m = (recent_3m[-1] / max(recent_3m[0], 0.01)) - 1 if len(recent_3m) > 1 else 0
            exp_growth_6m = (recent_6m[-1] / max(recent_6m[0], 0.01)) - 1 if len(recent_6m) > 1 else 0

            # Progress velocity
            prog_values = group['physical_progress_percent'].values
            recent_prog_3m = prog_values[-3:] if len(prog_values) >= 3 else prog_values
            recent_prog_6m = prog_values[-6:] if len(prog_values) >= 6 else prog_values

            progress_velocity_3m = (recent_prog_3m[-1] - recent_prog_3m[0]) if len(recent_prog_3m) > 1 else 0
            progress_velocity_6m = (recent_prog_6m[-1] - recent_prog_6m[0]) if len(recent_prog_6m) > 1 else 0

            # Cost revision count & acceleration
            cost_overruns = group['cost_overrun_percent'].values
            cost_revision_acceleration = 0
            if len(cost_overruns) >= 6:
                first_half = np.mean(np.diff(cost_overruns[:len(cost_overruns)//2]))
                second_half = np.mean(np.diff(cost_overruns[len(cost_overruns)//2:]))
                cost_revision_acceleration = second_half - first_half

            # Milestone achievement trend
            milestones = group['milestone_achieved_count'].values
            milestone_trend = 0
            if len(milestones) >= 6:
                recent = np.mean(np.diff(milestones[-6:]))
                earlier = np.mean(np.diff(milestones[:6])) if len(milestones) > 6 else recent
                milestone_trend = recent - earlier

            # Progress stagnation
            progress_diffs = np.diff(prog_values)
            stagnation_months = int(np.sum(np.abs(progress_diffs) < 1.0))

            # Expenditure seasonality (Q4 spike detection)
            dates = group['snapshot_date'].values
            q4_mask = pd.to_datetime(dates).month.isin([1, 2, 3])
            if q4_mask.sum() > 0 and (~q4_mask).sum() > 0:
                q4_avg = np.mean(np.diff(exp_values)[q4_mask[1:]] if len(exp_values) > 1 else [0])
                non_q4_avg = np.mean(np.diff(exp_values)[~q4_mask[1:]] if len(exp_values) > 1 else [0])
                expenditure_seasonality = q4_avg / max(non_q4_avg, 0.01) if non_q4_avg > 0 else 1.0
            else:
                expenditure_seasonality = 1.0

            # Lag features
            exp_lag_1m = exp_values[-2] if len(exp_values) >= 2 else exp_values[-1]
            exp_lag_2m = exp_values[-3] if len(exp_values) >= 3 else exp_values[-1]
            prog_lag_1m = prog_values[-2] if len(prog_values) >= 2 else prog_values[-1]
            prog_lag_2m = prog_values[-3] if len(prog_values) >= 3 else prog_values[-1]

            # Months since last revision
            overrun_changes = np.where(np.abs(np.diff(cost_overruns)) > 0.5)[0]
            months_since_revision = len(cost_overruns) - overrun_changes[-1] - 1 if len(overrun_changes) > 0 else len(cost_overruns)

            temporal_features[pid] = {
                'expenditure_growth_3m': round(exp_growth_3m, 4),
                'expenditure_growth_6m': round(exp_growth_6m, 4),
                'progress_velocity_3m': round(progress_velocity_3m, 2),
                'progress_velocity_6m': round(progress_velocity_6m, 2),
                'cost_revision_acceleration': round(cost_revision_acceleration, 4),
                'milestone_achievement_trend': round(milestone_trend, 4),
                'expenditure_seasonality': round(expenditure_seasonality, 4),
                'progress_stagnation_months': stagnation_months,
                'months_since_last_revision': months_since_revision,
                'expenditure_lag_1m': round(exp_lag_1m, 2),
                'expenditure_lag_2m': round(exp_lag_2m, 2),
                'progress_lag_1m': round(prog_lag_1m, 2),
                'progress_lag_2m': round(prog_lag_2m, 2),
            }

        # Add schedule/cost revision counts from main data (2 more features)
        temporal_df = pd.DataFrame.from_dict(temporal_features, orient='index')
        temporal_df.index.name = 'project_id'
        temporal_df = temporal_df.reset_index()

        df = df.merge(temporal_df, on='project_id', how='left')

        # Fill missing temporal features
        temporal_cols = [
            'expenditure_growth_3m', 'expenditure_growth_6m',
            'progress_velocity_3m', 'progress_velocity_6m',
            'cost_revision_acceleration', 'milestone_achievement_trend',
            'expenditure_seasonality', 'progress_stagnation_months',
            'months_since_last_revision',
            'expenditure_lag_1m', 'expenditure_lag_2m',
            'progress_lag_1m', 'progress_lag_2m',
        ]
        for col in temporal_cols:
            if col in df.columns:
                df[col] = df[col].fillna(0)

        return df

    def _temporal_features_from_static(self, df: pd.DataFrame) -> pd.DataFrame:
        """Generate approximate temporal features when snapshots are not available."""
        default = self._default_temporal_features()
        for col, val in default.items():
            df[col] = val
        return df

    @staticmethod
    def _default_temporal_features():
        return {
            'expenditure_growth_3m': 0.0,
            'expenditure_growth_6m': 0.0,
            'progress_velocity_3m': 0.0,
            'progress_velocity_6m': 0.0,
            'cost_revision_acceleration': 0.0,
            'milestone_achievement_trend': 0.0,
            'expenditure_seasonality': 1.0,
            'progress_stagnation_months': 0,
            'months_since_last_revision': 12,
            'expenditure_lag_1m': 0.0,
            'expenditure_lag_2m': 0.0,
            'progress_lag_1m': 0.0,
            'progress_lag_2m': 0.0,
        }

    # ─── CATEGORY 4: INTERACTION FEATURES (10) ──────────────────────────────────

    def _interaction_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """10 interaction features capturing variable combinations."""

        # 1. Sector × cost category (encoded as risk)
        df['sector_cost_risk'] = (
            df.get('sector_avg_cost_overrun', 0) *
            df.get('cost_category_overrun_avg', 0)
        ).fillna(0) / 100

        # 2. Project size × duration mismatch
        df['size_duration_ratio'] = np.where(
            df['planned_duration_months'] > 0,
            df['original_cost_crore'] / df['planned_duration_months'],
            0.0
        )

        # 3. Age × progress (expected trajectory check)
        df['age_progress_ratio'] = np.where(
            df['project_age_months'] > 0,
            df['physical_progress_percent'] / (df['elapsed_ratio'] * 100 + 0.01),
            1.0
        )

        # 4. Cost ratio × progress
        df['cost_ratio_x_progress'] = (
            df['cost_revision_ratio'] * (100 - df['physical_progress_percent']) / 100
        )

        # 5. Burn rate × remaining budget
        df['burn_sustainability'] = np.where(
            df['burn_rate'] > 0,
            df['budget_remaining_ratio'] * df['revised_cost_crore'] / (df['burn_rate'] * 12),
            float('inf')
        )
        df['burn_sustainability'] = df['burn_sustainability'].clip(upper=10)

        # 6. Milestone gap × time remaining
        expected_milestone_pct = df['elapsed_ratio'].clip(upper=1.0)
        actual_milestone_pct = df['milestone_completion_rate']
        df['milestone_time_feasibility'] = (
            (expected_milestone_pct - actual_milestone_pct) *
            (1 - df['elapsed_ratio'].clip(upper=1.0))
        ).fillna(0)

        # 7. Financial gap × cost overrun
        df['financial_gap_x_overrun'] = (
            df['physical_financial_gap'] * df['cost_revision_ratio']
        ).fillna(0)

        # 8. Sector risk × agency risk
        df['compound_risk'] = (
            df.get('sector_avg_cost_overrun', 0) *
            (1 - df.get('agency_historical_performance', 0.5))
        ).fillna(0)

        # 9. Expenditure rate × elapsed ratio
        df['expenditure_timing'] = (
            df['expenditure_ratio'] - df['elapsed_ratio'].clip(upper=1.0)
        ).fillna(0)

        # 10. Progress deviation from S-curve expectation
        expected_progress = df['elapsed_ratio'].apply(
            lambda t: 100 / (1 + np.exp(-10 * (min(t, 1.0) - 0.5)))
        )
        df['progress_deviation'] = (
            df['physical_progress_percent'] - expected_progress
        ).fillna(0)

        return df

    # ─── UTILITIES ──────────────────────────────────────────────────────────────

    def get_feature_names(self) -> list:
        """Return list of all engineered feature names."""
        return [
            # Category 1: Basic Derived (12)
            'cost_revision_ratio', 'expenditure_ratio', 'project_age_months',
            'planned_duration_months', 'elapsed_ratio', 'burn_rate',
            'budget_remaining_ratio', 'physical_financial_gap',
            'milestone_completion_rate', 'land_cost_ratio',
            'annual_expenditure_growth', 'cost_per_month',
            # Category 2: Statistical Aggregation (10)
            'sector_avg_cost_overrun', 'sector_avg_time_overrun',
            'ministry_avg_overrun', 'agency_historical_performance',
            'agency_project_count', 'state_project_success_rate',
            'sector_completion_rate', 'sector_median_duration',
            'cost_category_overrun_avg', 'approval_cohort_performance',
            # Category 3: Temporal (15)
            'expenditure_growth_3m', 'expenditure_growth_6m',
            'progress_velocity_3m', 'progress_velocity_6m',
            'cost_revision_count', 'schedule_revision_count',
            'cost_revision_acceleration', 'milestone_achievement_trend',
            'expenditure_seasonality', 'progress_stagnation_months',
            'months_since_last_revision',
            'expenditure_lag_1m', 'expenditure_lag_2m',
            'progress_lag_1m', 'progress_lag_2m',
            # Category 4: Interaction (10)
            'sector_cost_risk', 'size_duration_ratio', 'age_progress_ratio',
            'cost_ratio_x_progress', 'burn_sustainability',
            'milestone_time_feasibility', 'financial_gap_x_overrun',
            'compound_risk', 'expenditure_timing', 'progress_deviation',
        ]

    def get_classification_target(self, df: pd.DataFrame, threshold: float = 5.0) -> pd.Series:
        """Generate binary classification target for cost overrun."""
        return (df['cost_overrun_percent'] > threshold).astype(int)

    def get_regression_target(self, df: pd.DataFrame) -> pd.Series:
        """Generate regression target (cost overrun percentage)."""
        return df['cost_overrun_percent'].clip(lower=0)

    def get_time_overrun_classification_target(self, df: pd.DataFrame, threshold: int = 6) -> pd.Series:
        """Generate binary classification target for time overrun."""
        return (df['time_overrun_months'] > threshold).astype(int)

    def get_time_overrun_regression_target(self, df: pd.DataFrame) -> pd.Series:
        """Generate regression target (time overrun in months)."""
        return df['time_overrun_months'].clip(lower=0)

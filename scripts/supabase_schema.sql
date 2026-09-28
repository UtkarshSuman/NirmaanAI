-- NIRMAAN AI (PAIMAANA) - Supabase / PostgreSQL Schema Definition
-- Run this in your Supabase SQL Editor if tables do not exist yet.

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    project_id TEXT UNIQUE NOT NULL,
    project_name TEXT NOT NULL,
    ministry_department TEXT NOT NULL,
    sector TEXT NOT NULL,
    sub_sector TEXT,
    state TEXT NOT NULL,
    district TEXT,
    implementing_agency TEXT NOT NULL,
    original_cost_crore DOUBLE PRECISION NOT NULL,
    revised_cost_crore DOUBLE PRECISION NOT NULL,
    anticipated_cost_crore DOUBLE PRECISION,
    cumulative_expenditure_crore DOUBLE PRECISION NOT NULL,
    expenditure_current_year_crore DOUBLE PRECISION,
    expenditure_previous_year_crore DOUBLE PRECISION,
    land_acquisition_cost_crore DOUBLE PRECISION,
    original_start_date TIMESTAMPTZ,
    original_completion_date TIMESTAMPTZ,
    revised_completion_date TIMESTAMPTZ,
    anticipated_completion_date TIMESTAMPTZ,
    year_of_approval INTEGER,
    physical_progress_percent DOUBLE PRECISION NOT NULL,
    financial_progress_percent DOUBLE PRECISION NOT NULL,
    milestone_achieved_count INTEGER DEFAULT 0,
    milestone_total_count INTEGER DEFAULT 0,
    project_status TEXT DEFAULT 'Under Implementation',
    cost_overrun_percent DOUBLE PRECISION DEFAULT 0,
    time_overrun_months INTEGER DEFAULT 0,
    reason_for_delay TEXT,
    cost_revision_count INTEGER DEFAULT 0,
    schedule_revision_count INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Predictions Table
CREATE TABLE IF NOT EXISTS public.predictions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    project_id TEXT NOT NULL REFERENCES public.projects(project_id) ON DELETE CASCADE,
    prediction_date TIMESTAMPTZ DEFAULT NOW(),
    model_version TEXT,
    predicted_cost_overrun_percent DOUBLE PRECISION,
    cost_overrun_probability DOUBLE PRECISION,
    predicted_time_overrun_months INTEGER,
    time_overrun_probability DOUBLE PRECISION,
    risk_score DOUBLE PRECISION,
    risk_category TEXT,
    top_risk_factors TEXT,
    shap_values TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Alerts Table
CREATE TABLE IF NOT EXISTS public.alerts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    project_id TEXT NOT NULL REFERENCES public.projects(project_id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    risk_score DOUBLE PRECISION,
    recommended_action TEXT,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_sector ON public.projects(sector);
CREATE INDEX IF NOT EXISTS idx_projects_state ON public.projects(state);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(project_status);
CREATE INDEX IF NOT EXISTS idx_predictions_project_id ON public.predictions(project_id);
CREATE INDEX IF NOT EXISTS idx_alerts_project_id ON public.alerts(project_id);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON public.alerts(is_acknowledged);

-- Disable RLS or allow public read/write for PAIMAANA backend service
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on predictions" ON public.predictions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on alerts" ON public.alerts FOR ALL USING (true) WITH CHECK (true);

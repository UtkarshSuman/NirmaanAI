"use client";

import React, { useState } from "react";
import {
  Layers,
  X,
  Search,
  Copy,
  Check,
  Code,
  Tag,
  Sliders,
  ChevronRight,
} from "lucide-react";

interface FeatureDef {
  name: string;
  category: "Basic Derived" | "Statistical Aggregations" | "Temporal & Lag" | "Compound Interactions";
  desc: string;
}

const ALL_47_FEATURES: FeatureDef[] = [
  // Category 1: Basic Derived (12)
  {
    name: "cost_revision_ratio",
    category: "Basic Derived",
    desc: "Ratio of revised sanctioned cost to original baseline cost (revised / original).",
  },
  {
    name: "expenditure_ratio",
    category: "Basic Derived",
    desc: "Ratio of cumulative expenditure consumed relative to total revised budget.",
  },
  {
    name: "project_age_months",
    category: "Basic Derived",
    desc: "Elapsed calendar duration in months since sanctioned project start date.",
  },
  {
    name: "planned_duration_months",
    category: "Basic Derived",
    desc: "Approved baseline project schedule timeline in months.",
  },
  {
    name: "elapsed_ratio",
    category: "Basic Derived",
    desc: "Fraction of planned project timeline already consumed (age / planned duration).",
  },
  {
    name: "burn_rate",
    category: "Basic Derived",
    desc: "Monthly capital expenditure velocity in ₹ Crore per month.",
  },
  {
    name: "budget_remaining_ratio",
    category: "Basic Derived",
    desc: "Unutilized capital allocation buffer remaining to project completion.",
  },
  {
    name: "physical_financial_gap",
    category: "Basic Derived",
    desc: "Difference between physical progress % and financial expenditure %.",
  },
  {
    name: "milestone_completion_rate",
    category: "Basic Derived",
    desc: "Fraction of statutory MoSPI target milestones successfully achieved.",
  },
  {
    name: "land_cost_ratio",
    category: "Basic Derived",
    desc: "Land acquisition expenditure fraction of total sanctioned project cost.",
  },
  {
    name: "annual_expenditure_growth",
    category: "Basic Derived",
    desc: "Year-over-year capital disbursement ratio between current and previous fiscal year.",
  },
  {
    name: "cost_per_month",
    category: "Basic Derived",
    desc: "Expected average capital expenditure required per planned month.",
  },

  // Category 2: Statistical Aggregation (10)
  {
    name: "sector_avg_cost_overrun",
    category: "Statistical Aggregations",
    desc: "Historical average percentage cost escalation across projects in the sector.",
  },
  {
    name: "sector_avg_time_overrun",
    category: "Statistical Aggregations",
    desc: "Historical average project delay in months across the specific sector.",
  },
  {
    name: "ministry_avg_overrun",
    category: "Statistical Aggregations",
    desc: "Historical average cost variance across projects of the nodal ministry.",
  },
  {
    name: "agency_historical_performance",
    category: "Statistical Aggregations",
    desc: "Historical on-time & on-budget reliability score of the implementing agency.",
  },
  {
    name: "agency_project_count",
    category: "Statistical Aggregations",
    desc: "Total concurrent project workload scale handled by the implementing agency.",
  },
  {
    name: "state_project_success_rate",
    category: "Statistical Aggregations",
    desc: "Historical project on-time completion rate in the host state/UT.",
  },
  {
    name: "sector_completion_rate",
    category: "Statistical Aggregations",
    desc: "Empirical ratio of projects completed without delay in the sector.",
  },
  {
    name: "sector_median_duration",
    category: "Statistical Aggregations",
    desc: "Median planned execution duration in months across the sector.",
  },
  {
    name: "cost_category_overrun_avg",
    category: "Statistical Aggregations",
    desc: "Historical variance average for projects in the same capital outlay tier.",
  },
  {
    name: "approval_cohort_performance",
    category: "Statistical Aggregations",
    desc: "Historical performance baseline of projects approved in the same fiscal year.",
  },

  // Category 3: Temporal / Lag (15)
  {
    name: "expenditure_growth_3m",
    category: "Temporal & Lag",
    desc: "Rolling 3-month capital expenditure acceleration velocity.",
  },
  {
    name: "expenditure_growth_6m",
    category: "Temporal & Lag",
    desc: "Rolling 6-month capital expenditure acceleration velocity.",
  },
  {
    name: "progress_velocity_3m",
    category: "Temporal & Lag",
    desc: "Physical civil progress achieved over the preceding 3 months.",
  },
  {
    name: "progress_velocity_6m",
    category: "Temporal & Lag",
    desc: "Physical civil progress achieved over the preceding 6 months.",
  },
  {
    name: "cost_revision_count",
    category: "Temporal & Lag",
    desc: "Total count of formal administrative cost sanction resets.",
  },
  {
    name: "schedule_revision_count",
    category: "Temporal & Lag",
    desc: "Total count of formal project target date extensions approved.",
  },
  {
    name: "cost_revision_acceleration",
    category: "Temporal & Lag",
    desc: "Second derivative change rate between successive cost revisions.",
  },
  {
    name: "milestone_achievement_trend",
    category: "Temporal & Lag",
    desc: "Acceleration or deceleration trend in milestone completion frequency.",
  },
  {
    name: "expenditure_seasonality",
    category: "Temporal & Lag",
    desc: "Fiscal Q4 surge ratio detecting budget dumping vs steady civil progress.",
  },
  {
    name: "progress_stagnation_months",
    category: "Temporal & Lag",
    desc: "Consecutive months where physical progress changed by less than 1%.",
  },
  {
    name: "months_since_last_revision",
    category: "Temporal & Lag",
    desc: "Months elapsed since the last formal administrative baseline reset.",
  },
  {
    name: "expenditure_lag_1m",
    category: "Temporal & Lag",
    desc: "One-month lagged cumulative expenditure baseline snapshot.",
  },
  {
    name: "expenditure_lag_2m",
    category: "Temporal & Lag",
    desc: "Two-month lagged cumulative expenditure baseline snapshot.",
  },
  {
    name: "progress_lag_1m",
    category: "Temporal & Lag",
    desc: "One-month lagged physical civil completion percentage.",
  },
  {
    name: "progress_lag_2m",
    category: "Temporal & Lag",
    desc: "Two-month lagged physical civil completion percentage.",
  },

  // Category 4: Interaction (10)
  {
    name: "sector_cost_risk",
    category: "Compound Interactions",
    desc: "Sector average cost overrun multiplied by the capital size tier risk.",
  },
  {
    name: "size_duration_ratio",
    category: "Compound Interactions",
    desc: "Original budget density per planned month of project execution.",
  },
  {
    name: "age_progress_ratio",
    category: "Compound Interactions",
    desc: "Physical progress achieved relative to expected elapsed project schedule.",
  },
  {
    name: "cost_ratio_x_progress",
    category: "Compound Interactions",
    desc: "Cost revision ratio amplified by remaining unfinished physical works %.",
  },
  {
    name: "burn_sustainability",
    category: "Compound Interactions",
    desc: "Estimated months of remaining budget viability at the current burn rate.",
  },
  {
    name: "milestone_time_feasibility",
    category: "Compound Interactions",
    desc: "Milestone completion deficit weighted by remaining project lifecycle.",
  },
  {
    name: "financial_gap_x_overrun",
    category: "Compound Interactions",
    desc: "Physical-financial divergence amplified by prior cost revision magnitude.",
  },
  {
    name: "compound_risk",
    category: "Compound Interactions",
    desc: "Sector delay volatility multiplied by implementing agency delivery risk.",
  },
  {
    name: "expenditure_timing",
    category: "Compound Interactions",
    desc: "Disparity between financial budget spent and schedule time consumed.",
  },
  {
    name: "progress_deviation",
    category: "Compound Interactions",
    desc: "Empirical civil progress deviation from standard infrastructure S-curve.",
  },
];

export default function FeatureVariablesModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("ALL");
  const [copied, setCopied] = useState(false);

  const categories = [
    "ALL",
    "Basic Derived",
    "Statistical Aggregations",
    "Temporal & Lag",
    "Compound Interactions",
  ];

  const filteredFeatures = ALL_47_FEATURES.filter((f) => {
    const matchesCat = selectedCat === "ALL" || f.category === selectedCat;
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.desc.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopyAll = () => {
    const text = ALL_47_FEATURES.map((f, i) => `${i + 1}. ${f.name} (${f.category}): ${f.desc}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Trigger Button displayed in Pillar 2 Card */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full mt-3 px-3 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-900 text-xs font-semibold flex items-center justify-between transition-colors shadow-2xs group"
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-orange-600" />
          <span>View All 47 Feature Names</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white text-orange-800 border border-orange-200 group-hover:bg-orange-600 group-hover:text-white transition-colors">
          47 Variables
        </span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-4xl max-h-[88vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-orange-100 text-orange-800 border border-orange-200">
                    STAGE 02 • FEATURE STORE
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    {ALL_47_FEATURES.length} Engineered Predictors
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  47 Engineered Machine Learning Feature Taxonomy
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy All</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Bar & Search */}
            <div className="p-4 border-b border-slate-100 bg-white space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter feature by name or description (e.g. burn_rate, lag, milestone)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCat(cat)}
                    className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 text-xs ${
                      selectedCat === cat
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                    {cat === "ALL"
                      ? ` (47)`
                      : ` (${ALL_47_FEATURES.filter((f) => f.category === cat).length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature List (Scrollable Area) */}
            <div className="p-6 overflow-y-auto flex-1 divide-y divide-slate-100 space-y-1">
              {filteredFeatures.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No features found matching &ldquo;{search}&rdquo;
                </div>
              ) : (
                filteredFeatures.map((feat, idx) => {
                  const categoryBadgeColor = {
                    "Basic Derived": "bg-orange-50 text-orange-700 border-orange-200",
                    "Statistical Aggregations": "bg-blue-50 text-blue-700 border-blue-200",
                    "Temporal & Lag": "bg-emerald-50 text-emerald-700 border-emerald-200",
                    "Compound Interactions": "bg-purple-50 text-purple-700 border-purple-200",
                  }[feat.category];

                  return (
                    <div
                      key={feat.name}
                      className="py-3 px-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 hover:bg-slate-50/70 rounded-lg transition-colors"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {feat.name}
                          </code>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${categoryBadgeColor}`}
                          >
                            {feat.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        Var #{ALL_47_FEATURES.findIndex((f) => f.name === feat.name) + 1}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>MoSPI PAIMANA Standard Model Feature Space</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

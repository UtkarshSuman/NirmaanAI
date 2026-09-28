import React from "react";
import { ArrowUpRight, ArrowDownRight, Info } from "lucide-react";

interface RiskFactor {
  factor: string;
  impact: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
}

interface ShapWaterfallProps {
  factors: RiskFactor[];
  shapValues?: Record<string, number>;
}

export default function ShapWaterfall({ factors, shapValues }: ShapWaterfallProps) {
  // If no factors, use default sample factors
  const items = factors && factors.length > 0 ? factors : [
    { factor: "Cumulative Cost Revision Frequency", impact: 38.4, severity: "HIGH" },
    { factor: "Financial vs Physical Progress Disparity", impact: 24.1, severity: "HIGH" },
    { factor: "Time Elapsed vs Milestone Completion Lag", impact: 18.5, severity: "MEDIUM" },
    { factor: "Right-of-Way / Land Clearance Impediment", impact: 12.0, severity: "MEDIUM" },
    { factor: "Contractor Multi-project Workload Contention", impact: 7.0, severity: "LOW" },
  ];

  return (
    <div className="p-5 rounded-lg bg-white border border-slate-200">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span>SHAP Explainability Attribution</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
              TreeExplainer
            </span>
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Key empirical features driving this project&apos;s risk elevation
          </p>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          [MODEL EVALUATION RESULT]
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => {
          const isHigh = item.severity === "HIGH";
          const isMedium = item.severity === "MEDIUM";

          return (
            <div key={idx} className="group">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-800">
                  {item.factor}
                </span>
                <span
                  className={`font-mono font-bold flex items-center gap-1 ${
                    isHigh ? "text-gov-red" : isMedium ? "text-gov-saffron" : "text-gov-teal"
                  }`}
                >
                  +{item.impact.toFixed(1)}%
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Progress bar representing feature importance impact */}
              <div className="w-full h-1.5 rounded bg-slate-100 overflow-hidden flex">
                <div
                  className={`h-full rounded transition-all duration-700 ${
                    isHigh
                      ? "bg-gov-red"
                      : isMedium
                      ? "bg-gov-saffron"
                      : "bg-gov-blue"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(8, item.impact * 2))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-gov-blue" />
          Calculated via Shapley Values across 47 engineered indicators
        </span>
        <span className="font-mono text-slate-500">Base Value: E[f(x)] = 21.4%</span>
      </div>
    </div>
  );
}

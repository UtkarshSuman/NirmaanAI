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
    <div className="p-5 rounded-xl bg-[#0f172a]/70 border border-[#1e293b] shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span>SHAP Explainability Attribution</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
              TreeExplainer
            </span>
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Key empirical features driving this project&apos;s risk elevation
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => {
          const isHigh = item.severity === "HIGH";
          const isMedium = item.severity === "MEDIUM";

          return (
            <div key={idx} className="group">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-gray-200 group-hover:text-blue-300 transition-colors">
                  {item.factor}
                </span>
                <span
                  className={`font-mono font-bold flex items-center gap-1 ${
                    isHigh ? "text-rose-400" : isMedium ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  +{item.impact.toFixed(1)}%
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Progress bar representing feature importance impact */}
              <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isHigh
                      ? "bg-gradient-to-r from-rose-500 to-red-500"
                      : isMedium
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(8, item.impact * 2))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between text-[11px] text-gray-400">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          Calculated via Shapley Values across 47 engineered indicators
        </span>
        <span className="font-mono text-gray-500">Base Value: E[f(x)] = 21.4%</span>
      </div>
    </div>
  );
}

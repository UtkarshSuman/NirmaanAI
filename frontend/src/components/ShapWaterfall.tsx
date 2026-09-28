import React from "react";
import { Info } from "lucide-react";

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
  const hasFactors = factors && factors.length > 0;

  return (
    <div className="p-5 rounded bg-white border border-slate-200">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <div>
          <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span>SHAP Explainability Attribution</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-medium border border-slate-200">
              TreeExplainer
            </span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Key empirical features driving this project&apos;s risk elevation
          </p>
        </div>
        <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          [MODEL EVALUATION RESULT]
        </span>
      </div>

      {!hasFactors ? (
        <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded border border-dashed border-slate-200">
          SHAP feature importance attribution is currently unavailable for this project record.
        </div>
      ) : (
        <div className="space-y-3">
          {factors.map((item, idx) => {
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
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded overflow-hidden">
                  <div
                    className={`h-full rounded transition-all duration-500 ${
                      isHigh ? "bg-gov-red" : isMedium ? "bg-gov-saffron" : "bg-gov-teal"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, item.impact))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-gov-blue shrink-0" />
          <span>Calculated via Shapley additive explanations across feature set</span>
        </span>
        <span className="font-mono text-slate-400">Provenance: Model Artifact</span>
      </div>
    </div>
  );
}

import React from "react";

interface RiskGaugeProps {
  score: number; // 0 - 100
  category?: string;
  size?: "sm" | "md" | "lg";
}

export default function RiskGauge({ score, category, size = "md" }: RiskGaugeProps) {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));

  let strokeColor = "#059669"; // Emerald
  let bgClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let label = category || "LOW";

  if (normalizedScore >= 70) {
    strokeColor = "#dc2626"; // Red
    bgClass = "bg-rose-50 text-rose-700 border-rose-200";
    label = category || "CRITICAL";
  } else if (normalizedScore >= 45) {
    strokeColor = "#ea580c"; // Orange
    bgClass = "bg-orange-50 text-orange-700 border-orange-200";
    label = category || "HIGH";
  } else if (normalizedScore >= 25) {
    strokeColor = "#d97706"; // Amber
    bgClass = "bg-amber-50 text-amber-800 border-amber-200";
    label = category || "MODERATE";
  }

  const dimensions = {
    sm: { radius: 26, stroke: 5, width: 68, height: 68, text: "text-sm font-bold" },
    md: { radius: 44, stroke: 7, width: 110, height: 110, text: "text-2xl font-bold" },
    lg: { radius: 64, stroke: 9, width: 156, height: 156, text: "text-4xl font-bold" },
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="relative flex items-center justify-center">
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="transform -rotate-90 drop-shadow-sm"
        >
          {/* Subtle Outer Track */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.height / 2}
            r={dimensions.radius}
            stroke="#e2e8f0"
            strokeWidth={dimensions.stroke}
            fill="transparent"
          />
          {/* Value Progress Stroke */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.height / 2}
            r={dimensions.radius}
            stroke={strokeColor}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            fill="transparent"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`${dimensions.text} text-slate-900 font-mono tracking-tight leading-none`}>
            {normalizedScore}
          </span>
          {size !== "sm" && <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">INDEX</span>}
        </div>
      </div>

      <span
        className={`mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border font-mono ${bgClass}`}
      >
        {label}
      </span>
    </div>
  );
}

import React from "react";

interface RiskGaugeProps {
  score?: number | null; // 0 - 100
  category?: string;
  size?: "sm" | "md" | "lg";
}

export default function RiskGauge({ score, category, size = "md" }: RiskGaugeProps) {
  const isAvailable = typeof score === "number" && !isNaN(score);
  const normalizedScore = isAvailable ? Math.min(100, Math.max(0, Math.round(score))) : 0;

  let strokeColor = "#94a3b8"; // Slate
  let bgClass = "bg-slate-100 text-slate-700 border-slate-200";
  let label = category || (isAvailable ? "ON TRACK" : "UNCLASSIFIED");

  if (isAvailable) {
    if (normalizedScore >= 70) {
      strokeColor = "#c63f32"; // Restrained Red
      bgClass = "bg-red-50 text-red-800 border-red-200";
      label = category || "CRITICAL";
    } else if (normalizedScore >= 45) {
      strokeColor = "#e97824"; // Saffron
      bgClass = "bg-orange-50 text-orange-800 border-orange-200";
      label = category || "HIGH";
    } else if (normalizedScore >= 25) {
      strokeColor = "#d97706"; // Amber
      bgClass = "bg-amber-50 text-amber-800 border-amber-200";
      label = category || "MODERATE";
    } else {
      strokeColor = "#178b7a"; // Gov Teal
      bgClass = "bg-teal-50 text-teal-800 border-teal-200";
      label = category || "LOW";
    }
  }

  const dimensions = {
    sm: { radius: 26, stroke: 4, width: 64, height: 64, text: "text-sm font-bold" },
    md: { radius: 42, stroke: 6, width: 104, height: 104, text: "text-2xl font-bold" },
    lg: { radius: 60, stroke: 8, width: 148, height: 148, text: "text-4xl font-bold" },
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = isAvailable ? circumference - (normalizedScore / 100) * circumference : circumference;

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="relative flex items-center justify-center">
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="transform -rotate-90"
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
            {isAvailable ? normalizedScore : "N/A"}
          </span>
          {size !== "sm" && <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">INDEX</span>}
        </div>
      </div>

      <span
        className={`mt-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border font-mono ${bgClass}`}
      >
        {label}
      </span>
    </div>
  );
}

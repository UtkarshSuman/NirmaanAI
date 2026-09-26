import React from "react";

interface RiskGaugeProps {
  score: number; // 0 - 100
  category?: string;
  size?: "sm" | "md" | "lg";
}

export default function RiskGauge({ score, category, size = "md" }: RiskGaugeProps) {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));

  let strokeColor = "#10b981"; // Emerald
  let bgClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  let label = category || "LOW";

  if (normalizedScore >= 70) {
    strokeColor = "#f43f5e"; // Rose
    bgClass = "bg-rose-500/15 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/10";
    label = category || "CRITICAL";
  } else if (normalizedScore >= 45) {
    strokeColor = "#f59e0b"; // Amber
    bgClass = "bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10";
    label = category || "HIGH";
  } else if (normalizedScore >= 25) {
    strokeColor = "#eab308"; // Yellow
    bgClass = "bg-yellow-500/10 text-yellow-300 border-yellow-500/30";
    label = category || "MODERATE";
  }

  const dimensions = {
    sm: { radius: 26, stroke: 5, width: 68, height: 68, text: "text-sm font-bold" },
    md: { radius: 44, stroke: 7, width: 110, height: 110, text: "text-2xl font-black" },
    lg: { radius: 64, stroke: 9, width: 156, height: 156, text: "text-4xl font-black" },
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="relative flex items-center justify-center">
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="transform -rotate-90 drop-shadow-md"
        >
          {/* Subtle Outer Track */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.height / 2}
            r={dimensions.radius}
            stroke="#1e293b"
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
            className="transition-all duration-1000 ease-out"
            fill="transparent"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`${dimensions.text} text-white font-mono tracking-tight leading-none`}>
            {normalizedScore}
          </span>
          {size !== "sm" && <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">INDEX</span>}
        </div>
      </div>

      <span
        className={`mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${bgClass}`}
      >
        {label}
      </span>
    </div>
  );
}

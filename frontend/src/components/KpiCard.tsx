import React from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  accentColor?: "blue" | "emerald" | "amber" | "rose" | "indigo" | "cyan";
}

const colorMap = {
  blue: {
    border: "border-blue-500/20 hover:border-blue-500/40",
    glow: "hover:shadow-blue-500/10",
    iconBg: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    value: "text-white",
    bar: "from-blue-500 to-indigo-500",
  },
  emerald: {
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    glow: "hover:shadow-emerald-500/10",
    iconBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    value: "text-emerald-400",
    bar: "from-emerald-500 to-teal-500",
  },
  amber: {
    border: "border-amber-500/20 hover:border-amber-500/40",
    glow: "hover:shadow-amber-500/10",
    iconBg: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    value: "text-amber-400",
    bar: "from-amber-500 to-yellow-500",
  },
  rose: {
    border: "border-rose-500/20 hover:border-rose-500/40",
    glow: "hover:shadow-rose-500/10",
    iconBg: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    value: "text-rose-400",
    bar: "from-rose-500 to-red-500",
  },
  indigo: {
    border: "border-indigo-500/20 hover:border-indigo-500/40",
    glow: "hover:shadow-indigo-500/10",
    iconBg: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    value: "text-indigo-400",
    bar: "from-indigo-500 to-purple-500",
  },
  cyan: {
    border: "border-cyan-500/20 hover:border-cyan-500/40",
    glow: "hover:shadow-cyan-500/10",
    iconBg: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    value: "text-cyan-400",
    bar: "from-cyan-500 to-sky-500",
  },
};

export default function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = "blue",
}: KpiCardProps) {
  const colors = colorMap[accentColor];

  return (
    <div
      className={`relative p-5 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-900/40 backdrop-blur-md border ${colors.border} shadow-lg ${colors.glow} flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group overflow-hidden`}
    >
      {/* Top subtle highlight line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${colors.bar} opacity-70 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className={`text-2xl lg:text-[26px] font-extrabold mt-1.5 tracking-tight font-mono ${colors.value}`}>
            {value}
          </h3>
        </div>
        <div className={`p-2.5 rounded-xl ${colors.iconBg} shadow-sm group-hover:scale-105 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="truncate pr-1 text-[11px] text-slate-400">{subtitle}</span>
        {trend && (
          <span
            className={`font-semibold text-[11px] px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0 ${
              trend.isPositive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}
          >
            {trend.isPositive ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
            <span>{trend.value}</span>
          </span>
        )}
      </div>
    </div>
  );
}

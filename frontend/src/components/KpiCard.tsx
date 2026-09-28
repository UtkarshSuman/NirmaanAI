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
    border: "border-slate-200 hover:border-blue-300",
    iconBg: "bg-blue-50 text-blue-700 border border-blue-200",
    value: "text-slate-900",
    indicator: "bg-blue-600",
  },
  emerald: {
    border: "border-slate-200 hover:border-emerald-300",
    iconBg: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    value: "text-slate-900",
    indicator: "bg-emerald-600",
  },
  amber: {
    border: "border-slate-200 hover:border-amber-300",
    iconBg: "bg-amber-50 text-amber-700 border border-amber-200",
    value: "text-slate-900",
    indicator: "bg-amber-600",
  },
  rose: {
    border: "border-slate-200 hover:border-rose-300",
    iconBg: "bg-rose-50 text-rose-700 border border-rose-200",
    value: "text-slate-900",
    indicator: "bg-rose-600",
  },
  indigo: {
    border: "border-slate-200 hover:border-indigo-300",
    iconBg: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    value: "text-slate-900",
    indicator: "bg-indigo-600",
  },
  cyan: {
    border: "border-slate-200 hover:border-sky-300",
    iconBg: "bg-sky-50 text-sky-700 border border-sky-200",
    value: "text-slate-900",
    indicator: "bg-sky-600",
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
  const colors = colorMap[accentColor] || colorMap.blue;

  return (
    <div
      className={`relative p-5 rounded-xl bg-white border ${colors.border} shadow-sm flex flex-col justify-between transition-all duration-200 hover:shadow group overflow-hidden`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className={`text-2xl lg:text-[26px] font-bold mt-1 tracking-tight font-mono ${colors.value}`}>
            {value}
          </h3>
        </div>
        <div className={`p-2.5 rounded-lg ${colors.iconBg} shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="truncate pr-1 text-[11px] text-slate-600 font-medium">{subtitle}</span>
        {trend && (
          <span
            className={`font-semibold text-[11px] px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0 ${
              trend.isPositive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

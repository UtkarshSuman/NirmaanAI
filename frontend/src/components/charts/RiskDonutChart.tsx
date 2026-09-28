"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ShieldAlert, AlertTriangle, ShieldCheck, CheckCircle } from "lucide-react";

interface RiskDistributionProps {
  critical: number;
  high: number;
  moderate: number;
  low: number;
  totalClassified?: number;
}

const TIER_CONFIG = [
  {
    name: "Critical Escalation",
    key: "critical",
    color: "#dc2626", // Red-600
    subColor: "#fef2f2",
    icon: ShieldAlert,
    desc: "Composite risk score ≥ 70 / Overrun probability > 80%",
  },
  {
    name: "High Watchlist",
    key: "high",
    color: "#ea580c", // Orange-600
    subColor: "#fff7ed",
    icon: AlertTriangle,
    desc: "Composite risk score 50–69 / Approaching key milestones",
  },
  {
    name: "Moderate Variance",
    key: "moderate",
    color: "#d97706", // Amber-600
    subColor: "#fffbeb",
    icon: ShieldCheck,
    desc: "Composite risk score 30–49 / Minor schedule slips",
  },
  {
    name: "Low Risk / Stable",
    key: "low",
    color: "#059669", // Emerald-600
    subColor: "#ecfdf5",
    icon: CheckCircle,
    desc: "Composite risk score < 30 / Execution within tolerance",
  },
];

export default function RiskDonutChart({
  critical,
  high,
  moderate,
  low,
  totalClassified,
}: RiskDistributionProps) {
  const total = totalClassified ?? (critical + high + moderate + low || 1);

  const data = [
    { name: "Critical Escalation", value: critical, color: "#dc2626", key: "critical" },
    { name: "High Watchlist", value: high, color: "#ea580c", key: "high" },
    { name: "Moderate Variance", value: moderate, color: "#d97706", key: "moderate" },
    { name: "Low Risk / Stable", value: low, color: "#059669", key: "low" },
  ].filter((d) => d.value > 0);

  const criticalRate = ((critical / total) * 100).toFixed(1);
  const highRiskTotal = critical + high;
  const highRiskRate = (((critical + high) / total) * 100).toFixed(1);

  return (
    <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            Predictive Risk Distribution
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Stacking ensemble classification of {total.toLocaleString()} monitored assets
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-rose-700 font-mono bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            {highRiskRate}% at elevated risk
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Donut Chart Visual */}
        <div className="md:col-span-5 relative flex items-center justify-center min-h-[190px]">
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0];
                    const pct = (((item.value as number) / total) * 100).toFixed(1);
                    return (
                      <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-slate-800">
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-slate-300 font-mono mt-0.5">
                          {item.value} Projects ({pct}%)
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={data}
                innerRadius={52}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                stroke="#ffffff"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold font-serif text-slate-900 leading-none">
              {highRiskTotal}
            </span>
            <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider mt-0.5">
              High / Crit
            </span>
            <span className="text-[9px] text-slate-400 font-mono">
              of {total}
            </span>
          </div>
        </div>

        {/* Legend Breakdown */}
        <div className="md:col-span-7 space-y-2">
          {TIER_CONFIG.map((tier) => {
            const count =
              tier.key === "critical"
                ? critical
                : tier.key === "high"
                ? high
                : tier.key === "moderate"
                ? moderate
                : low;
            const pct = ((count / total) * 100).toFixed(1);
            const IconComponent = tier.icon;

            return (
              <div
                key={tier.key}
                className="flex items-center justify-between p-2 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: tier.color }}
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block leading-tight">
                      {tier.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {tier.desc}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <div className="text-xs font-mono font-bold text-slate-900">
                    {count.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    {pct}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

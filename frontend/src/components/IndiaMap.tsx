"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// ============================================================================
// ARCHITECTURAL DISTINCTION:
// STATIC GEOMETRY: SVG vector paths and coordinates in `indiaMapPaths.ts`
// vs
// CURRENT PORTFOLIO DATA: All project counts, financial outlays, risk tiers,
// delays, and state dossiers are dynamically queried from `/api/states`
// ============================================================================
import {
  INDIA_MAP_PATHS,
  MAP_VIEWBOX,
  MAP_WIDTH,
  MAP_HEIGHT,
  StateMapPath,
} from "@/lib/indiaMapPaths";
import {
  MapPin,
  TrendingUp,
  AlertTriangle,
  Building2,
  Clock,
  IndianRupee,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Plus,
  Minus,
  Navigation,
} from "lucide-react";

export interface StateData {
  state: string;
  stateHindi: string;
  region: string;
  capital: string;
  projectCount: number;
  originalCostCrore: number;
  revisedCostCrore: number;
  cumulativeExpenditureCrore: number;
  netEscalationCrore: number;
  avgCostOverrunPercent: number;
  avgDelayMonths: number;
  avgPhysicalProgressPercent: number;
  avgFinancialProgressPercent: number;
  delayedProjectsCount: number;
  delayedProjectsPercent: number;
  criticalProjectsCount: number;
  riskTier: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  topProjects: {
    id: string;
    projectId: string;
    projectName: string;
    sector: string;
    revisedCostCrore: number;
    costOverrunPercent: number;
    timeOverrunMonths: number;
    physicalProgressPercent: number;
    implementingAgency: string;
    projectStatus: string;
  }[];
}

interface IndiaMapProps {
  initialSelectedState?: string;
  onSelectState?: (stateName: string) => void;
  className?: string;
  variant?: "full" | "hero";
  hideDossier?: boolean;
}

// Major cities for geography context
const MAJOR_CITIES = [
  { name: "Delhi", x: 255, y: 220 },
  { name: "Mumbai", x: 175, y: 440 },
  { name: "Kolkata", x: 480, y: 350 },
  { name: "Bengaluru", x: 235, y: 550 },
  { name: "Chennai", x: 295, y: 545 },
];

export default function IndiaMap({
  initialSelectedState = "Uttar Pradesh",
  onSelectState,
  className = "",
  variant = "full",
  hideDossier = false,
}: IndiaMapProps) {
  const router = useRouter();
  const [statesData, setStatesData] = useState<Record<string, StateData>>({});
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string>(initialSelectedState);
  const [hoveredState, setHoveredState] = useState<StateMapPath | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<"projects" | "risk" | "outlay">("projects");
  const [activeRegion, setActiveRegion] = useState<string>("ALL");

  // Fetch state aggregated data from API
  useEffect(() => {
    async function loadStateData() {
      try {
        const res = await fetch("/api/states");
        if (res.ok) {
          const json = await res.json();
          const map: Record<string, StateData> = {};
          for (const s of json.states) {
            map[s.state] = s;
          }
          setStatesData(map);
        }
      } catch (err) {
        console.error("Failed to load states analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStateData();
  }, []);

  const handleStateClick = (stateName: string) => {
    setSelectedState(stateName);
    if (onSelectState) {
      onSelectState(stateName);
    }
  };

  const handleMouseMove = (e: React.MouseEvent, state: StateMapPath) => {
    const rect = e.currentTarget.closest("svg")?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    setHoveredState(state);
  };

  // Max calculations for color scales
  const maxProjects = useMemo(() => {
    const counts = Object.values(statesData).map((s) => s.projectCount);
    return Math.max(...counts, 187);
  }, [statesData]);

  const maxOutlay = useMemo(() => {
    const outlays = Object.values(statesData).map((s) => s.revisedCostCrore);
    return Math.max(...outlays, 50000);
  }, [statesData]);

  // Restrained color generator adhering to observatory palette
  const getStateColor = (stateName: string, isSelected: boolean) => {
    const s = statesData[stateName];
    if (!s) {
      return "#f1f5f9"; // fallback light slate
    }

    if (activeRegion !== "ALL" && s.region !== activeRegion) {
      return "#f8fafc"; // dimmed outside active region
    }

    if (viewMode === "projects") {
      const ratio = s.projectCount / maxProjects;
      if (ratio > 0.6) return isSelected ? "#1d6fa5" : "#38bdf8"; // High
      if (ratio > 0.35) return isSelected ? "#173f5f" : "#7dd3fc"; // Med-High
      if (ratio > 0.18) return isSelected ? "#0284c7" : "#bae6fd"; // Med
      if (ratio > 0.05) return isSelected ? "#38bdf8" : "#e0f2fe"; // Low-Med
      return isSelected ? "#cbd5e1" : "#f1f5f9"; // Minimal
    } else if (viewMode === "risk") {
      if (s.riskTier === "CRITICAL") return isSelected ? "#c63f32" : "#fca5a5"; // Restrained Red
      if (s.riskTier === "HIGH") return isSelected ? "#e97824" : "#fdba74"; // Saffron
      if (s.riskTier === "MODERATE") return isSelected ? "#d97706" : "#fde047"; // Amber
      return isSelected ? "#178b7a" : "#99f6e4"; // Teal On-Track
    } else {
      // Outlay mode
      const ratio = s.revisedCostCrore / maxOutlay;
      if (ratio > 0.6) return isSelected ? "#0d9488" : "#2dd4bf";
      if (ratio > 0.35) return isSelected ? "#14b8a6" : "#5eead4";
      if (ratio > 0.15) return isSelected ? "#1d6fa5" : "#a5f3fc";
      return isSelected ? "#64748b" : "#e2e8f0";
    }
  };

  const selectedData = statesData[selectedState];

  return (
    <div
      className={`${
        variant === "hero" ? "p-0 bg-transparent border-0" : "p-4 sm:p-6 bg-white border border-slate-200 rounded-lg shadow-2xs"
      } ${className}`}
    >
      {/* Header & Controls Bar - Only in full variant */}
      {variant === "full" && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded border border-orange-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Geo-Spatial Observatory
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Central Sector Projects (≥ ₹150 Cr)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              State &amp; Union Territory Infrastructure Matrix
            </h2>
          </div>

          {/* Compact View Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-100 p-0.5 rounded border border-slate-200 flex items-center text-xs">
              <button
                onClick={() => setViewMode("projects")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  viewMode === "projects"
                    ? "bg-white text-slate-900 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Project Density
              </button>
              <button
                onClick={() => setViewMode("risk")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  viewMode === "risk"
                    ? "bg-white text-rose-700 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Risk &amp; Slippage
              </button>
              <button
                onClick={() => setViewMode("outlay")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  viewMode === "outlay"
                    ? "bg-white text-emerald-800 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Capital Outlay
              </button>
            </div>

            {/* Quick State Selector Dropdown */}
            <select
              value={selectedState}
              onChange={(e) => handleStateClick(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium"
            >
              {Object.keys(statesData)
                .sort()
                .map((st) => (
                  <option key={st} value={st}>
                    {st} ({statesData[st]?.projectCount || 0})
                  </option>
                ))}
            </select>
          </div>
        </div>
      )}

      {/* Region Filter Pills - Only in full variant */}
      {variant === "full" && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-slate-100 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Zone:</span>
          {["ALL", "North", "South", "West", "East", "Central", "North-East"].map((reg) => (
            <button
              key={reg}
              onClick={() => setActiveRegion(reg)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                activeRegion === reg
                  ? "bg-slate-900 text-white font-bold"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
            >
              {reg === "ALL" ? "All India (36)" : `${reg} Zone`}
            </button>
          ))}

          <button
            onClick={() => {
              setActiveRegion("ALL");
              setSelectedState("Uttar Pradesh");
            }}
            className="ml-auto text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      )}

      {/* Main Map + Dossier Grid */}
      <div
        className={
          variant === "hero" || hideDossier
            ? "relative w-full h-full flex flex-col items-center justify-center"
            : "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        }
      >
        {/* Map Canvas Column */}
        <div
          className={`${
            variant === "hero" || hideDossier
              ? "w-full h-full relative flex items-center justify-center"
              : "lg:col-span-7 relative bg-slate-50/50 rounded border border-slate-200 p-4 flex flex-col items-center justify-center overflow-hidden min-h-[460px]"
          }`}
        >
          {/* Subtle Map Legend / Info Overlay in Full Mode */}
          {variant === "full" && (
            <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm px-2.5 py-2 rounded border border-slate-200 text-[10px] space-y-1 shadow-2xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider block">
                {viewMode === "projects" && "Density: Central Sector Projects"}
                {viewMode === "risk" && "Slippage: Critical Overruns"}
                {viewMode === "outlay" && "Allocation: Capital Outlay"}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Low</span>
                <span className="w-14 h-1 rounded-full bg-gradient-to-r from-sky-100 via-sky-300 to-sky-600 mx-1" />
                <span className="text-slate-700 font-semibold">High</span>
              </div>
            </div>
          )}

          {/* Interactive SVG */}
          <div className="w-full max-w-[600px] aspect-[650/720] relative">
            <svg
              viewBox={MAP_VIEWBOX}
              className="w-full h-full drop-shadow-2xs"
              aria-label="Interactive Map of India with 36 States and Union Territories"
            >
              {/* Geographic Context Text Labels */}
              <g className="select-none pointer-events-none text-slate-300 font-serif italic text-[11px] tracking-widest opacity-60">
                <text x="100" y="240" fill="#94a3b8">PAKISTAN</text>
                <text x="440" y="160" fill="#94a3b8">CHINA</text>
                <text x="365" y="270" fill="#94a3b8">NEPAL</text>
                <text x="500" y="260" fill="#94a3b8">BHUTAN</text>
                <text x="500" y="325" fill="#94a3b8">BANGLADESH</text>
                <text x="590" y="370" fill="#94a3b8">MYANMAR</text>
                <text x="80" y="490" fill="#1d6fa5" opacity="0.45" fontSize="11" fontStyle="italic">Arabian Sea</text>
                <text x="470" y="520" fill="#1d6fa5" opacity="0.45" fontSize="11" fontStyle="italic">Bay of Bengal</text>
                <text x="240" y="690" fill="#1d6fa5" opacity="0.45" fontSize="11" fontStyle="italic">Indian Ocean</text>
              </g>

              {/* State Polygons with Understated Boundaries */}
              <g className="transition-all duration-200">
                {INDIA_MAP_PATHS.map((item) => {
                  const isSelected = selectedState === item.name;
                  const isHovered = hoveredState?.name === item.name;
                  const fillColor = getStateColor(item.name, isSelected);

                  return (
                    <path
                      key={item.id}
                      d={item.path}
                      fill={fillColor}
                      stroke={isSelected ? "#e97824" : isHovered ? "#1d6fa5" : "#cbd5e1"}
                      strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 0.7}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      className="cursor-pointer transition-colors duration-150 hover:brightness-95"
                      onMouseEnter={(e) => handleMouseMove(e, item)}
                      onMouseMove={(e) => handleMouseMove(e, item)}
                      onMouseLeave={() => setHoveredState(null)}
                      onClick={() => handleStateClick(item.name)}
                    />
                  );
                })}
              </g>

              {/* Major Cities / Hub Markers */}
              <g className="pointer-events-none select-none">
                {MAJOR_CITIES.map((c) => (
                  <g key={c.name} transform={`translate(${c.x}, ${c.y})`}>
                    <circle r="2.5" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
                    <text
                      x="6"
                      y="3"
                      fill="#0f172a"
                      fontSize="9"
                      fontWeight="bold"
                      className="font-sans opacity-80"
                    >
                      {c.name}
                    </text>
                  </g>
                ))}
              </g>

              {/* State Risk Centroid Markers */}
              <g className="pointer-events-none select-none">
                {INDIA_MAP_PATHS.filter((s) =>
                  [
                    "Uttar Pradesh",
                    "Maharashtra",
                    "Gujarat",
                    "Karnataka",
                    "Tamil Nadu",
                    "Assam",
                    "Rajasthan",
                    "West Bengal",
                    "Odisha",
                    "Bihar",
                  ].includes(s.name)
                ).map((s) => {
                  const sData = statesData[s.name];
                  if (!sData) return null;

                  const dotColor =
                    sData.riskTier === "CRITICAL"
                      ? "#c63f32"
                      : sData.riskTier === "HIGH"
                      ? "#e97824"
                      : sData.riskTier === "MODERATE"
                      ? "#d97706"
                      : "#178b7a";

                  return (
                    <g key={s.id} transform={`translate(${s.centroid[0]}, ${s.centroid[1]})`}>
                      <circle r="3" fill={dotColor} stroke="#ffffff" strokeWidth="1" />
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Dynamic Floating Tooltip */}
            {hoveredState && (
              <div
                className="absolute z-30 pointer-events-none p-2.5 rounded bg-white/95 backdrop-blur-sm border border-slate-200 shadow-md text-xs text-slate-800 space-y-1 transform -translate-x-1/2 -translate-y-full mb-3 min-w-[200px]"
                style={{
                  left: `${tooltipPos.x}px`,
                  top: `${tooltipPos.y - 8}px`,
                }}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{hoveredState.name}</p>
                    <p className="text-[10px] text-orange-700 font-semibold">{hoveredState.hindiName}</p>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                    {hoveredState.region}
                  </span>
                </div>

                {statesData[hoveredState.name] ? (
                  <div className="space-y-0.5 pt-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Monitored Projects:</span>
                      <strong className="text-slate-900 font-mono">
                        {statesData[hoveredState.name].projectCount}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Outlay:</span>
                      <strong className="text-slate-900 font-mono">
                        ₹{(statesData[hoveredState.name].revisedCostCrore / 1000).toFixed(1)}k Cr
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Delayed:</span>
                      <strong className="text-orange-700 font-mono">
                        {statesData[hoveredState.name].delayedProjectsCount} (
                        {statesData[hoveredState.name].delayedProjectsPercent}%)
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cost Overrun:</span>
                      <strong
                        className={`font-mono ${
                          statesData[hoveredState.name].avgCostOverrunPercent > 15
                            ? "text-rose-700"
                            : "text-emerald-700"
                        }`}
                      >
                        +{statesData[hoveredState.name].avgCostOverrunPercent}%
                      </strong>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400">No active Central Sector projects ≥ ₹150 Cr</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected State Infrastructure Dossier (Only in full variant) */}
        {variant === "full" && !hideDossier && (
          <div className="lg:col-span-5 space-y-4">
            {selectedData ? (
              <div className="space-y-4">
                {/* State Summary Block */}
                <div className="p-4 rounded border border-slate-200 bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                          {selectedData.region} Zone
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            selectedData.riskTier === "CRITICAL"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : selectedData.riskTier === "HIGH"
                              ? "bg-orange-50 text-orange-700 border border-orange-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {selectedData.riskTier} Risk
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 mt-1 tracking-tight">
                        {selectedData.state}
                      </h3>
                      <p className="text-xs text-orange-700 font-medium">{selectedData.stateHindi}</p>
                    </div>

                    <Link
                      href={`/projects?state=${encodeURIComponent(selectedData.state)}`}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shrink-0"
                    >
                      <span>View All ({selectedData.projectCount})</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* State Statistics Matrix */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Outlay</span>
                      <strong className="text-slate-900 font-mono text-xs font-bold">
                        ₹{(selectedData.revisedCostCrore / 1000).toFixed(1)}k Cr
                      </strong>
                    </div>

                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Escalation</span>
                      <strong className="text-rose-700 font-mono text-xs font-bold">
                        +₹{selectedData.netEscalationCrore.toLocaleString()} Cr
                      </strong>
                    </div>

                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Delayed</span>
                      <strong className="text-orange-700 font-mono text-xs font-bold">
                        {selectedData.delayedProjectsCount} Projects
                      </strong>
                    </div>

                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Physical Progress</span>
                      <strong className="text-emerald-700 font-mono text-xs font-bold">
                        {selectedData.avgPhysicalProgressPercent}%
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Top Projects Executing in Selected State */}
                <div className="p-4 rounded border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      Key Projects in {selectedData.state}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">≥ ₹150 Cr</span>
                  </div>

                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {selectedData.topProjects && selectedData.topProjects.length > 0 ? (
                      selectedData.topProjects.map((p) => (
                        <Link
                          key={p.projectId}
                          href={`/projects/${p.projectId}`}
                          className="p-2.5 rounded bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-slate-300 transition-colors flex flex-col justify-between block group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                              {p.projectName}
                            </p>
                            <span className="text-[10px] px-1 py-0.2 rounded bg-slate-200/80 text-slate-700 font-mono shrink-0">
                              {p.sector}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                            <span>{p.implementingAgency}</span>
                            <span className="font-mono text-slate-900 font-bold">
                              ₹{p.revisedCostCrore.toLocaleString()} Cr
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-slate-200/60 text-slate-500">
                            <span className={p.costOverrunPercent > 10 ? "text-rose-700 font-semibold" : "text-emerald-700"}>
                              Overrun: +{p.costOverrunPercent}%
                            </span>
                            <span className={p.timeOverrunMonths > 0 ? "text-orange-700 font-semibold" : "text-slate-600"}>
                              Delay: +{p.timeOverrunMonths} mo
                            </span>
                            <span className="text-slate-700">
                              Prog: {p.physicalProgressPercent}%
                            </span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-4">No project details available.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded border border-slate-200 bg-white text-center text-slate-400">
                <Info className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                <p className="text-xs">Select any state on the map to inspect project dossiers.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

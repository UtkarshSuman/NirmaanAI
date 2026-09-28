"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  ZoomIn,
  ZoomOut,
  Compass,
  Layers,
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

// Major cities for geography labels
const MAJOR_CITIES = [
  { name: "Delhi", x: 255, y: 220, isHub: true },
  { name: "Mumbai", x: 175, y: 440, isHub: true },
  { name: "Kolkata", x: 480, y: 350, isHub: true },
  { name: "Bengaluru", x: 235, y: 550, isHub: true },
  { name: "Chennai", x: 295, y: 545, isHub: true },
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

  // Color generator based on mode in light government observatory theme
  const getStateColor = (stateName: string, isSelected: boolean) => {
    const s = statesData[stateName];
    if (!s) {
      return "#f1f5f9"; // fallback light slate
    }

    // Check region filtering
    if (activeRegion !== "ALL" && s.region !== activeRegion) {
      return "#f8fafc"; // dimmed when not in active region
    }

    if (viewMode === "projects") {
      const ratio = s.projectCount / maxProjects;
      if (ratio > 0.6) return isSelected ? "#0284c7" : "#38bdf8"; // High (UP, MH, GJ)
      if (ratio > 0.35) return isSelected ? "#0369a1" : "#7dd3fc"; // Med-High (KA, RJ, TN)
      if (ratio > 0.18) return isSelected ? "#0ea5e9" : "#bae6fd"; // Med (MP, WB, AP, BR)
      if (ratio > 0.05) return isSelected ? "#38bdf8" : "#e0f2fe"; // Low-Med
      return isSelected ? "#cbd5e1" : "#f1f5f9"; // Low
    } else if (viewMode === "risk") {
      if (s.riskTier === "CRITICAL") return isSelected ? "#dc2626" : "#fca5a5"; // Crimson/Light red
      if (s.riskTier === "HIGH") return isSelected ? "#ea580c" : "#fdba74"; // Orange/Light orange
      if (s.riskTier === "MODERATE") return isSelected ? "#d97706" : "#fde047"; // Amber/Light yellow
      return isSelected ? "#059669" : "#86efac"; // On Track Teal/Green
    } else {
      // Outlay mode
      const ratio = s.revisedCostCrore / maxOutlay;
      if (ratio > 0.6) return isSelected ? "#047857" : "#34d399";
      if (ratio > 0.35) return isSelected ? "#0d9488" : "#5eead4";
      if (ratio > 0.15) return isSelected ? "#0284c7" : "#99f6e4";
      return isSelected ? "#64748b" : "#e2e8f0";
    }
  };

  const selectedData = statesData[selectedState];

  return (
    <div
      className={`rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden ${
        variant === "hero" ? "p-0 bg-transparent border-0 shadow-none" : "p-5 lg:p-6"
      } ${className}`}
    >
      {/* Header & Controls Bar - Only in full variant */}
      {variant === "full" && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded border border-orange-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                National Geo-Spatial Intelligence
              </span>
              <span className="text-xs text-slate-500">
                Choropleth of Central Sector Projects (≥ ₹150 Cr)
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>State & Union Territory Infrastructure Matrix</span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Select any state to inspect capital outlays, schedule overruns, and high-priority infrastructure assets.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1">
              <button
                onClick={() => setViewMode("projects")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "projects"
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Project Density
              </button>
              <button
                onClick={() => setViewMode("risk")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "risk"
                    ? "bg-white text-rose-700 shadow-sm border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Risk & Slippage
              </button>
              <button
                onClick={() => setViewMode("outlay")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "outlay"
                    ? "bg-white text-emerald-700 shadow-sm border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Capital Outlay (₹)
              </button>
            </div>

            {/* Quick State Selector Dropdown */}
            <select
              value={selectedState}
              onChange={(e) => handleStateClick(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm font-medium"
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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-5 border-b border-slate-100 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">Zone:</span>
          {["ALL", "North", "South", "West", "East", "Central", "North-East"].map((reg) => (
            <button
              key={reg}
              onClick={() => setActiveRegion(reg)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                activeRegion === reg
                  ? "bg-slate-900 text-white font-semibold shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
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
            className="ml-auto text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Map</span>
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
              : "lg:col-span-7 relative bg-slate-50/60 rounded-xl border border-slate-200/80 p-4 flex flex-col items-center justify-center overflow-hidden min-h-[500px]"
          }`}
        >
          {/* Subtle Map Legend / Info Overlay in Full Mode */}
          {variant === "full" && (
            <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md p-2.5 rounded-lg border border-slate-200 text-[10px] space-y-1 shadow-sm">
              <span className="font-bold text-slate-800 uppercase tracking-wider block">
                {viewMode === "projects" && "Density: Central Sector Projects"}
                {viewMode === "risk" && "Slippage: Critical Overruns"}
                {viewMode === "outlay" && "Allocation: Capital Outlay"}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-slate-500">Low</span>
                <span className="w-16 h-1.5 rounded-full bg-gradient-to-r from-sky-100 via-sky-300 to-sky-600 mx-1" />
                <span className="text-slate-700 font-semibold">High</span>
              </div>
              <div className="text-slate-400 text-[9px]">Click any state to inspect details</div>
            </div>
          )}

          {/* Interactive SVG */}
          <div className="w-full max-w-[620px] aspect-[650/720] relative">
            <svg
              viewBox={MAP_VIEWBOX}
              className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
              aria-label="Interactive Map of India with 36 States and Union Territories"
            >
              <defs>
                <filter id="selectionGlowLight" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="#ea580c" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* Geographic Context Text Labels (Surrounding Neighbors & Oceans) */}
              <g className="select-none pointer-events-none text-slate-300 font-serif italic text-[11px] tracking-widest">
                <text x="100" y="240" fill="#94a3b8">PAKISTAN</text>
                <text x="440" y="160" fill="#94a3b8">CHINA</text>
                <text x="365" y="270" fill="#94a3b8">NEPAL</text>
                <text x="500" y="260" fill="#94a3b8">BHUTAN</text>
                <text x="500" y="325" fill="#94a3b8">BANGLADESH</text>
                <text x="590" y="370" fill="#94a3b8">MYANMAR</text>
                <text x="80" y="490" fill="#0284c7" opacity="0.45" fontSize="12" fontStyle="italic">Arabian Sea</text>
                <text x="470" y="520" fill="#0284c7" opacity="0.45" fontSize="12" fontStyle="italic">Bay of Bengal</text>
                <text x="240" y="690" fill="#0284c7" opacity="0.45" fontSize="12" fontStyle="italic">Indian Ocean</text>
              </g>

              {/* State Polygons */}
              <g className="transition-all duration-300">
                {INDIA_MAP_PATHS.map((item) => {
                  const isSelected = selectedState === item.name;
                  const isHovered = hoveredState?.name === item.name;
                  const fillColor = getStateColor(item.name, isSelected);

                  return (
                    <path
                      key={item.id}
                      d={item.path}
                      fill={fillColor}
                      stroke={isSelected ? "#ea580c" : isHovered ? "#0284c7" : "#cbd5e1"}
                      strokeWidth={isSelected ? 2.5 : isHovered ? 1.75 : 0.8}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      className="cursor-pointer transition-colors duration-150 hover:brightness-95"
                      style={{
                        filter: isSelected ? "url(#selectionGlowLight)" : undefined,
                      }}
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
                    <circle r="3" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" />
                    <text
                      x="7"
                      y="3.5"
                      fill="#0f172a"
                      fontSize="10"
                      fontWeight="bold"
                      className="font-sans"
                    >
                      {c.name}
                    </text>
                  </g>
                ))}
              </g>

              {/* Key State Pin Markers with Project Risk Dots */}
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
                      ? "#dc2626"
                      : sData.riskTier === "HIGH"
                      ? "#ea580c"
                      : sData.riskTier === "MODERATE"
                      ? "#d97706"
                      : "#0d9488";

                  return (
                    <g key={s.id} transform={`translate(${s.centroid[0]}, ${s.centroid[1]})`}>
                      <circle r="4" fill={dotColor} stroke="#ffffff" strokeWidth="1.5" />
                      <circle r="6" fill={dotColor} opacity="0.25" />
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Dynamic Floating Tooltip */}
            {hoveredState && (
              <div
                className="absolute z-30 pointer-events-none p-3 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl text-xs text-slate-800 space-y-1 transform -translate-x-1/2 -translate-y-full mb-3 min-w-[210px]"
                style={{
                  left: `${tooltipPos.x}px`,
                  top: `${tooltipPos.y - 10}px`,
                }}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{hoveredState.name}</p>
                    <p className="text-[10px] text-orange-600 font-semibold">{hoveredState.hindiName}</p>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-medium">
                    {hoveredState.region}
                  </span>
                </div>

                {statesData[hoveredState.name] ? (
                  <div className="space-y-1 pt-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Projects:</span>
                      <strong className="text-slate-900 font-mono font-bold">
                        {statesData[hoveredState.name].projectCount}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Capital Outlay:</span>
                      <strong className="text-slate-900 font-mono font-bold">
                        ₹{(statesData[hoveredState.name].revisedCostCrore / 1000).toFixed(1)}k Cr
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Delayed:</span>
                      <strong className="text-orange-700 font-mono font-semibold">
                        {statesData[hoveredState.name].delayedProjectsCount} (
                        {statesData[hoveredState.name].delayedProjectsPercent}%)
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Avg Cost Overrun:</span>
                      <strong
                        className={`font-mono font-semibold ${
                          statesData[hoveredState.name].avgCostOverrunPercent > 15
                            ? "text-rose-600"
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
                {/* State Header Card */}
                <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                          {selectedData.region} Zone
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                            selectedData.riskTier === "CRITICAL"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : selectedData.riskTier === "HIGH"
                              ? "bg-orange-50 text-orange-700 border-orange-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {selectedData.riskTier} Risk
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 mt-1.5 tracking-tight">
                        {selectedData.state}
                      </h3>
                      <p className="text-xs font-semibold text-orange-700">{selectedData.stateHindi}</p>
                    </div>

                    <Link
                      href={`/projects?state=${encodeURIComponent(selectedData.state)}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm shrink-0"
                    >
                      <span>View All ({selectedData.projectCount})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* State Key Statistics Grid */}
                  <div className="grid grid-cols-2 gap-2.5 mt-4 pt-4 border-t border-slate-100 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 block">Sanctioned Outlay</span>
                      <strong className="text-slate-900 font-mono text-sm font-bold">
                        ₹{(selectedData.revisedCostCrore / 1000).toFixed(1)}k Cr
                      </strong>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Exp: ₹{(selectedData.cumulativeExpenditureCrore / 1000).toFixed(1)}k Cr
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 block">Net Escalation</span>
                      <strong className="text-rose-700 font-mono text-sm font-bold">
                        +₹{selectedData.netEscalationCrore.toLocaleString()} Cr
                      </strong>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Avg +{selectedData.avgCostOverrunPercent}%
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 block">Schedule Slippage</span>
                      <strong className="text-orange-700 font-mono text-sm font-bold">
                        {selectedData.delayedProjectsCount} Projects
                      </strong>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Avg delay: +{selectedData.avgDelayMonths} mo
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] text-slate-500 block">Physical Progress</span>
                      <strong className="text-emerald-700 font-mono text-sm font-bold">
                        {selectedData.avgPhysicalProgressPercent}%
                      </strong>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Financial: {selectedData.avgFinancialProgressPercent}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top Projects Executing in Selected State */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      Major Infrastructure Assets in {selectedData.state}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">≥ ₹150 Cr</span>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {selectedData.topProjects && selectedData.topProjects.length > 0 ? (
                      selectedData.topProjects.map((p) => (
                        <Link
                          key={p.projectId}
                          href={`/projects/${p.projectId}`}
                          className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-slate-400 hover:bg-white transition-all flex flex-col justify-between group block"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                              {p.projectName}
                            </p>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 font-mono shrink-0">
                              {p.sector}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2">
                            <span>
                              Agency: <strong className="text-slate-800">{p.implementingAgency}</strong>
                            </span>
                            <span className="font-mono text-slate-900 font-bold">
                              ₹{p.revisedCostCrore.toLocaleString()} Cr
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] mt-1.5 pt-1.5 border-t border-slate-200/60">
                            <span className={p.costOverrunPercent > 10 ? "text-rose-600 font-semibold" : "text-emerald-700 font-semibold"}>
                              Overrun: +{p.costOverrunPercent}%
                            </span>
                            <span className={p.timeOverrunMonths > 0 ? "text-orange-700 font-semibold" : "text-emerald-700 font-semibold"}>
                              Delay: +{p.timeOverrunMonths} mo
                            </span>
                            <span className="text-blue-700 font-medium">
                              Progress: {p.physicalProgressPercent}%
                            </span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-4">No project details available.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-white border border-slate-200 text-center text-slate-500 shadow-sm">
                <Info className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className="text-xs">Select a state on the map to review infrastructure dossiers.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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
}

export default function IndiaMap({
  initialSelectedState = "Uttar Pradesh",
  onSelectState,
  className = "",
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

  // Color generator based on mode
  const getStateColor = (stateName: string, isSelected: boolean) => {
    const s = statesData[stateName];
    if (!s) {
      return "#1e293b"; // fallback slate
    }

    // Check region filtering
    if (activeRegion !== "ALL" && s.region !== activeRegion) {
      return "#121826"; // dimmed when not in active region
    }

    if (viewMode === "projects") {
      const ratio = s.projectCount / maxProjects;
      if (ratio > 0.7) return isSelected ? "#38bdf8" : "#0284c7"; // High (UP, MH, GJ)
      if (ratio > 0.45) return isSelected ? "#60a5fa" : "#2563eb"; // Medium-High (KA, RJ, TN)
      if (ratio > 0.25) return isSelected ? "#818cf8" : "#4338ca"; // Medium (MP, WB, TS, OD, AP, BR)
      if (ratio > 0.1) return isSelected ? "#93c5fd" : "#1e40af"; // Low-Medium
      return isSelected ? "#cbd5e1" : "#1e293b"; // Low
    } else if (viewMode === "risk") {
      if (s.riskTier === "CRITICAL") return isSelected ? "#f43f5e" : "#be123c"; // Crimson
      if (s.riskTier === "HIGH") return isSelected ? "#fb923c" : "#c2410c"; // Orange
      if (s.riskTier === "MODERATE") return isSelected ? "#facc15" : "#a16207"; // Yellow
      return isSelected ? "#34d399" : "#047857"; // Low Risk Emerald
    } else {
      // Outlay mode
      const ratio = s.revisedCostCrore / maxOutlay;
      if (ratio > 0.7) return isSelected ? "#34d399" : "#059669";
      if (ratio > 0.4) return isSelected ? "#2dd4bf" : "#0d9488";
      if (ratio > 0.2) return isSelected ? "#38bdf8" : "#0284c7";
      return isSelected ? "#64748b" : "#1e293b";
    }
  };

  const selectedData = statesData[selectedState];

  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-b from-[#090e1a] via-[#0d1527] to-[#070b14] border border-[#1e2e4a] shadow-2xl space-y-6 ${className}`}>
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1b2742]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              National Geo-Spatial Intelligence
            </span>
            <span className="text-xs text-slate-400">
              Interactive Choropleth of 1,981 Central Sector Projects
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>State & Union Territory Infrastructure Matrix</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click on any state to inspect capital outlays, time overruns, and high-priority infrastructure assets.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-[#0b1220] p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode("projects")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "projects"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Project Density
            </button>
            <button
              onClick={() => setViewMode("risk")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "risk"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Risk & Slippage
            </button>
            <button
              onClick={() => setViewMode("outlay")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "outlay"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Capital Outlay (₹)
            </button>
          </div>

          {/* Quick State Selector Dropdown */}
          <select
            value={selectedState}
            onChange={(e) => handleStateClick(e.target.value)}
            className="px-3 py-1.5 bg-[#0b1220] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
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

      {/* Region Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Zone:</span>
        {["ALL", "North", "South", "West", "East", "Central", "North-East"].map((reg) => (
          <button
            key={reg}
            onClick={() => setActiveRegion(reg)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              activeRegion === reg
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold"
                : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/80"
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
          className="ml-auto text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 shrink-0"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Map</span>
        </button>
      </div>

      {/* Main Map + Dossier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map Canvas (7 Cols) */}
        <div className="lg:col-span-7 relative bg-[#060a14] rounded-2xl border border-slate-800/90 p-4 flex flex-col items-center justify-center overflow-hidden min-h-[500px]">
          {/* Subtle Map Legend / Info Overlay */}
          <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 text-[10px] space-y-1 shadow-lg">
            <span className="font-bold text-slate-200 uppercase tracking-wider block">
              {viewMode === "projects" && "Density: Central Sector Projects"}
              {viewMode === "risk" && "Slippage: Critical Overruns"}
              {viewMode === "outlay" && "Allocation: Capital Outlay"}
            </span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-800" />
              <span className="text-slate-400">Low</span>
              <span className="w-12 h-1.5 rounded-full bg-gradient-to-r from-blue-900 via-blue-600 to-sky-400 mx-1" />
              <span className="text-slate-400">High</span>
            </div>
            <div className="text-slate-500 text-[9px]">Click state to explore details</div>
          </div>

          {/* Interactive SVG */}
          <div className="w-full max-w-[560px] aspect-[650/720] relative">
            <svg
              viewBox={MAP_VIEWBOX}
              className="w-full h-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
              aria-label="Interactive Map of India with 36 States and Union Territories"
            >
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="selectionGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.8" />
                </filter>
              </defs>

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
                      stroke={isSelected ? "#f59e0b" : isHovered ? "#38bdf8" : "#1e293b"}
                      strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 0.75}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      className="cursor-pointer transition-all duration-150 hover:brightness-125"
                      style={{
                        filter: isSelected ? "url(#selectionGlow)" : undefined,
                      }}
                      onMouseEnter={(e) => handleMouseMove(e, item)}
                      onMouseMove={(e) => handleMouseMove(e, item)}
                      onMouseLeave={() => setHoveredState(null)}
                      onClick={() => handleStateClick(item.name)}
                    />
                  );
                })}
              </g>

              {/* Key State Pin Markers */}
              <g className="pointer-events-none">
                {INDIA_MAP_PATHS.filter((s) =>
                  ["Uttar Pradesh", "Maharashtra", "Gujarat", "Karnataka", "Tamil Nadu", "Assam"].includes(s.name)
                ).map((s) => {
                  const sData = statesData[s.name];
                  if (!sData) return null;
                  return (
                    <g key={s.id} transform={`translate(${s.centroid[0]}, ${s.centroid[1]})`}>
                      <circle r="3.5" fill="#f8fafc" stroke="#0284c7" strokeWidth="1.5" />
                      <text
                        y="-6"
                        textAnchor="middle"
                        fill="#f8fafc"
                        fontSize="9"
                        fontWeight="bold"
                        className="font-mono"
                        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}
                      >
                        {s.code}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Dynamic Floating Tooltip */}
            {hoveredState && (
              <div
                className="absolute z-30 pointer-events-none p-3 rounded-xl bg-[#090e1a]/95 backdrop-blur-xl border border-sky-500/40 shadow-2xl text-xs text-white space-y-1 transform -translate-x-1/2 -translate-y-full mb-2 min-w-[200px]"
                style={{
                  left: `${tooltipPos.x}px`,
                  top: `${tooltipPos.y - 12}px`,
                }}
              >
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-1">
                  <div>
                    <p className="font-bold text-white text-sm">{hoveredState.name}</p>
                    <p className="text-[10px] text-amber-300 font-semibold">{hoveredState.hindiName}</p>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono">
                    {hoveredState.region}
                  </span>
                </div>

                {statesData[hoveredState.name] ? (
                  <div className="space-y-1 pt-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Projects:</span>
                      <strong className="text-sky-300 font-mono">
                        {statesData[hoveredState.name].projectCount}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Capital Outlay:</span>
                      <strong className="text-white font-mono">
                        ₹{(statesData[hoveredState.name].revisedCostCrore / 1000).toFixed(1)}k Cr
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Delayed:</span>
                      <strong className="text-amber-400 font-mono">
                        {statesData[hoveredState.name].delayedProjectsCount} (
                        {statesData[hoveredState.name].delayedProjectsPercent}%)
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Cost Overrun:</span>
                      <strong
                        className={`font-mono ${
                          statesData[hoveredState.name].avgCostOverrunPercent > 15
                            ? "text-rose-400"
                            : "text-emerald-400"
                        }`}
                      >
                        +{statesData[hoveredState.name].avgCostOverrunPercent}%
                      </strong>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500">No active Central Sector projects ≥ ₹150 Cr</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected State Infrastructure Dossier (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedData ? (
            <div className="space-y-4">
              {/* State Header Card */}
              <div className="p-5 rounded-2xl bg-[#0b1220] border border-slate-800 shadow-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 font-semibold border border-sky-500/20">
                        {selectedData.region} Zone
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                          selectedData.riskTier === "CRITICAL"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : selectedData.riskTier === "HIGH"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {selectedData.riskTier} Risk
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-white mt-1.5 tracking-tight">
                      {selectedData.state}
                    </h3>
                    <p className="text-xs font-semibold text-amber-400/90">{selectedData.stateHindi}</p>
                  </div>

                  <Link
                    href={`/projects?state=${encodeURIComponent(selectedData.state)}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 shrink-0"
                  >
                    <span>View All ({selectedData.projectCount})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* State Key Statistics Grid */}
                <div className="grid grid-cols-2 gap-2.5 mt-4 pt-4 border-t border-slate-800 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#070b14] border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Sanctioned Outlay</span>
                    <strong className="text-white font-mono text-sm">
                      ₹{(selectedData.revisedCostCrore / 1000).toFixed(1)}k Cr
                    </strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Exp: ₹{(selectedData.cumulativeExpenditureCrore / 1000).toFixed(1)}k Cr
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#070b14] border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Net Escalation</span>
                    <strong className="text-rose-400 font-mono text-sm">
                      +₹{selectedData.netEscalationCrore.toLocaleString()} Cr
                    </strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Avg +{selectedData.avgCostOverrunPercent}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#070b14] border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Schedule Slippage</span>
                    <strong className="text-amber-400 font-mono text-sm">
                      {selectedData.delayedProjectsCount} Projects
                    </strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Avg delay: +{selectedData.avgDelayMonths} mo
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#070b14] border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Physical Progress</span>
                    <strong className="text-emerald-400 font-mono text-sm">
                      {selectedData.avgPhysicalProgressPercent}%
                    </strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Financial: {selectedData.avgFinancialProgressPercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Projects Executing in Selected State */}
              <div className="p-4 rounded-2xl bg-[#0b1220] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-sky-400" />
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
                        className="p-3 rounded-xl bg-[#070b14] border border-slate-800/80 hover:border-sky-500/40 transition-all flex flex-col justify-between group block"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-200 group-hover:text-sky-300 transition-colors line-clamp-1">
                            {p.projectName}
                          </p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono shrink-0">
                            {p.sector}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                          <span>
                            Agency: <strong className="text-slate-200">{p.implementingAgency}</strong>
                          </span>
                          <span className="font-mono text-white font-bold">
                            ₹{p.revisedCostCrore.toLocaleString()} Cr
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] mt-1.5 pt-1.5 border-t border-slate-800/60">
                          <span className={p.costOverrunPercent > 10 ? "text-rose-400" : "text-emerald-400"}>
                            Overrun: +{p.costOverrunPercent}%
                          </span>
                          <span className={p.timeOverrunMonths > 0 ? "text-amber-400" : "text-emerald-400"}>
                            Delay: +{p.timeOverrunMonths} mo
                          </span>
                          <span className="text-sky-300 font-medium">
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
            <div className="p-8 rounded-2xl bg-[#0b1220] border border-slate-800 text-center text-slate-500">
              <Info className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-xs">Select a state on the map to review infrastructure dossiers.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

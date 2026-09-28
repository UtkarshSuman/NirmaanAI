"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, ShieldAlert, Layers } from "lucide-react";
import IndiaMap from "@/components/IndiaMap";

interface ObservatoryHeroProps {
  totalProjects: number;
  ministriesCount: number;
}

const PRIMARY_SECTORS = [
  "Railways",
  "National Highways",
  "Power",
  "Petroleum",
  "Urban Development",
  "Water Resources",
];

export default function ObservatoryHero({
  totalProjects,
  ministriesCount,
}: ObservatoryHeroProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/projects?search=${encodeURIComponent(searchInput.trim())}`);
    } else {
      router.push("/projects");
    }
  };

  return (
    <section className="relative pb-8 border-b border-slate-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Editorial Observatory Mission & Control (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Institutional Kicker & Brand */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-[2px] bg-orange-600" />
              <span className="text-xs font-semibold text-orange-700 tracking-wide uppercase">
                National Infrastructure Observatory
              </span>
            </div>
            <div>
              <span className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
                NIRMAAN <span className="text-orange-600">AI</span>
              </span>
            </div>
          </div>

          {/* Headline - Editorial Serif / Display Hierarchy */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-slate-900 tracking-tight leading-[1.14]">
              Predictive Infrastructure Monitoring for India
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed font-sans">
              Unified intelligence for monitoring project cost, execution, schedule, and emerging risk across India&apos;s central-sector infrastructure portfolio.
            </p>
          </div>

          {/* Search Bar - Parameter 'search' consistent with API */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              name="search"
              placeholder="Search projects, locations, ministries, or keywords..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 transition-colors shadow-2xs font-sans"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 p-1.5 rounded bg-gov-navy hover:bg-slate-800 text-white transition-colors"
              title="Search"
              aria-label="Search projects"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Sector Quick-Filter Links */}
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500 block">
              Quick Filter by Sector:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <Link
                href="/projects"
                className="px-2.5 py-1 rounded bg-slate-900 text-white font-medium text-xs transition-colors"
              >
                All Sectors
              </Link>
              {PRIMARY_SECTORS.map((sec) => (
                <Link
                  key={sec}
                  href={`/projects?sector=${encodeURIComponent(sec)}`}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
                >
                  {sec}
                </Link>
              ))}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Explore Project Portfolio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/alerts"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold shadow-xs transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Open Risk Radar</span>
            </Link>
          </div>

          {/* Scope Counters */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 block leading-tight">
                {totalProjects.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-medium">Monitored Assets (≥ ₹150 Cr)</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 block leading-tight">
                {ministriesCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">Ministries &amp; Agencies</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 block leading-tight font-sans">
                All India
              </span>
              <span className="text-xs text-slate-500 font-medium">National Geographic Scope</span>
            </div>
          </div>
        </div>

        {/* Right Column: India Map Visual Centerpiece (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
          <div className="w-full max-w-[640px] aspect-[650/720]">
            <IndiaMap variant="hero" hideDossier />
          </div>

          {/* Map Subtext Legend Bar */}
          <div className="w-full flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gov-red" />
                <span>High Risk</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gov-saffron" />
                <span>Moderate Risk</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gov-teal" />
                <span>On Track</span>
              </span>
            </div>

            <Link
              href="/map"
              className="text-gov-blue hover:text-blue-800 font-semibold flex items-center gap-0.5"
            >
              <span>Full Map Explorer</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

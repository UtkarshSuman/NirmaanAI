"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Globe2,
  Volume2,
  Shield,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export function AshokaEmblem({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
      aria-label="State Emblem of India (Ashoka Lion Capital)"
    >
      {/* Three Lions stylized representation */}
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.3" />
      {/* Central Lion Head */}
      <path
        d="M50 16 C42 16 38 22 38 30 C38 37 42 42 45 44 L45 52 L55 52 L55 44 C58 42 62 37 62 30 C62 22 58 16 50 16 Z"
        fill="currentColor"
        opacity="0.95"
      />
      {/* Left Lion Head Profile */}
      <path
        d="M37 24 C30 24 26 30 27 36 C28 41 33 44 38 45 L38 52 L44 52 L44 44 C40 42 36 38 35 32 Z"
        fill="currentColor"
        opacity="0.8"
      />
      {/* Right Lion Head Profile */}
      <path
        d="M63 24 C70 24 74 30 73 36 C72 41 67 44 62 45 L62 52 L56 52 L56 44 C60 42 64 38 65 32 Z"
        fill="currentColor"
        opacity="0.8"
      />
      {/* Abacus Base */}
      <rect x="25" y="54" width="50" height="7" rx="1.5" fill="currentColor" opacity="0.9" />
      {/* Ashoka Chakra in Abacus center */}
      <circle cx="50" cy="57.5" r="3" fill="#0284c7" />
      <circle cx="50" cy="57.5" r="1" fill="#ffffff" />
      {/* Base Pedestal */}
      <path d="M22 63 L78 63 L74 68 L26 68 Z" fill="currentColor" opacity="0.85" />
      {/* Satyameva Jayate Banner */}
      <path d="M28 71 L72 71 L68 76 L32 76 Z" fill="currentColor" opacity="0.75" />
      {/* Stylized Devanagari text line */}
      <rect x="34" y="79" width="32" height="2" rx="0.5" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

export default function GovHeader() {
  const [textSize, setTextSize] = useState<"sm" | "base" | "lg">("base");
  const [lang, setLang] = useState<"EN" | "HI">("EN");

  const cycleTextSize = (size: "sm" | "base" | "lg") => {
    setTextSize(size);
    if (typeof document !== "undefined") {
      if (size === "sm") document.documentElement.style.fontSize = "14px";
      if (size === "base") document.documentElement.style.fontSize = "16px";
      if (size === "lg") document.documentElement.style.fontSize = "18px";
    }
  };

  return (
    <header className="w-full bg-[#050914] border-b border-[#1b253b] text-slate-200 select-none">
      {/* National Tricolor Top Stripe */}
      <div className="gov-tricolor-stripe w-full h-[3px]" />

      {/* Topmost Official Accessibility Bar (Standard GoI Requirement) */}
      <div className="bg-[#03060f] px-4 lg:px-8 py-1 border-b border-[#131b2e] flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">भारत सरकार का आधिकारिक पोर्टल</span>
            <span className="hidden sm:inline">•</span>
            <span>Official Portal of Government of India</span>
          </span>
          <span className="hidden md:inline-block px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold">
            MoSPI • IPMD
          </span>
        </div>

        {/* Accessibility & Language Controls */}
        <div className="flex items-center gap-3">
          <a
            href="#main-content"
            className="hover:text-sky-300 transition-colors hidden sm:inline"
            title="Skip to main content"
          >
            Skip to Main Content
          </a>
          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* Screen Reader Access */}
          <button
            onClick={() => alert("Screen Reader mode active. Standard ARIA 1.2 landmark navigation enabled.")}
            className="flex items-center gap-1 hover:text-sky-300 transition-colors"
            title="Screen Reader Accessibility"
          >
            <Volume2 className="w-3 h-3 text-sky-400" />
            <span className="hidden sm:inline">Screen Reader</span>
          </button>
          <span className="text-slate-700">|</span>

          {/* Text Size Resizer */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => cycleTextSize("sm")}
              className={`px-1 py-0.2 rounded hover:bg-slate-800 ${textSize === "sm" ? "text-sky-400 font-bold" : ""}`}
              title="Decrease Font Size"
            >
              A-
            </button>
            <button
              onClick={() => cycleTextSize("base")}
              className={`px-1 py-0.2 rounded hover:bg-slate-800 ${textSize === "base" ? "text-sky-400 font-bold" : ""}`}
              title="Standard Font Size"
            >
              A
            </button>
            <button
              onClick={() => cycleTextSize("lg")}
              className={`px-1 py-0.2 rounded hover:bg-slate-800 ${textSize === "lg" ? "text-sky-400 font-bold" : ""}`}
              title="Increase Font Size"
            >
              A+
            </button>
          </div>
          <span className="text-slate-700">|</span>

          {/* Language Switch */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-semibold">
            <button
              onClick={() => setLang("EN")}
              className={`${lang === "EN" ? "text-sky-300 font-bold" : "text-slate-400 hover:text-white"}`}
            >
              English
            </button>
            <span className="text-slate-600">/</span>
            <button
              onClick={() => setLang("HI")}
              className={`${lang === "HI" ? "text-amber-300 font-bold" : "text-slate-400 hover:text-white"}`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      {/* Main Government Banner & Ministry Identity */}
      <div className="px-4 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: National Emblem and Ministry Title */}
        <div className="flex items-center gap-3.5">
          {/* Emblem Container with Gold Glow */}
          <div className="p-2 rounded-xl bg-gradient-to-b from-[#101b33] to-[#0a1224] border border-[#233558] text-amber-300 shadow-md shadow-amber-500/5 shrink-0">
            <AshokaEmblem className="w-10 h-10 text-amber-300" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400/90 tracking-wider">भारत सरकार</span>
              <span className="text-slate-600 font-light">•</span>
              <span className="text-xs font-bold text-slate-200 tracking-wider">GOVERNMENT OF INDIA</span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-snug">
              सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय
              <span className="block text-xs sm:text-sm font-semibold text-slate-300">
                Ministry of Statistics and Programme Implementation (MoSPI)
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
              <span>अवसंरचना एवं परियोजना निगरानी प्रभाग (IPMD)</span>
              <span className="text-slate-600">•</span>
              <span className="text-sky-300 font-mono">PAIMANA AI Portal (OCMS 2.0)</span>
            </p>
          </div>
        </div>

        {/* Right: National Initiatives Badges */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* PM GatiShakti Integration Badge */}
          <a
            href="https://pmgatishakti.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-semibold text-amber-300">PM GatiShakti</span>
            <span className="text-[10px] text-slate-400">NMP Sync</span>
            <ExternalLink className="w-2.5 h-2.5 text-slate-500 ml-0.5" />
          </a>

          {/* Central Sector Scope Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e172a] border border-[#1e2e4a] text-[11px] text-slate-300 shadow-sm">
            <Shield className="w-3 h-3 text-sky-400" />
            <span className="font-medium text-slate-300">Central Sector Projects:</span>
            <strong className="text-white font-mono">≥ ₹150 Crore</strong>
          </div>

          {/* Active Baseline Status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 shadow-sm">
            <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="font-bold">April 2026 Cycle</span>
            <span className="text-[10px] text-emerald-400/80 font-mono">(1,981 Prj)</span>
          </div>
        </div>
      </div>
    </header>
  );
}

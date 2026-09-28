"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Volume2, Shield, Activity, ExternalLink } from "lucide-react";

export function AshokaEmblem({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
      aria-label="State Emblem of India (Ashoka Lion Capital)"
    >
      {/* Three Lions stylized representation */}
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
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
    <header className="w-full bg-white border-b border-slate-200 text-slate-800 select-none">
      {/* National Tricolor Top Stripe */}
      <div className="gov-tricolor-stripe w-full h-[3px]" />

      {/* Topmost Official Accessibility Bar (Standard GoI Requirement) */}
      <div className="bg-slate-50/90 px-4 lg:px-8 py-1.5 border-b border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>भारत सरकार</span>
            <span className="text-slate-400">|</span>
            <span className="hidden sm:inline">Government of India</span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-500 hidden md:inline">आधिकारिक अवसंरचना निगरानी पोर्टल | Official Infrastructure Monitoring Portal</span>
          </span>
          <span className="hidden lg:inline-block px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-semibold">
            MoSPI • IPMD
          </span>
        </div>

        {/* Accessibility & Language Controls */}
        <div className="flex items-center gap-3 text-slate-600">
          <a
            href="#main-content"
            className="hover:text-orange-600 transition-colors hidden sm:inline"
            title="Skip to main content"
          >
            Skip to Main Content
          </a>
          <span className="text-slate-300 hidden sm:inline">|</span>

          {/* Screen Reader Access */}
          <button
            onClick={() => alert("Screen Reader mode active. Standard ARIA 1.2 landmark navigation enabled.")}
            className="flex items-center gap-1 hover:text-orange-600 transition-colors"
            title="Screen Reader Accessibility"
          >
            <Volume2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Screen Reader</span>
          </button>
          <span className="text-slate-300">|</span>

          {/* Text Size Resizer */}
          <div className="flex items-center gap-1 font-medium">
            <button
              onClick={() => cycleTextSize("sm")}
              className={`px-1.5 py-0.5 rounded hover:bg-slate-200 ${textSize === "sm" ? "text-orange-600 font-bold bg-orange-50" : ""}`}
              title="Decrease Font Size"
            >
              A-
            </button>
            <button
              onClick={() => cycleTextSize("base")}
              className={`px-1.5 py-0.5 rounded hover:bg-slate-200 ${textSize === "base" ? "text-orange-600 font-bold bg-orange-50" : ""}`}
              title="Standard Font Size"
            >
              A
            </button>
            <button
              onClick={() => cycleTextSize("lg")}
              className={`px-1.5 py-0.5 rounded hover:bg-slate-200 ${textSize === "lg" ? "text-orange-600 font-bold bg-orange-50" : ""}`}
              title="Increase Font Size"
            >
              A+
            </button>
          </div>
          <span className="text-slate-300">|</span>

          {/* Language Switch */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-semibold shadow-2xs">
            <button
              onClick={() => setLang("EN")}
              className={`${lang === "EN" ? "text-orange-600 font-bold" : "text-slate-500 hover:text-slate-800"}`}
            >
              English
            </button>
            <span className="text-slate-300">/</span>
            <button
              onClick={() => setLang("HI")}
              className={`${lang === "HI" ? "text-orange-600 font-bold" : "text-slate-500 hover:text-slate-800"}`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      {/* Main Government Banner & Ministry Identity */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: National Emblem and Ministry Title */}
        <Link href="/" className="flex items-center gap-3.5 group">
          {/* Emblem Container */}
          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-amber-700 shadow-2xs shrink-0">
            <AshokaEmblem className="w-9 h-9 text-amber-800" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-800 tracking-wider">सांख्यिकी एवं कार्यक्रम कार्यान्वयन मंत्रालय</span>
              <span className="text-slate-300 font-light">•</span>
              <span className="text-[11px] font-bold text-slate-700 tracking-wider">MoSPI</span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-snug">
              Ministry of Statistics and Programme Implementation
              <span className="block text-xs font-semibold text-slate-600">
                Government of India | Infrastructure & Project Monitoring Division (IPMD)
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
              <span className="font-bold text-orange-600">PAIMAANA</span>
              <span className="text-slate-300">•</span>
              <span>Predictive Infrastructure Monitoring & Analytics Platform</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-slate-100 text-slate-500 font-mono">Prototype</span>
            </p>
          </div>
        </Link>

        {/* Right: Monitoring Cycle & Scope Badges */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Central Sector Scope Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-medium text-slate-600">Central Sector:</span>
            <strong className="text-slate-900 font-mono font-bold">≥ ₹150 Crore</strong>
          </div>

          {/* Active Monitoring Cycle Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 shadow-2xs">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-bold">April 2026 Monitoring Cycle</span>
            <span className="text-[10px] text-emerald-700 font-mono">(1,981 Projects)</span>
          </div>
        </div>
      </div>
    </header>
  );
}

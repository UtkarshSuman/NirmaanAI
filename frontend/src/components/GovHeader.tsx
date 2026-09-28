"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Volume2 } from "lucide-react";

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
      {/* Restrained Accent Stripe */}
      <div className="gov-tricolor-stripe w-full h-[2px]" />

      {/* Top Utility Bar */}
      <div className="bg-slate-50/90 px-4 sm:px-6 lg:px-8 py-1.5 border-b border-slate-200/80 text-xs text-slate-600">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span className="font-semibold text-slate-900">NIRMAAN AI</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600 hidden sm:inline">National Infrastructure Observatory</span>
            </span>
          </div>

          {/* Accessibility & Language Controls */}
          <div className="flex items-center gap-3 text-slate-600">
            <a
              href="#main-content"
              className="hover:text-slate-900 transition-colors hidden sm:inline"
              title="Skip to main content"
            >
              Skip to main content
            </a>
            <span className="text-slate-300 hidden sm:inline">|</span>

            {/* Screen Reader Access */}
            <button
              onClick={() => alert("Screen reader accessibility active. Standard ARIA 1.2 landmark navigation enabled.")}
              className="flex items-center gap-1 hover:text-slate-900 transition-colors"
              title="Screen Reader Accessibility"
            >
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Accessibility</span>
            </button>
            <span className="text-slate-300">|</span>

            {/* Text Size Resizer */}
            <div className="flex items-center gap-0.5 font-medium text-xs">
              <button
                onClick={() => cycleTextSize("sm")}
                className={`px-1.5 py-0.5 rounded hover:bg-slate-200 transition-colors ${
                  textSize === "sm" ? "text-orange-700 font-bold bg-orange-50" : ""
                }`}
                title="Decrease font size"
              >
                A-
              </button>
              <button
                onClick={() => cycleTextSize("base")}
                className={`px-1.5 py-0.5 rounded hover:bg-slate-200 transition-colors ${
                  textSize === "base" ? "text-orange-700 font-bold bg-orange-50" : ""
                }`}
                title="Standard font size"
              >
                A
              </button>
              <button
                onClick={() => cycleTextSize("lg")}
                className={`px-1.5 py-0.5 rounded hover:bg-slate-200 transition-colors ${
                  textSize === "lg" ? "text-orange-700 font-bold bg-orange-50" : ""
                }`}
                title="Increase font size"
              >
                A+
              </button>
            </div>
            <span className="text-slate-300">|</span>

            {/* Language Switch */}
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setLang("EN")}
                className={`${lang === "EN" ? "text-orange-700 font-bold" : "text-slate-600 hover:text-slate-900"}`}
              >
                English
              </button>
              <span className="text-slate-300">/</span>
              <button
                onClick={() => setLang("HI")}
                className={`${lang === "HI" ? "text-orange-700 font-bold" : "text-slate-600 hover:text-slate-900"}`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Website Identity Area */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: NIRMAAN AI Brand Lockup */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-10 h-10 rounded bg-[#173f5f] text-white flex items-center justify-center font-serif font-bold text-xl tracking-tight shadow-sm">
            N
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                NIRMAAN <span className="text-orange-600">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Predictive Infrastructure Intelligence
            </p>
          </div>
        </Link>

        {/* Right: Dataset Scope & Analytical Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 self-start md:self-auto font-medium">
          <span>Central-sector infrastructure</span>
          <span className="text-slate-300">•</span>
          <span>₹150 Cr+</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-800 font-semibold">Current analytical dataset</span>
        </div>
      </div>
    </header>
  );
}

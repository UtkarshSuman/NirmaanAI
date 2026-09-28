"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, CheckCircle2, ExternalLink } from "lucide-react";

export default function GovFooter() {
  return (
    <footer className="w-full bg-white border-t border-slate-200 text-slate-600 text-xs select-none">
      {/* Upper Navigation & Platform Columns */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-slate-200/80">
        {/* Col 1: Platform Identity */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#173f5f] text-white flex items-center justify-center font-serif font-bold text-base shadow-xs">
              N
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 tracking-tight">NIRMAAN AI</p>
              <p className="text-xs text-slate-500 font-medium">Predictive Infrastructure Intelligence</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Analytical observatory monitoring Central Sector Infrastructure Projects costing ₹150 Crore and above across core national infrastructure domains.
          </p>
          <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200 leading-relaxed">
            Infrastructure Intelligence Research &amp; Demonstration Platform
          </div>
        </div>

        {/* Col 2: External Reference Portals */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">External Reference Portals</h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <a
                href="https://mospi.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-orange-700 transition-colors"
              >
                <span>MoSPI Portal (External Reference)</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </li>
            <li>
              <a
                href="https://pmgatishakti.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-orange-700 transition-colors"
              >
                <span>PM GatiShakti NMP (External Reference)</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </li>
            <li>
              <a
                href="https://www.niti.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-orange-700 transition-colors"
              >
                <span>NITI Aayog Infrastructure (External Reference)</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </li>
            <li>
              <a
                href="https://data.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-orange-700 transition-colors"
              >
                <span>Open Government Data (External Reference)</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Platform Modules */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Platform Modules</h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <Link href="/projects" className="hover:text-orange-700 transition-colors">
                Portfolio Directory &amp; Filters
              </Link>
            </li>
            <li>
              <Link href="/analytics" className="hover:text-orange-700 transition-colors">
                Forecasting &amp; Model Evaluation
              </Link>
            </li>
            <li>
              <Link href="/alerts" className="hover:text-orange-700 transition-colors">
                Risk Radar &amp; Early Warnings
              </Link>
            </li>
            <li>
              <Link href="/map" className="hover:text-orange-700 transition-colors">
                Geospatial Infrastructure Map
              </Link>
            </li>
            <li>
              <Link href="/assistant" className="hover:text-orange-700 transition-colors">
                NIRMAAN AI Officer
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-orange-700 transition-colors font-medium text-slate-800">
                SIH Methodology Monograph
              </Link>
            </li>
            <li>
              <Link href="/ingest" className="hover:text-orange-700 transition-colors">
                CUF Data Ingestion Service
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Platform Standards */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Platform Standards</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs text-slate-700">
                W3C WCAG 2.1 AA Accessibility Compliant Architecture
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-xs text-slate-700">
                Multi-Model Ensemble Engine (XGBoost, LightGBM, Random Forest)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Attribution Strip */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          <span className="font-semibold text-slate-700">NIRMAAN AI</span>
          <span className="text-slate-400"> — Predictive Infrastructure Intelligence Platform</span>
        </div>

        {/* Center: Policy links */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="hover:text-slate-800 cursor-pointer">Privacy Policy</span>
          <span>|</span>
          <span className="hover:text-slate-800 cursor-pointer">Terms of Use</span>
          <span>|</span>
          <span className="hover:text-slate-800 cursor-pointer">Methodology</span>
          <span>|</span>
          <span className="hover:text-slate-800 cursor-pointer">Accessibility</span>
        </div>

        <div>
          <span className="text-slate-500">Research &amp; Demonstration Platform</span>
        </div>
      </div>
    </footer>
  );
}

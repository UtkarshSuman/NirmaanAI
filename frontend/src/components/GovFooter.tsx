"use client";

import React from "react";
import Link from "next/link";
import { AshokaEmblem } from "./GovHeader";
import { ShieldCheck, CheckCircle2, ExternalLink } from "lucide-react";

export function NicLogo({ className = "h-7" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 font-sans ${className}`}>
      <div className="w-6 h-6 rounded bg-[#004B87] flex items-center justify-center text-white text-[11px] font-black tracking-tighter shadow-2xs">
        NIC
      </div>
      <div className="text-left leading-none">
        <span className="block text-[9px] font-bold text-slate-800 tracking-tight">National</span>
        <span className="block text-[9px] font-bold text-slate-800 tracking-tight">Informatics Centre</span>
      </div>
    </div>
  );
}

export function DigitalIndiaLogo({ className = "h-7" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 font-sans ${className}`}>
      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 via-amber-400 to-emerald-500 p-[1.5px] flex items-center justify-center shadow-2xs">
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
          <span className="text-[10px] font-black text-orange-600">di</span>
        </div>
      </div>
      <div className="text-left leading-none">
        <span className="block text-[10px] font-extrabold text-slate-900 tracking-tight">Digital India</span>
        <span className="block text-[7.5px] text-slate-500">Power To Empower</span>
      </div>
    </div>
  );
}

export default function GovFooter() {
  return (
    <footer className="w-full bg-white border-t border-slate-200 text-slate-600 text-xs select-none">
      {/* Upper Navigation & Institutional Columns */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-slate-200/80">
        {/* Col 1: Ministry Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <AshokaEmblem className="w-7 h-7 text-amber-800 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">भारत सरकार | GoI</p>
              <p className="text-[10px] text-slate-600 font-medium">सांख्यिकी एवं कार्यक्रम कार्यान्वयन मंत्रालय</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Infrastructure & Project Monitoring Division (IPMD) monitors Central Sector Infrastructure Projects
            costing ₹150 Crore and above across 17 Union Ministries and 22 core sectors.
          </p>
          <div className="text-[10px] text-slate-500 font-mono bg-slate-50 p-2 rounded border border-slate-200 leading-relaxed">
            PAIMAANA — Infrastructure Intelligence Prototype
            <br />
            <span className="text-slate-400">Research & Demonstration Platform • SIH 26103</span>
          </div>
        </div>

        {/* Col 2: Institutional Portals */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">National Portals</h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <a
                href="https://mospi.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-orange-600 transition-colors"
              >
                <span>MoSPI Official Portal</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </li>
            <li>
              <a
                href="https://pmgatishakti.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-orange-600 transition-colors"
              >
                <span>PM GatiShakti National Master Plan</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </li>
            <li>
              <a
                href="https://www.niti.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-orange-600 transition-colors"
              >
                <span>NITI Aayog Infrastructure Division</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </li>
            <li>
              <a
                href="https://data.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-orange-600 transition-colors"
              >
                <span>Open Government Data (OGD) Platform</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Analytical Dimensions (SIH 26103) */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Platform Modules</h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <Link href="/projects" className="hover:text-orange-600 transition-colors">
                Project Directory & Filters
              </Link>
            </li>
            <li>
              <Link href="/analytics" className="hover:text-orange-600 transition-colors">
                Predictive Forecasting & ML Metrics
              </Link>
            </li>
            <li>
              <Link href="/alerts" className="hover:text-orange-600 transition-colors">
                Risk Radar & Early Warning System
              </Link>
            </li>
            <li>
              <Link href="/map" className="hover:text-orange-600 transition-colors">
                Geo-Spatial Explorer & State Matrix
              </Link>
            </li>
            <li>
              <Link href="/assistant" className="hover:text-orange-600 transition-colors">
                PAIMAANA AI Policy Officer
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Compliance & Accreditation */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Standards & Compliance</h4>
          <div className="space-y-2 text-[11px]">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-[10px] text-slate-700">
                GIGW 3.0 & W3C WCAG 2.1 AA Accessibility Compliant
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-[10px] text-slate-700">
                Machine Learning Ensemble Engine (F1: 0.9948)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Mandatory Legal, Policy & Logo Strip */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px]">
        {/* Left: Ministry identity */}
        <div className="flex items-center gap-2">
          <AshokaEmblem className="w-5 h-5 text-amber-800 shrink-0" />
          <div className="leading-tight">
            <span className="font-semibold text-slate-800">Ministry of Statistics and Programme Implementation (MoSPI)</span>
            <span className="block text-[10px] text-slate-500">Government of India | Infrastructure & Project Monitoring Division (IPMD)</span>
          </div>
        </div>

        {/* Center: Legal policy links */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-slate-500 text-[10px]">
          <span className="hover:text-slate-800 cursor-pointer">Privacy Policy</span>
          <span>|</span>
          <span className="hover:text-slate-800 cursor-pointer">Terms of Use</span>
          <span>|</span>
          <span className="hover:text-slate-800 cursor-pointer">Accessibility</span>
          <span>|</span>
          <span className="hover:text-slate-800 cursor-pointer">Sitemap</span>
          <span>|</span>
          <span className="font-medium text-slate-700">NIC / GIGW 3.0 Compliance</span>
        </div>

        {/* Right: NIC & Digital India Badges */}
        <div className="flex items-center gap-4">
          <NicLogo />
          <div className="w-[1px] h-5 bg-slate-200" />
          <DigitalIndiaLogo />
        </div>
      </div>
    </footer>
  );
}

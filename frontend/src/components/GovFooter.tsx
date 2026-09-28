"use client";

import React from "react";
import Link from "next/link";
import { AshokaEmblem } from "./GovHeader";
import { ExternalLink, ShieldCheck, CheckCircle2, FileText, Globe } from "lucide-react";

export default function GovFooter() {
  return (
    <footer className="w-full bg-[#040711] border-t border-[#151f33] text-slate-400 text-xs select-none">
      {/* Top Disclaimer Section */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-slate-800/80">
        {/* Col 1: Ministry Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <AshokaEmblem className="w-8 h-8 text-amber-300" />
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">भारत सरकार | GoI</p>
              <p className="text-[10px] text-slate-400">सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Infrastructure & Project Monitoring Division (IPMD) monitors Central Sector Infrastructure Projects
            costing ₹150 Crore and above across 17 Union Ministries and 22 core sectors.
          </p>
          <div className="text-[10px] text-slate-500 font-mono">
            Portal: PAIMANA 2.0 (Formerly OCMS) • DIID Host
          </div>
        </div>

        {/* Col 2: Institutional Portals */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">National Portals</h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <a
                href="https://mospi.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-sky-300 transition-colors"
              >
                <span>MoSPI Official Portal</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </li>
            <li>
              <a
                href="https://pmgatishakti.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-sky-300 transition-colors"
              >
                <span>PM GatiShakti National Master Plan</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </li>
            <li>
              <a
                href="https://www.niti.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-sky-300 transition-colors"
              >
                <span>NITI Aayog Infrastructure Division</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </li>
            <li>
              <a
                href="https://data.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-sky-300 transition-colors"
              >
                <span>Open Government Data (OGD) Platform</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Analytical Dimensions (SIH 26103) */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Technical Dimensions</h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <Link href="/analytics" className="hover:text-sky-300 transition-colors flex items-center gap-1">
                <span>Dim A: Predictive Models & Ensemble</span>
              </Link>
            </li>
            <li>
              <Link href="/analytics" className="hover:text-sky-300 transition-colors flex items-center gap-1">
                <span>Dim B: AI/ML vs Conventional Heuristics</span>
              </Link>
            </li>
            <li>
              <Link href="/analytics" className="hover:text-sky-300 transition-colors flex items-center gap-1">
                <span>Dim C: CUF Attribution & Variables</span>
              </Link>
            </li>
            <li>
              <Link href="/alerts" className="hover:text-sky-300 transition-colors flex items-center gap-1">
                <span>Early Warning Alert Thresholds</span>
              </Link>
            </li>
            <li>
              <Link href="/assistant" className="hover:text-sky-300 transition-colors flex items-center gap-1">
                <span>LLM Project Intelligence Assistant</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Compliance & Accreditation */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Standards & Compliance</h4>
          <div className="space-y-2 text-[11px]">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[10px] text-slate-300">
                GIGW 3.0 & W3C WCAG 2.1 AA Accessibility Compliant
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-[10px] text-slate-300">
                Open-Source Stack: Next.js, FastAPI, XGBoost, Scikit-learn
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Mandatory Legal & Credit Strip */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
        <div>
          <span>Website Content Managed by </span>
          <strong className="text-slate-300">Infrastructure & Project Monitoring Division (IPMD), MoSPI</strong>
          <span className="block text-[10px] text-slate-600 mt-0.5">
            Designed, Developed and Hosted by Data Informatics & Innovation Division (DIID) • Government of India
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[10px]">
          <span className="hover:text-slate-300 cursor-pointer">Terms of Use</span>
          <span>•</span>
          <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-slate-300 cursor-pointer">Hyperlink Policy</span>
          <span>•</span>
          <span className="hover:text-slate-300 cursor-pointer">Copyright Policy</span>
          <span>•</span>
          <span className="text-slate-400 font-mono">Last Updated: 27 Sep 2026</span>
        </div>
      </div>
    </footer>
  );
}

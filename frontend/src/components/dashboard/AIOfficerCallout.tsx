import React from "react";
import Link from "next/link";
import { ArrowRight, Bot } from "lucide-react";

export default function AIOfficerCallout() {
  return (
    <section className="rounded bg-[#173f5f] text-white p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xs">
      <div className="space-y-2 max-w-3xl">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-orange-400" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 font-bold">
            Institutional Policy Intelligence
          </span>
        </div>

        <h3 className="text-xl font-serif font-bold tracking-tight text-white">
          PAIMAANA AI Officer
        </h3>

        <p className="text-xs text-slate-200 leading-relaxed font-sans">
          Query India&apos;s infrastructure portfolio in natural language. Audit project dossiers, examine ministry-level delay patterns, simulate cost overrun probabilities, and generate executive policy briefings under IPMD guidelines.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-300 font-mono">
          <span>Capabilities:</span>
          <span className="text-slate-400">•</span>
          <span>Portfolio Cross-Examination</span>
          <span className="text-slate-400">•</span>
          <span>RCC Risk Triggers</span>
          <span className="text-slate-400">•</span>
          <span>SHAP Attribution</span>
          <span className="text-slate-400">•</span>
          <span>Ministerial Briefings</span>
        </div>
      </div>

      <div className="shrink-0 self-start md:self-auto">
        <Link
          href="/assistant"
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-colors shadow-2xs font-sans"
        >
          <span>Open AI Officer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}

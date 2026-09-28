"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  FolderGit2,
  BarChart3,
  AlertTriangle,
  Bot,
  ShieldCheck,
  Building2,
  ExternalLink,
  Layers,
  FileCheck,
} from "lucide-react";

const NAV_ITEMS = [
  {
    name: "National Overview",
    href: "/",
    icon: LayoutDashboard,
    desc: "Executive Portfolio Console",
  },
  {
    name: "India Geo-Map",
    href: "/map",
    icon: Map,
    badge: "Interactive",
    desc: "36 States & UTs Choropleth",
  },
  {
    name: "Projects Directory",
    href: "/projects",
    icon: FolderGit2,
    desc: "Monitored Assets (≥₹150 Cr)",
  },
  {
    name: "Analytics & ML Engine",
    href: "/analytics",
    icon: BarChart3,
    desc: "AI vs Conventional Proof",
  },
  {
    name: "Early Warning Console",
    href: "/alerts",
    icon: AlertTriangle,
    badge: "Live",
    desc: "Proactive Risk Signals",
  },
  {
    name: "AI Policy Officer",
    href: "/assistant",
    icon: Bot,
    badge: "LLM",
    desc: "Cabinet & IPMD Q&A",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#070b16] border-r border-[#1a253c] flex flex-col z-40 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1a253c] bg-gradient-to-b from-[#0a1020] to-[#070b16]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#173f5f] border border-slate-700 flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
            N
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">NIRMAAN AI</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">Predictive Infrastructure Intelligence</p>
            <p className="text-[11px] text-slate-400">National Observatory</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Integrated Monitoring</span>
          <span className="text-[9px] text-emerald-400 font-mono">● LIVE</span>
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 border border-blue-400/30"
                  : "text-slate-300 hover:text-white hover:bg-[#121c2e]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <div>
                  <div className="leading-none">{item.name}</div>
                  <div className={`text-[9px] mt-0.5 font-normal ${isActive ? "text-blue-100" : "text-slate-500"}`}>
                    {item.desc}
                  </div>
                </div>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    item.badge === "Live"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse"
                      : item.badge === "Interactive"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-5 px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Technical Dimensions (SIH 26103)
        </div>
        <div className="space-y-1">
          <Link
            href="/analytics#dim-a"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-[11px] text-slate-400 hover:text-white hover:bg-[#121c2e] transition-colors"
          >
            <span>Dim A: Predictive Models</span>
            <span className="text-[10px] text-sky-400 font-mono">Ensemble</span>
          </Link>
          <Link
            href="/analytics#dim-b"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-[11px] text-slate-400 hover:text-white hover:bg-[#121c2e] transition-colors"
          >
            <span>Dim B: AI vs Conventional</span>
            <span className="text-[10px] text-emerald-400 font-mono">Benchmark</span>
          </Link>
          <Link
            href="/analytics#dim-c"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-[11px] text-slate-400 hover:text-white hover:bg-[#121c2e] transition-colors"
          >
            <span>Dim C: CUF Feature Matrix</span>
            <span className="text-[10px] text-amber-400 font-mono">Taxonomy</span>
          </Link>
        </div>

        <div className="pt-5 px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Institutional Portals
        </div>
        <div className="space-y-1">
          <a
            href="https://mospi.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] text-slate-400 hover:text-white hover:bg-[#121c2e] transition-colors"
          >
            <span>MoSPI Official Portal</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
          <a
            href="https://pmgatishakti.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] text-slate-400 hover:text-white hover:bg-[#121c2e] transition-colors"
          >
            <span>PM GatiShakti NMP</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </nav>

      {/* Footer System Status */}
      <div className="p-3.5 border-t border-[#1a253c] bg-[#050812]">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold text-emerald-400">ML Stacking Ensemble</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">v1.4-stk</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Central Sector Projects ≥ ₹150 Cr
        </p>
        <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Platform Status</span>
          <span className="text-emerald-400 font-medium">Active Operational</span>
        </div>
      </div>
    </aside>
  );
}

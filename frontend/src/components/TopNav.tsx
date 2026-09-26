"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, Sparkles, Shield, Activity } from "lucide-react";

interface TopNavProps {
  unacknowledgedAlertsCount?: number;
}

export default function TopNav({ unacknowledgedAlertsCount = 14 }: TopNavProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/projects?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#090e1a]/85 backdrop-blur-xl border-b border-[#1e293b]/80 px-6 flex items-center justify-between">
      {/* Search Input with modern styling */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-sky-400 transition-colors" />
          <input
            type="text"
            placeholder="Search 1,931 projects (e.g. NH-44, Bullet Train, Metro, NTPC)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-12 py-2 bg-[#0f172a]/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/15 transition-all shadow-inner"
          />
          <kbd className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono border border-slate-700">
            ↵
          </kbd>
        </div>
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Live IST Status Ticker */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-medium tracking-wide">
            OCMS 2.0 Live Sync • <strong className="text-white font-mono">1,931</strong> Projects
          </span>
        </div>

        {/* Alerts Bell */}
        <Link
          href="/alerts"
          className="relative p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all hover:bg-slate-800"
          title="Early Warning System"
        >
          <Bell className="w-4 h-4" />
          {unacknowledgedAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] text-white font-bold flex items-center justify-center animate-pulse shadow-md shadow-rose-500/30">
              {unacknowledgedAlertsCount > 9 ? "9+" : unacknowledgedAlertsCount}
            </span>
          )}
        </Link>

        {/* AI Assistant Button */}
        <Link
          href="/assistant"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span>AI Officer</span>
        </Link>

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-sky-300 shadow-sm">
            GOI
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-100 leading-none">IPMD Desk</p>
            <p className="text-[10px] text-slate-400 leading-none mt-1">MoSPI, New Delhi</p>
          </div>
        </div>
      </div>
    </header>
  );
}

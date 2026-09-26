"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  BarChart3,
  AlertTriangle,
  Bot,
  ShieldCheck,
  Building2,
  ExternalLink,
} from "lucide-react";

const NAV_ITEMS = [
  {
    name: "National Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Projects Directory",
    href: "/projects",
    icon: FolderGit2,
  },
  {
    name: "Analytics & ML Engine",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Early Warning Console",
    href: "/alerts",
    icon: AlertTriangle,
    badge: "Live",
  },
  {
    name: "AI Policy Officer",
    href: "/assistant",
    icon: Bot,
    badge: "AI",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0a0f1d] border-r border-[#1e293b] flex flex-col z-40 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1e293b]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-wider text-white">PAIMANA</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">AI</span>
            </div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">MoSPI • IPMD Division</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Integrated Monitoring
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold"
                  : "text-gray-300 hover:text-white hover:bg-[#151f32]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                    item.badge === "Live"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse"
                      : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          National Portals
        </div>
        <div className="space-y-1">
          <a
            href="https://mospi.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-[#151f32] transition-colors"
          >
            <span>MoSPI Official Portal</span>
            <ExternalLink className="w-3 h-3 text-gray-500" />
          </a>
          <a
            href="https://pmgatishakti.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-[#151f32] transition-colors"
          >
            <span>PM GatiShakti NMP</span>
            <ExternalLink className="w-3 h-3 text-gray-500" />
          </a>
        </div>
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-[#1e293b] bg-[#070b14]">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-medium text-emerald-400">ML Engine Active</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-tight">
          Central Sector Projects ≥ ₹150 Cr
        </p>
        <div className="mt-2 text-[10px] text-gray-500 flex items-center justify-between">
          <span>XGBoost + LightGBM</span>
          <span className="text-gray-400 font-mono">v1.4-stk</span>
        </div>
      </div>
    </aside>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, Sparkles, Compass, AlertCircle, Menu, X } from "lucide-react";

interface TopNavProps {
  unacknowledgedAlertsCount?: number;
  totalProjectsCount?: number;
}

export default function TopNav({
  unacknowledgedAlertsCount = 0,
  totalProjectsCount = 1931,
}: TopNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/projects?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const navLinks = [
    { name: "Home", href: "/", subtext: "" },
    { name: "Portfolio", href: "/projects", subtext: "/projects" },
    { name: "Forecasting", href: "/analytics", subtext: "/analytics" },
    { name: "Risk Radar", href: "/alerts", subtext: "/risk-monitor" },
    { name: "Sectors", href: "/analytics#sectors", subtext: "/sectors" },
    { name: "Map Explorer", href: "/map", subtext: "/geo-map" },
    { name: "AI Officer", href: "/assistant", subtext: "/assistant" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href.split("#")[0])) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-6 h-full text-xs">
          {navLinks.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative h-full flex flex-col justify-center px-1 transition-colors ${
                  active
                    ? "text-slate-900 font-bold"
                    : "text-slate-600 hover:text-slate-900 font-medium"
                }`}
              >
                <div className="flex items-baseline gap-1">
                  <span>{item.name}</span>
                  {item.subtext && (
                    <span className="hidden xl:inline text-[10px] text-slate-400 font-mono">
                      {item.subtext}
                    </span>
                  )}
                </div>
                {/* Saffron Active Underline */}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-serif font-bold text-sm text-slate-900">PAIMAANA</span>
        </div>

        {/* Right Section: Search, Status Badge, Alerts, AI Officer */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <form onSubmit={handleSearch} className="hidden sm:block relative w-48 lg:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            />
          </form>

          {/* Sync Status Badge (Matches Reference Screenshot) */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">April 2026 Synced</span>
          </div>

          {/* Alerts Bell */}
          <Link
            href="/alerts"
            className="relative p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Early Warning System"
          >
            <Bell className="w-4 h-4" />
            {unacknowledgedAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-[10px] text-white font-bold flex items-center justify-center shadow-xs">
                {unacknowledgedAlertsCount > 9 ? "9+" : unacknowledgedAlertsCount}
              </span>
            )}
          </Link>

          {/* AI Officer Button */}
          <Link
            href="/assistant"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="w-3 h-3 text-orange-400" />
            <span className="hidden sm:inline">AI Officer</span>
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          {navLinks.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-orange-50 text-orange-700 font-bold border-l-4 border-orange-600"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          <div className="pt-2">
            <form onSubmit={handleSearch} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects, locations, ministries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}

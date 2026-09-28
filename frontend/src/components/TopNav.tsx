"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, Menu, X, ArrowRight, Bot } from "lucide-react";

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
    { name: "Overview", href: "/" },
    { name: "Portfolio", href: "/projects" },
    { name: "Forecasting", href: "/analytics" },
    { name: "Risk Radar", href: "/alerts" },
    { name: "Sectors", href: "/analytics#sectors" },
    { name: "Map", href: "/map" },
    { name: "AI Officer", href: "/assistant" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href.split("#")[0])) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-12 flex items-center justify-between gap-4">
        {/* Brand / Logo Indicator for Nav */}
        <div className="flex items-center gap-6 h-full">
          <Link href="/" className="font-serif font-bold text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-orange-600" />
            <span>NIRMAAN AI</span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6 h-full text-xs">
            {navLinks.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative h-full flex flex-col justify-center px-0.5 transition-colors ${
                    active
                      ? "text-slate-900 font-bold"
                      : "text-slate-600 hover:text-slate-900 font-medium"
                  }`}
                >
                  <span>{item.name}</span>
                  {/* Saffron Active Underline */}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Right Section: Compact Search, Alert Pill, AI Officer */}
        <div className="flex items-center gap-3">
          {/* Compact Search Form */}
          <form onSubmit={handleSearch} className="hidden sm:block relative w-48 lg:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="search"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-sans"
            />
          </form>

          {/* Alert Notification Indicator */}
          <Link
            href="/alerts"
            className="relative p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors"
            title="Active Risk Alerts"
          >
            <Bell className="w-4 h-4" />
            {unacknowledgedAlertsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center font-mono">
                {unacknowledgedAlertsCount}
              </span>
            )}
          </Link>

          {/* AI Officer Button - Compact Rectangular Institutional Control */}
          <Link
            href="/assistant"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            <Bot className="w-3.5 h-3.5 text-orange-400" />
            <span>AI Officer</span>
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 text-xs">
          <form onSubmit={handleSearch} className="mb-3">
            <input
              type="text"
              name="search"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900"
            />
          </form>

          <div className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-1.5 px-2 rounded font-medium ${
                  isActive(item.href)
                    ? "bg-slate-100 text-orange-700 font-bold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

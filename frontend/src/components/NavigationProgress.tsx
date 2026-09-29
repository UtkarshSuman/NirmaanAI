"use client";

import React, { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // When pathname or searchParams change, mark loading complete
  useEffect(() => {
    setProgress(100);
    const timeout = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 250);
    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  // Intercept client-side link clicks to start progress bar instantly
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target || !target.href) return;

      const targetUrl = new URL(target.href, window.location.href);
      const isInternal = targetUrl.origin === window.location.origin;
      const isHash = targetUrl.pathname === window.location.pathname && targetUrl.hash;
      const isModified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
      const isDownload = target.hasAttribute("download");

      if (isInternal && !isHash && !isModified && !isDownload && targetUrl.pathname !== pathname) {
        setLoading(true);
        setProgress(25);
        const timer1 = setTimeout(() => setProgress(65), 180);
        const timer2 = setTimeout(() => setProgress(85), 450);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => document.removeEventListener("click", handleDocumentClick, { capture: true });
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      {/* Top Progress Track */}
      <div className="h-[3px] w-full bg-orange-100/40 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(249,115,22,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Floating telemetry toast indicator */}
      <div className="absolute top-3 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-mono shadow-lg backdrop-blur-xs border border-slate-700/60 transition-opacity animate-in fade-in duration-200">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span>Syncing Registry Telemetry...</span>
      </div>
    </div>
  );
}

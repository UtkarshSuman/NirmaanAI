"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  // Trigger smooth completion when navigation finishes
  useEffect(() => {
    clearAllTimers();
    // Complete to 100%
    setProgress(100);

    const fadeTimer = setTimeout(() => {
      setVisible(false);
      const resetTimer = setTimeout(() => {
        setProgress(0);
      }, 300);
      timersRef.current.push(resetTimer);
    }, 200);

    timersRef.current.push(fadeTimer);

    return () => clearAllTimers();
  }, [pathname, searchParams]);

  // Intercept client-side link clicks to start progress bar
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
        clearAllTimers();
        setVisible(true);
        setProgress(20);

        // Incremental progression
        const t1 = setTimeout(() => setProgress(45), 120);
        const t2 = setTimeout(() => setProgress(75), 300);
        const t3 = setTimeout(() => setProgress(90), 650);

        // Failsafe auto-complete so it never gets stuck midway
        const tFailsafe = setTimeout(() => {
          setProgress(100);
          setTimeout(() => {
            setVisible(false);
            setProgress(0);
          }, 250);
        }, 1400);

        timersRef.current.push(t1, t2, t3, tFailsafe);
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
      clearAllTimers();
    };
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="h-[2.5px] w-full bg-transparent overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 transition-all duration-200 ease-out shadow-[0_0_8px_rgba(249,115,22,0.9)]"
          style={{
            width: `${progress}%`,
            transition: progress === 100 ? "width 150ms ease-out" : "width 250ms ease-out",
          }}
        />
      </div>
    </div>
  );
}

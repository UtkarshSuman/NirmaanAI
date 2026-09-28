import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProjectTable from "@/components/ProjectTable";
import type { ProjectItem } from "@/lib/types";

interface PriorityProjectsProps {
  projects: ProjectItem[];
  criticalCount: number;
}

export default function PriorityProjects({
  projects,
  criticalCount,
}: PriorityProjectsProps) {
  return (
    <section className="space-y-4 pt-4 border-t border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-200 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-[2px] bg-rose-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Projects Requiring Attention
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Assets exhibiting highest cost escalation percentage under implementation [Sorted by Cost Overrun %].
          </p>
        </div>

        <Link
          href="/projects?risk=CRITICAL"
          className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1"
        >
          <span>View All Escalations ({criticalCount})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Portfolio Register Table */}
      <ProjectTable projects={projects} />
    </section>
  );
}

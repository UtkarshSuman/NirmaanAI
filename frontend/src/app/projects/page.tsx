"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  RefreshCw,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ProjectTable from "@/components/ProjectTable";
import type { ProjectItem } from "@/lib/types";

const SECTORS = [
  "ALL",
  "National Highways",
  "Railways",
  "Power",
  "Petroleum",
  "Urban Development",
  "Water Resources",
  "Coal",
  "Atomic Energy",
  "Civil Aviation",
];

const RISKS = ["ALL", "CRITICAL", "HIGH", "MODERATE", "LOW"];
const STATUSES = ["ALL", "Under Implementation", "Completed", "Shelved"];

function ProjectsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sector, setSector] = useState(searchParams.get("sector") || "ALL");
  const [risk, setRisk] = useState(searchParams.get("risk") || "ALL");
  const [status, setStatus] = useState(searchParams.get("status") || "ALL");
  const [sortBy, setSortBy] = useState("revisedCostCrore");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (sector && sector !== "ALL") params.set("sector", sector);
      if (risk && risk !== "ALL") params.set("risk", risk);
      if (status && status !== "ALL") params.set("status", status);
      params.set("sortBy", sortBy);
      params.set("page", page.toString());
      params.set("limit", "20");

      const res = await fetch(`/api/projects?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  }, [search, sector, risk, status, sortBy, page]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  const exportCsv = () => {
    const headers = ["Project ID", "Name", "Sector", "State", "Cost (Cr)", "Cost Overrun %", "Delay (Mo)", "Status"];
    const rows = projects.map((p) => [
      p.projectId,
      `"${p.projectName.replace(/"/g, '""')}"`,
      p.sector,
      p.state,
      p.revisedCostCrore,
      p.costOverrunPercent,
      p.timeOverrunMonths,
      p.projectStatus,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `paimana_projects_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0d1627] via-[#101b33] to-[#0a1222] border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              National Infrastructure Ledger
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Central Sector Projects Directory</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Query across 1,931 projects with algorithmic risk classification, milestone velocity, and budget variance.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => fetchProjects()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-xs font-semibold text-sky-300 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full group">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-sky-400 transition-colors" />
            <input
              type="text"
              placeholder="Search by project name, ID, ministry, or agency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/15 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500/50"
            >
              <option value="revisedCostCrore">Sort: Cost Outlay (High to Low)</option>
              <option value="costOverrunPercent">Sort: Cost Overrun %</option>
              <option value="timeOverrunMonths">Sort: Delay (Months)</option>
              <option value="physicalProgressPercent">Sort: Progress %</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all shrink-0"
            >
              Search
            </button>
          </div>
        </form>

        {/* Sector Filter Chips */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider shrink-0 mr-1">
              Sector:
            </span>
            {SECTORS.map((sec) => (
              <button
                key={sec}
                onClick={() => {
                  setSector(sec);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  sector === sec
                    ? "bg-sky-500 text-white shadow-sm shadow-sky-500/30 font-semibold"
                    : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Risk and Status Chips */}
          <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-slate-800/60">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider mr-1">
                Risk Tier:
              </span>
              {RISKS.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRisk(r);
                    setPage(1);
                  }}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase transition-all ${
                    risk === r
                      ? r === "CRITICAL"
                        ? "bg-rose-500 text-white shadow-sm shadow-rose-500/30"
                        : r === "HIGH"
                        ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30"
                        : r === "MODERATE"
                        ? "bg-yellow-500 text-slate-950 font-black"
                        : "bg-sky-500 text-white"
                      : "bg-slate-800/60 text-slate-400 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider mr-1">
                Status:
              </span>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(s);
                    setPage(1);
                  }}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
                    status === s
                      ? "bg-slate-100 text-slate-900 font-bold shadow-sm"
                      : "bg-slate-800/60 text-slate-400 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Count Summary */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <span>
          Showing <strong className="text-white">{projects.length}</strong> of{" "}
          <strong className="text-white">{totalCount.toLocaleString()}</strong> projects
        </span>
        <span>
          Page {page} of {totalPages}
        </span>
      </div>

      {/* Table Component */}
      <ProjectTable projects={projects} loading={loading} />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#121929] border border-[#222f46] text-xs font-medium text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1a253c] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-gray-400 font-mono">
            {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#121929] border border-[#222f46] text-xs font-medium text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1a253c] transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-gray-400">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading projects directory...</p>
        </div>
      }
    >
      <ProjectsContent />
    </Suspense>
  );
}

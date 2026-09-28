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
  MapPin,
  X,
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

const STATES_LIST = [
  "ALL",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
];

function ProjectsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || searchParams.get("q") || "");
  const [sector, setSector] = useState(searchParams.get("sector") || "ALL");
  const [state, setState] = useState(searchParams.get("state") || "ALL");
  const [risk, setRisk] = useState(searchParams.get("risk") || "ALL");
  const [status, setStatus] = useState(searchParams.get("status") || "ALL");
  const [sortBy, setSortBy] = useState("revisedCostCrore");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sync state & q param from URL if it changes
  useEffect(() => {
    const urlState = searchParams.get("state");
    if (urlState && urlState !== state) {
      setState(urlState);
      setPage(1);
    }
    const urlQ = searchParams.get("q");
    if (urlQ && urlQ !== search) {
      setSearch(urlQ);
      setPage(1);
    }
  }, [searchParams]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (sector && sector !== "ALL") params.set("sector", sector);
      if (state && state !== "ALL") params.set("state", state);
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
  }, [search, sector, state, risk, status, sortBy, page]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  const clearStateFilter = () => {
    setState("ALL");
    setPage(1);
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
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider bg-orange-50 px-2.5 py-0.5 rounded border border-orange-200">
              National Infrastructure Ledger • April 2026 Cycle
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Central Sector Projects Directory</h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Query across Central Sector projects costing <strong className="text-slate-900 font-semibold">₹150 Crore & above</strong> with algorithmic risk classification, milestone velocity, and budget variance.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => fetchProjects()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full group">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-slate-700 transition-colors" />
            <input
              type="text"
              placeholder="Search by project name, ID, ministry, or agency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all shadow-inner"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* State Filter Selector */}
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium"
            >
              <option value="ALL">All States / UTs</option>
              {STATES_LIST.filter((s) => s !== "ALL").map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium"
            >
              <option value="revisedCostCrore">Cost Outlay (High to Low)</option>
              <option value="costOverrunPercent">Cost Overrun %</option>
              <option value="timeOverrunMonths">Delay (Months)</option>
              <option value="physicalProgressPercent">Progress %</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all shrink-0"
            >
              Search
            </button>
          </div>
        </form>

        {/* Active Filter Badges */}
        {state !== "ALL" && (
          <div className="flex items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500">Active State Filter:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 border border-orange-200 text-xs font-semibold">
              <MapPin className="w-3 h-3 text-orange-600" />
              <span>{state}</span>
              <button onClick={clearStateFilter} className="hover:text-orange-950 ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}

        {/* Sector Filter Chips */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider shrink-0 mr-1">
              Sector:
            </span>
            {SECTORS.map((sec) => (
              <button
                key={sec}
                onClick={() => {
                  setSector(sec);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  sector === sec
                    ? "bg-slate-900 text-white shadow-sm font-semibold"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Risk and Status Chips */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mr-1">
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
                        ? "bg-rose-600 text-white shadow-sm"
                        : r === "HIGH"
                        ? "bg-orange-500 text-white shadow-sm"
                        : r === "MODERATE"
                        ? "bg-amber-500 text-white shadow-sm"
                        : "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mr-1">
                Status:
              </span>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(s);
                    setPage(1);
                  }}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                    status === s
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-900 font-mono">{projects.length}</strong> of{" "}
            <strong className="text-slate-900 font-mono">{totalCount}</strong> matching projects
          </div>
          <div>
            Page <strong className="text-slate-900 font-mono">{page}</strong> of{" "}
            <strong className="text-slate-900 font-mono">{totalPages}</strong>
          </div>
        </div>

        {loading ? (
          <div className="p-16 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center gap-3 shadow-sm">
            <RefreshCw className="w-6 h-6 text-slate-600 animate-spin" />
            <p className="text-xs text-slate-600 font-medium">Querying PAIMAANA Ledger Database...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-16 rounded-xl bg-white border border-slate-200 text-center space-y-2 shadow-sm">
            <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">No matching projects found</p>
            <p className="text-xs text-slate-500">Try adjusting your search terms, state, sector, or risk filters.</p>
          </div>
        ) : (
          <ProjectTable projects={projects} />
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="font-mono text-slate-600 font-medium">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-600" />
          <p className="text-xs font-medium">Loading PAIMAANA Infrastructure Directory...</p>
        </div>
      }
    >
      <ProjectsContent />
    </Suspense>
  );
}

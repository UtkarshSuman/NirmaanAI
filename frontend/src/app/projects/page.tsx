"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
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
  UploadCloud,
  Plus,
} from "lucide-react";
import ProjectTable from "@/components/ProjectTable";
import CufIngestionModal from "@/components/CufIngestionModal";
import AddProjectModal from "@/components/AddProjectModal";
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
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sector, setSector] = useState(searchParams.get("sector") || "ALL");
  const [state, setState] = useState(searchParams.get("state") || "ALL");
  const [risk, setRisk] = useState(searchParams.get("risk") || "ALL");
  const [status, setStatus] = useState(searchParams.get("status") || "ALL");
  const [sortBy, setSortBy] = useState("revisedCostCrore");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Sync state & search param from URL if it changes
  useEffect(() => {
    const urlState = searchParams.get("state");
    if (urlState && urlState !== state) {
      setState(urlState);
      setPage(1);
    }
    const urlSearch = searchParams.get("search");
    if (urlSearch && urlSearch !== search) {
      setSearch(urlSearch);
      setPage(1);
    }
    const urlSector = searchParams.get("sector");
    if (urlSector && urlSector !== sector) {
      setSector(urlSector);
      setPage(1);
    }
    const urlRisk = searchParams.get("risk");
    if (urlRisk && urlRisk !== risk) {
      setRisk(urlRisk);
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
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.replace(`/projects?${params.toString()}`);
    fetchProjects();
  };

  const clearStateFilter = () => {
    setState("ALL");
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("state");
    params.set("page", "1");
    router.replace(`/projects?${params.toString()}`);
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
    link.setAttribute("download", `nirmaan_projects_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Editorial Header (Open Section, Not Heavy Box) */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3.5 h-[2px] bg-gov-saffron" />
            <span className="text-xs font-semibold text-gov-saffron uppercase tracking-wider">
              National Infrastructure Ledger • Central Sector Assets
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Central Sector Projects Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed font-sans">
            Central Sector infrastructure assets costing <strong className="text-slate-900 font-semibold">₹150 Crore &amp; above</strong> with algorithmic risk classification, milestone velocity, and budget variance.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-add-new-project"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-colors shadow-2xs cursor-pointer"
            title="Register New Infrastructure Project"
          >
            <Plus className="w-3.5 h-3.5 text-gov-saffron" />
            <span>Add Project</span>
          </button>
          <Link
            href="/ingest"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-700 text-xs font-semibold text-white transition-colors shadow-2xs"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Ingest CUF Service</span>
          </Link>
          <button
            onClick={() => setShowIngestModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="Open Quick Ingest Modal"
          >
            <span>Quick Modal</span>
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => fetchProjects()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gov-navy hover:bg-slate-800 text-xs font-semibold text-white transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Exploration Toolbar (Compact, Professional Tooling) */}
      <div className="p-4 rounded border border-slate-200 bg-white space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="search"
              placeholder="Search by project name, ID, ministry, or agency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-500 focus:bg-white transition-colors font-sans"
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
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-500 font-medium"
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
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-500 font-medium"
            >
              <option value="revisedCostCrore">Sort: Cost Outlay (High to Low)</option>
              <option value="costOverrunPercent">Sort: Cost Overrun %</option>
              <option value="timeOverrunMonths">Sort: Delay (Months)</option>
              <option value="physicalProgressPercent">Sort: Progress %</option>
            </select>

            <button
              type="submit"
              className="px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shrink-0"
            >
              Search
            </button>
          </div>
        </form>

        {/* Active Filter Badges */}
        {state !== "ALL" && (
          <div className="flex items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500 font-medium">Filtered by:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-50 text-orange-800 border border-orange-200 text-xs font-semibold">
              <MapPin className="w-3 h-3 text-orange-600" />
              <span>{state}</span>
              <button onClick={clearStateFilter} className="hover:text-orange-950 ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}

        {/* Sector Filter Chips */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider shrink-0 mr-1">
              Sector:
            </span>
            {SECTORS.map((sec) => (
              <button
                key={sec}
                onClick={() => {
                  setSector(sec);
                  setPage(1);
                }}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                  sector === sec
                    ? "bg-slate-900 text-white font-semibold"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Risk and Status Chips */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mr-1">
                Risk Tier:
              </span>
              {RISKS.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRisk(r);
                    setPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase transition-colors ${
                    risk === r
                      ? r === "CRITICAL"
                        ? "bg-gov-red text-white font-bold"
                        : r === "HIGH"
                        ? "bg-gov-saffron text-white font-bold"
                        : r === "MODERATE"
                        ? "bg-amber-600 text-white font-bold"
                        : "bg-gov-teal text-white font-bold"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mr-1">
                Status:
              </span>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(s);
                    setPage(1);
                  }}
                  className={`px-2 py-0.2 rounded text-[11px] transition-colors ${
                    status === s
                      ? "bg-slate-900 text-white font-semibold"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
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
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
          <div>
            Showing <strong className="text-slate-900">{projects.length}</strong> of{" "}
            <strong className="text-slate-900">{totalCount}</strong> matching projects
          </div>
          <div>
            Page {page} of {totalPages}
          </div>
        </div>

        {loading ? (
          <div className="p-12 rounded bg-white border border-slate-200 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 text-slate-600 animate-spin" />
            <p className="text-xs text-slate-600 font-mono">Querying NIRMAAN AI Ledger Database...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 rounded bg-white border border-dashed border-slate-200 text-center space-y-2">
            <Building2 className="w-7 h-7 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">No matching projects found</p>
            <p className="text-[11px] text-slate-400">Try adjusting your search terms, state, sector, or risk filters.</p>
            <div className="pt-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-gov-saffron" />
                <span>Register New Project</span>
              </button>
            </div>
          </div>
        ) : (
          <ProjectTable projects={projects} />
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-white border border-slate-300 text-slate-700 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="font-mono text-slate-600 text-[11px]">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-white border border-slate-300 text-slate-700 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Live CUF Excel/CSV Ingestion Modal */}
      <CufIngestionModal
        isOpen={showIngestModal}
        onClose={() => setShowIngestModal(false)}
        onIngestionSuccess={() => {
          fetchProjects();
        }}
      />

      {/* Manual Entry Add Project Modal */}
      <AddProjectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchProjects();
        }}
      />
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400 bg-white rounded border border-slate-200">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
          <p className="text-xs font-mono">Loading NIRMAAN AI Infrastructure Directory...</p>
        </div>
      }
    >
      <ProjectsContent />
    </Suspense>
  );
}

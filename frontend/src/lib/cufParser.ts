import * as XLSX from "xlsx";

export interface ParsedCufRecord {
  projectId: string;
  projectName: string;
  sector: string;
  subSector?: string;
  state: string;
  district?: string;
  implementingAgency: string;
  ministryDepartment: string;
  originalCostCrore: number;
  revisedCostCrore: number;
  anticipatedCostCrore?: number;
  cumulativeExpenditureCrore: number;
  physicalProgressPercent: number;
  financialProgressPercent: number;
  projectStatus: string;
  costOverrunPercent: number;
  timeOverrunMonths: number;
  milestoneAchievedCount: number;
  milestoneTotalCount: number;
  [key: string]: any;
}

export interface CufValidationResult {
  records: ParsedCufRecord[];
  totalRows: number;
  validCount: number;
  errorCount: number;
  errors: Array<{ row: number; field?: string; message: string }>;
  warnings: Array<{ row: number; field?: string; message: string }>;
  totalCostCrore: number;
  sectorsDetected: string[];
}

export const OFFICIAL_CUF_COLUMNS = [
  "project_id",
  "project_name",
  "ministry_department",
  "sector",
  "sub_sector",
  "state",
  "district",
  "implementing_agency",
  "original_cost_crore",
  "revised_cost_crore",
  "anticipated_cost_crore",
  "cumulative_expenditure_crore",
  "expenditure_current_year_crore",
  "expenditure_previous_year_crore",
  "land_acquisition_cost_crore",
  "original_start_date",
  "original_completion_date",
  "revised_completion_date",
  "anticipated_completion_date",
  "year_of_approval",
  "physical_progress_percent",
  "financial_progress_percent",
  "milestone_achieved_count",
  "milestone_total_count",
  "project_status",
  "cost_overrun_percent",
  "time_overrun_months",
  "reason_for_delay",
  "cost_revision_count",
  "schedule_revision_count",
  "last_updated",
];

export const DEMO_CUF_RECORDS: ParsedCufRecord[] = [
  {
    projectId: "PRJ-NH-9011",
    projectName: "Delhi-Dehradun Economic Corridor Expressway (Package 4)",
    sector: "National Highways",
    subSector: "Expressway",
    state: "Uttarakhand",
    district: "Dehradun",
    implementingAgency: "NHAI",
    ministryDepartment: "Ministry of Road Transport & Highways",
    originalCostCrore: 8450.0,
    revisedCostCrore: 10120.5,
    anticipatedCostCrore: 10450.0,
    cumulativeExpenditureCrore: 6780.2,
    physicalProgressPercent: 68.5,
    financialProgressPercent: 67.0,
    projectStatus: "Under Implementation",
    costOverrunPercent: 19.77,
    timeOverrunMonths: 14,
    milestoneAchievedCount: 16,
    milestoneTotalCount: 22,
    reasonForDelay: "Eco-sensitive zone tunnel clearances and forest diversion",
  },
  {
    projectId: "PRJ-RW-9012",
    projectName: "Eastern Dedicated Freight Corridor (Sonnagar - Dankuni PPP Section)",
    sector: "Railways",
    subSector: "Freight Corridor",
    state: "West Bengal",
    district: "Hooghly",
    implementingAgency: "DFCCIL",
    ministryDepartment: "Ministry of Railways",
    originalCostCrore: 14920.0,
    revisedCostCrore: 18650.0,
    anticipatedCostCrore: 19100.0,
    cumulativeExpenditureCrore: 9325.0,
    physicalProgressPercent: 51.2,
    financialProgressPercent: 50.0,
    projectStatus: "Under Implementation",
    costOverrunPercent: 25.0,
    timeOverrunMonths: 28,
    milestoneAchievedCount: 12,
    milestoneTotalCount: 25,
    reasonForDelay: "PPP concessionaire restructuring and linear land acquisition",
  },
  {
    projectId: "PRJ-PW-9013",
    projectName: "Ultra Mega Renewable Solar & Wind Hybrid Energy Park 2400MW",
    sector: "Power",
    subSector: "Renewable Energy",
    state: "Gujarat",
    district: "Kutch",
    implementingAgency: "NTPC REL",
    ministryDepartment: "Ministry of Power",
    originalCostCrore: 12400.0,
    revisedCostCrore: 12400.0,
    anticipatedCostCrore: 12350.0,
    cumulativeExpenditureCrore: 11160.0,
    physicalProgressPercent: 92.0,
    financialProgressPercent: 90.0,
    projectStatus: "Under Implementation",
    costOverrunPercent: 0.0,
    timeOverrunMonths: 0,
    milestoneAchievedCount: 19,
    milestoneTotalCount: 20,
    reasonForDelay: "",
  },
  {
    projectId: "PRJ-UB-9014",
    projectName: "Bengaluru Metro Rail Phase 2B (KR Puram to Airport Line)",
    sector: "Urban Development",
    subSector: "Metro Rail",
    state: "Karnataka",
    district: "Bengaluru Urban",
    implementingAgency: "BMRCL",
    ministryDepartment: "Ministry of Housing and Urban Affairs",
    originalCostCrore: 9611.0,
    revisedCostCrore: 10580.0,
    anticipatedCostCrore: 10900.0,
    cumulativeExpenditureCrore: 4761.0,
    physicalProgressPercent: 46.8,
    financialProgressPercent: 45.0,
    projectStatus: "Under Implementation",
    costOverrunPercent: 10.08,
    timeOverrunMonths: 9,
    milestoneAchievedCount: 11,
    milestoneTotalCount: 24,
    reasonForDelay: "Utility shifting along arterial airport highway corridor",
  },
  {
    projectId: "PRJ-PT-9015",
    projectName: "Paradip-Hyderabad Multi-Product Petroleum Pipeline Expansion",
    sector: "Petroleum",
    subSector: "Pipelines",
    state: "Odisha",
    district: "Jagatsinghpur",
    implementingAgency: "IOCL",
    ministryDepartment: "Ministry of Petroleum and Natural Gas",
    originalCostCrore: 3800.0,
    revisedCostCrore: 3950.0,
    anticipatedCostCrore: 3950.0,
    cumulativeExpenditureCrore: 3752.5,
    physicalProgressPercent: 98.4,
    financialProgressPercent: 95.0,
    projectStatus: "Under Implementation",
    costOverrunPercent: 3.95,
    timeOverrunMonths: 2,
    milestoneAchievedCount: 18,
    milestoneTotalCount: 18,
    reasonForDelay: "Right of user acquisition in river crossing segments",
  },
];

/**
 * Parses a File object (CSV or Excel) in browser memory
 */
export async function parseCufFile(file: File): Promise<CufValidationResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  return validateAndFormatCufRecords(rawRows);
}

/**
 * Validates and standardizes arbitrary row objects into validated CUF records
 */
export function validateAndFormatCufRecords(rawRows: any[]): CufValidationResult {
  const errors: Array<{ row: number; field?: string; message: string }> = [];
  const warnings: Array<{ row: number; field?: string; message: string }> = [];
  const records: ParsedCufRecord[] = [];
  const sectorsSet = new Set<string>();
  let totalCostCrore = 0;

  rawRows.forEach((row, index) => {
    const rowNum = index + 2;
    // Map case/space variations
    const normalized: Record<string, any> = {};
    for (const [k, v] of Object.entries(row)) {
      const cleanKey = k.trim().toLowerCase().replace(/[\s\-_]+/g, "_");
      normalized[cleanKey] = v;
    }

    const projectId = (
      normalized.project_id ||
      normalized.projectid ||
      normalized.id ||
      ""
    ).toString().trim();

    const projectName = (
      normalized.project_name ||
      normalized.projectname ||
      normalized.name ||
      ""
    ).toString().trim();

    if (!projectId) {
      errors.push({ row: rowNum, field: "project_id", message: "Missing project ID" });
      return;
    }

    if (!projectName) {
      errors.push({ row: rowNum, field: "project_name", message: "Missing project name" });
      return;
    }

    const parseVal = (val: any, fallback = 0) => {
      if (val === "" || val === null || val === undefined) return fallback;
      const num = parseFloat(String(val).replace(/,/g, "").replace(/₹/g, "").replace(/%/g, ""));
      return isNaN(num) ? fallback : num;
    };

    const origCost = parseVal(normalized.original_cost_crore || normalized.original_cost, 150);
    const revCost = parseVal(normalized.revised_cost_crore || normalized.revised_cost, origCost);
    const expCost = parseVal(normalized.cumulative_expenditure_crore || normalized.expenditure, 0);

    let costOverrun = parseVal(normalized.cost_overrun_percent, 0);
    if (costOverrun === 0 && origCost > 0 && revCost !== origCost) {
      costOverrun = Number((((revCost - origCost) / origCost) * 100).toFixed(2));
    }

    const physProg = Math.min(100, Math.max(0, parseVal(normalized.physical_progress_percent, 0)));
    let finProg = parseVal(normalized.financial_progress_percent, 0);
    if (finProg === 0 && revCost > 0 && expCost > 0) {
      finProg = Math.min(100, Number(((expCost / revCost) * 100).toFixed(1)));
    }

    const timeOverrun = Math.max(0, Math.round(parseVal(normalized.time_overrun_months, 0)));
    const sector = normalized.sector || "General Infrastructure";
    sectorsSet.add(sector);
    totalCostCrore += revCost;

    if (!normalized.ministry_department) {
      warnings.push({ row: rowNum, field: "ministry_department", message: "Defaulted to Ministry of Infrastructure" });
    }

    records.push({
      projectId,
      projectName,
      sector,
      subSector: normalized.sub_sector || undefined,
      state: normalized.state || "National",
      district: normalized.district || undefined,
      implementingAgency: normalized.implementing_agency || "Implementing Agency",
      ministryDepartment: normalized.ministry_department || "Ministry of Infrastructure",
      originalCostCrore: origCost,
      revisedCostCrore: revCost,
      anticipatedCostCrore: parseVal(normalized.anticipated_cost_crore, revCost),
      cumulativeExpenditureCrore: expCost,
      physicalProgressPercent: physProg,
      financialProgressPercent: finProg,
      projectStatus: normalized.project_status || (physProg >= 100 ? "Completed" : "Under Implementation"),
      costOverrunPercent: costOverrun,
      timeOverrunMonths: timeOverrun,
      milestoneAchievedCount: Math.round(parseVal(normalized.milestone_achieved_count, 0)),
      milestoneTotalCount: Math.max(1, Math.round(parseVal(normalized.milestone_total_count, 1))),
      reasonForDelay: normalized.reason_for_delay || (timeOverrun > 0 ? "Statutory clearances" : ""),
    });
  });

  return {
    records,
    totalRows: rawRows.length,
    validCount: records.length,
    errorCount: errors.length,
    errors,
    warnings,
    totalCostCrore: Number(totalCostCrore.toFixed(2)),
    sectorsDetected: Array.from(sectorsSet),
  };
}

/**
 * Triggers browser download of official MoSPI CUF Template
 */
export function downloadCufTemplate(format: "csv" | "xlsx" = "csv") {
  const sampleHeaders = OFFICIAL_CUF_COLUMNS;
  const sampleRow1 = [
    "PRJ-EX-9901",
    "High-Speed Intercity Rail Corridor Phase 1",
    "Ministry of Railways",
    "Railways",
    "High Speed Rail",
    "Maharashtra",
    "Thane",
    "NHSRCL",
    "12500.00",
    "14200.00",
    "14500.00",
    "8520.00",
    "1400.00",
    "2100.00",
    "1800.00",
    "2020-01-15",
    "2025-12-31",
    "2027-06-30",
    "2027-08-31",
    "2019",
    "60.0",
    "60.0",
    "15",
    "25",
    "Under Implementation",
    "13.60",
    "18",
    "Viaduct right-of-way handover delays",
    "1",
    "1",
    new Date().toISOString().split("T")[0],
  ];

  const sampleRow2 = [
    "PRJ-EX-9902",
    "Green Hydrogen Integrated Port Terminal Facility",
    "Ministry of Ports, Shipping and Waterways",
    "Shipping and Ports",
    "Bulk Terminal",
    "Odisha",
    "Paradip",
    "Paradip Port Authority",
    "3200.00",
    "3200.00",
    "3200.00",
    "2850.00",
    "650.00",
    "1200.00",
    "300.00",
    "2021-06-01",
    "2025-03-31",
    "2025-03-31",
    "2025-03-31",
    "2021",
    "89.0",
    "89.0",
    "9",
    "10",
    "Under Implementation",
    "0.00",
    "0",
    "",
    "0",
    "0",
    new Date().toISOString().split("T")[0],
  ];

  if (format === "csv") {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [sampleHeaders.join(","), sampleRow1.join(","), sampleRow2.join(",")].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mospi_paimana_cuf_template_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    const ws = XLSX.utils.aoa_to_sheet([sampleHeaders, sampleRow1, sampleRow2]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MoSPI_CUF_Upload");
    XLSX.writeFile(wb, `mospi_paimana_cuf_template_${new Date().toISOString().split("T")[0]}.xlsx`);
  }
}

/**
 * Transforms any project record into an official 30-field MoSPI CUF row object
 */
export function exportProjectToCufRecord(project: any): Record<string, any> {
  const origCost = parseFloat(project.originalCostCrore) || 150;
  const revCost = parseFloat(project.revisedCostCrore) || origCost;
  let costOverrun = parseFloat(project.costOverrunPercent) || 0;
  if (costOverrun === 0 && origCost > 0 && revCost !== origCost) {
    costOverrun = Number((((revCost - origCost) / origCost) * 100).toFixed(2));
  }

  const expCost = parseFloat(project.cumulativeExpenditureCrore) || 0;
  const physProg = parseFloat(project.physicalProgressPercent) || 0;
  let finProg = parseFloat(project.financialProgressPercent) || 0;
  if (finProg === 0 && revCost > 0 && expCost > 0) {
    finProg = Number(((expCost / revCost) * 100).toFixed(1));
  }

  return {
    project_id: project.projectId,
    project_name: project.projectName,
    ministry_department: project.ministryDepartment || "Ministry of Infrastructure",
    sector: project.sector || "General Infrastructure",
    sub_sector: project.subSector || "",
    state: project.state || "National",
    district: project.district || "",
    implementing_agency: project.implementingAgency || "Agency",
    original_cost_crore: origCost,
    revised_cost_crore: revCost,
    anticipated_cost_crore: parseFloat(project.anticipatedCostCrore) || revCost,
    cumulative_expenditure_crore: expCost,
    expenditure_current_year_crore: parseFloat(project.expenditureCurrentYearCrore) || 0,
    expenditure_previous_year_crore: parseFloat(project.expenditurePreviousYearCrore) || 0,
    land_acquisition_cost_crore: parseFloat(project.landAcquisitionCostCrore) || 0,
    original_start_date: project.originalStartDate ? new Date(project.originalStartDate).toISOString().split("T")[0] : "2020-01-01",
    original_completion_date: project.originalCompletionDate ? new Date(project.originalCompletionDate).toISOString().split("T")[0] : "2025-12-31",
    revised_completion_date: project.revisedCompletionDate ? new Date(project.revisedCompletionDate).toISOString().split("T")[0] : "2026-12-31",
    anticipated_completion_date: project.anticipatedCompletionDate ? new Date(project.anticipatedCompletionDate).toISOString().split("T")[0] : "2026-12-31",
    year_of_approval: parseInt(project.yearOfApproval) || 2020,
    physical_progress_percent: physProg,
    financial_progress_percent: finProg,
    milestone_achieved_count: parseInt(project.milestoneAchievedCount) || 0,
    milestone_total_count: parseInt(project.milestoneTotalCount) || 10,
    project_status: project.projectStatus || "Under Implementation",
    cost_overrun_percent: costOverrun,
    time_overrun_months: parseInt(project.timeOverrunMonths) || 0,
    reason_for_delay: project.reasonForDelay || "",
    cost_revision_count: parseInt(project.costRevisionCount) || (revCost > origCost ? 1 : 0),
    schedule_revision_count: parseInt(project.scheduleRevisionCount) || 0,
    last_updated: new Date().toISOString().split("T")[0],
  };
}

/**
 * Generates and downloads a valid MoSPI CUF spreadsheet (.csv or .xlsx) for a given project
 */
export function downloadProjectCufFile(project: any, format: "csv" | "xlsx" = "csv") {
  const cufRow = exportProjectToCufRecord(project);
  const headers = OFFICIAL_CUF_COLUMNS;
  const values = headers.map((h) => cufRow[h] ?? "");

  const safeProjectId = (project.projectId || "project").replace(/[^a-zA-Z0-9-_]/g, "_");
  const filename = `cuf_export_${safeProjectId}_${new Date().toISOString().split("T")[0]}`;

  if (format === "csv") {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        values
          .map((v) => {
            const s = String(v).replace(/"/g, '""');
            return `"${s}"`;
          })
          .join(","),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    const ws = XLSX.utils.aoa_to_sheet([headers, values]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MoSPI_CUF_Upload");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }
}


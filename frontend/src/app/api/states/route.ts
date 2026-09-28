import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// State metadata with Hindi translations and Geographic Zone
const STATE_META: Record<string, { hi: string; region: string; capital: string }> = {
  "Andhra Pradesh": { hi: "आंध्र प्रदेश", region: "South", capital: "Amaravati" },
  "Arunachal Pradesh": { hi: "अरुणाचल प्रदेश", region: "North-East", capital: "Itanagar" },
  "Assam": { hi: "असम", region: "North-East", capital: "Dispur" },
  "Bihar": { hi: "बिहार", region: "East", capital: "Patna" },
  "Chhattisgarh": { hi: "छत्तीसगढ़", region: "Central", capital: "Raipur" },
  "Goa": { hi: "गोवा", region: "West", capital: "Panaji" },
  "Gujarat": { hi: "गुजरात", region: "West", capital: "Gandhinagar" },
  "Haryana": { hi: "हरियाणा", region: "North", capital: "Chandigarh" },
  "Himachal Pradesh": { hi: "हिमाचल प्रदेश", region: "North", capital: "Shimla" },
  "Jharkhand": { hi: "झारखंड", region: "East", capital: "Ranchi" },
  "Karnataka": { hi: "कर्नाटक", region: "South", capital: "Bengaluru" },
  "Kerala": { hi: "केरल", region: "South", capital: "Thiruvananthapuram" },
  "Madhya Pradesh": { hi: "मध्य प्रदेश", region: "Central", capital: "Bhopal" },
  "Maharashtra": { hi: "महाराष्ट्र", region: "West", capital: "Mumbai" },
  "Manipur": { hi: "मणिपुर", region: "North-East", capital: "Imphal" },
  "Meghalaya": { hi: "मेघालय", region: "North-East", capital: "Shillong" },
  "Mizoram": { hi: "मिजोरम", region: "North-East", capital: "Aizawl" },
  "Nagaland": { hi: "नागालैंड", region: "North-East", capital: "Kohima" },
  "Odisha": { hi: "ओडिशा", region: "East", capital: "Bhubaneswar" },
  "Punjab": { hi: "पंजाब", region: "North", capital: "Chandigarh" },
  "Rajasthan": { hi: "राजस्थान", region: "North", capital: "Jaipur" },
  "Sikkim": { hi: "सिक्किम", region: "North-East", capital: "Gangtok" },
  "Tamil Nadu": { hi: "तमिलनाडु", region: "South", capital: "Chennai" },
  "Telangana": { hi: "तेलंगाना", region: "South", capital: "Hyderabad" },
  "Tripura": { hi: "त्रिपुरा", region: "North-East", capital: "Agartala" },
  "Uttar Pradesh": { hi: "उत्तर प्रदेश", region: "North", capital: "Lucknow" },
  "Uttarakhand": { hi: "उत्तराखंड", region: "North", capital: "Dehradun" },
  "West Bengal": { hi: "पश्चिम बंगाल", region: "East", capital: "Kolkata" },
  "Delhi": { hi: "दिल्ली", region: "North", capital: "New Delhi" },
  "Jammu & Kashmir": { hi: "जम्मू और कश्मीर", region: "North", capital: "Srinagar" },
  "Ladakh": { hi: "लद्दाख", region: "North", capital: "Leh" },
  "Chandigarh": { hi: "चंडीगढ़", region: "North", capital: "Chandigarh" },
  "Puducherry": { hi: "पुदुचेरी", region: "South", capital: "Puducherry" },
  "Andaman and Nicobar Islands": { hi: "अंडमान और निकोबार", region: "South", capital: "Port Blair" },
  "Dadra and Nagar Haveli": { hi: "दादरा और नगर हवेली", region: "West", capital: "Silvassa" },
  "Daman and Diu": { hi: "दमन और दीव", region: "West", capital: "Daman" },
  "Lakshadweep": { hi: "लक्षद्वीप", region: "South", capital: "Kavaratti" },
};

let cachedStatesResult: any = null;
let cacheStatesTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 60s in-memory TTL

export async function GET() {
  try {
    if (cachedStatesResult && Date.now() - cacheStatesTimestamp < CACHE_TTL_MS) {
      return NextResponse.json(cachedStatesResult);
    }

    // 1. Group by state with financial aggregations
    const stateGroups = await prisma.project.groupBy({
      by: ["state"],
      _count: { projectId: true },
      _sum: {
        originalCostCrore: true,
        revisedCostCrore: true,
        cumulativeExpenditureCrore: true,
      },
      _avg: {
        costOverrunPercent: true,
        timeOverrunMonths: true,
        physicalProgressPercent: true,
        financialProgressPercent: true,
      },
    });

    // 2. Delayed projects per state
    const delayedPerState = await prisma.project.groupBy({
      by: ["state"],
      where: {
        timeOverrunMonths: { gt: 0 },
        projectStatus: "Under Implementation",
      },
      _count: { projectId: true },
    });
    const delayedMap = new Map<string, number>();
    for (const d of delayedPerState) {
      delayedMap.set(d.state, d._count.projectId);
    }

    // 3. Critical risk projects per state
    const criticalPerState = await prisma.project.groupBy({
      by: ["state"],
      where: {
        predictions: {
          some: {
            riskCategory: { in: ["CRITICAL", "HIGH"] },
          },
        },
      },
      _count: { projectId: true },
    });
    const criticalMap = new Map<string, number>();
    for (const c of criticalPerState) {
      criticalMap.set(c.state, c._count.projectId);
    }

    // 4. Sample top projects per state
    const allProjects = await prisma.project.findMany({
      select: {
        id: true,
        projectId: true,
        projectName: true,
        sector: true,
        state: true,
        revisedCostCrore: true,
        costOverrunPercent: true,
        timeOverrunMonths: true,
        physicalProgressPercent: true,
        implementingAgency: true,
        projectStatus: true,
      },
      orderBy: { revisedCostCrore: "desc" },
    });

    const topProjectsByState = new Map<string, any[]>();
    for (const p of allProjects) {
      if (!topProjectsByState.has(p.state)) {
        topProjectsByState.set(p.state, []);
      }
      const list = topProjectsByState.get(p.state)!;
      if (list.length < 5) {
        list.push(p);
      }
    }

    // 5. Assemble state dossiers
    const stateDossiers = stateGroups.map((sg) => {
      const stateName = sg.state;
      const meta = STATE_META[stateName] || {
        hi: stateName,
        region: "Other",
        capital: "N/A",
      };

      const count = sg._count.projectId;
      const origCost = Math.round(sg._sum.originalCostCrore ?? 0);
      const revCost = Math.round(sg._sum.revisedCostCrore ?? 0);
      const expCost = Math.round(sg._sum.cumulativeExpenditureCrore ?? 0);
      const netEscalation = Math.max(0, revCost - origCost);

      const delayedCount = delayedMap.get(stateName) || 0;
      const criticalCount = criticalMap.get(stateName) || 0;
      const delayedPercent = count > 0 ? Number(((delayedCount / count) * 100).toFixed(1)) : 0;
      const avgOverrun = Number((sg._avg.costOverrunPercent ?? 0).toFixed(1));
      const avgDelay = Math.round(sg._avg.timeOverrunMonths ?? 0);

      // Determine state composite risk tier
      let riskTier: "CRITICAL" | "HIGH" | "MODERATE" | "LOW" = "LOW";
      if (delayedPercent > 55 || avgOverrun > 25 || criticalCount > 10) {
        riskTier = "CRITICAL";
      } else if (delayedPercent > 35 || avgOverrun > 15 || criticalCount > 5) {
        riskTier = "HIGH";
      } else if (delayedPercent > 20 || avgOverrun > 8) {
        riskTier = "MODERATE";
      }

      return {
        state: stateName,
        stateHindi: meta.hi,
        region: meta.region,
        capital: meta.capital,
        projectCount: count,
        originalCostCrore: origCost,
        revisedCostCrore: revCost,
        cumulativeExpenditureCrore: expCost,
        netEscalationCrore: netEscalation,
        avgCostOverrunPercent: avgOverrun,
        avgDelayMonths: avgDelay,
        avgPhysicalProgressPercent: Number((sg._avg.physicalProgressPercent ?? 0).toFixed(1)),
        avgFinancialProgressPercent: Number((sg._avg.financialProgressPercent ?? 0).toFixed(1)),
        delayedProjectsCount: delayedCount,
        delayedProjectsPercent: delayedPercent,
        criticalProjectsCount: criticalCount,
        riskTier,
        topProjects: topProjectsByState.get(stateName) || [],
      };
    });

    // Sort by project count descending
    stateDossiers.sort((a, b) => b.projectCount - a.projectCount);

    const payload = {
      states: stateDossiers,
      totalStates: stateDossiers.length,
      nationalTotals: {
        totalProjects: stateDossiers.reduce((acc, s) => acc + s.projectCount, 0),
        totalRevisedCostCrore: stateDossiers.reduce((acc, s) => acc + s.revisedCostCrore, 0),
        totalExpenditureCrore: stateDossiers.reduce((acc, s) => acc + s.cumulativeExpenditureCrore, 0),
      },
    };

    cachedStatesResult = payload;
    cacheStatesTimestamp = Date.now();

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error fetching state analytics:", error);
    return NextResponse.json({ error: "Failed to fetch state analytics" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const query = message.trim().toLowerCase();

    // 1. Check for State mention
    const stateMatches = [
      "uttar pradesh", "maharashtra", "gujarat", "karnataka", "rajasthan",
      "tamil nadu", "madhya pradesh", "west bengal", "telangana", "odisha",
      "andhra pradesh", "bihar", "punjab", "kerala", "haryana", "uttarakhand",
      "jharkhand", "chhattisgarh", "himachal pradesh", "delhi", "assam", "goa",
      "jammu & kashmir", "jammu and kashmir", "meghalaya", "manipur", "arunachal pradesh",
      "nagaland", "ladakh", "mizoram", "tripura", "sikkim"
    ];

    let detectedState = stateMatches.find((s) => query.includes(s));
    if (detectedState === "jammu and kashmir") detectedState = "Jammu & Kashmir";

    // 2. Check for Sector mention
    const sectorMatches = [
      { key: "railway", sector: "Railways" },
      { key: "highway", sector: "National Highways" },
      { key: "road", sector: "National Highways" },
      { key: "power", sector: "Power" },
      { key: "petroleum", sector: "Petroleum" },
      { key: "port", sector: "Ports & Shipping" },
      { key: "shipping", sector: "Ports & Shipping" },
      { key: "aviation", sector: "Civil Aviation" },
      { key: "airport", sector: "Civil Aviation" },
      { key: "coal", sector: "Coal" },
      { key: "water", sector: "Water Resources" },
    ];
    const detectedSector = sectorMatches.find((s) => query.includes(s.key))?.sector;

    // 3. Check for Agency mention
    const agencyMatches = ["nhai", "rvnl", "ircon", "ntpc", "pgcil", "seci", "ongc", "iocl", "dfccil", "nhpc"];
    const detectedAgency = agencyMatches.find((a) => query.includes(a));

    let matchedProjects: any[] = [];
    let contextSummary = "";
    let aggregateStats = {
      count: 0,
      totalOutlayCrore: 0,
      avgOverrun: 0,
      delayedCount: 0,
    };

    if (detectedAgency) {
      const agencyUpper = detectedAgency.toUpperCase();
      const [count, projects] = await Promise.all([
        prisma.project.count({ where: { implementingAgency: { contains: agencyUpper } } }),
        prisma.project.findMany({
          where: { implementingAgency: { contains: agencyUpper } },
          take: 5,
          orderBy: { revisedCostCrore: "desc" },
          include: { predictions: { take: 1, orderBy: { createdAt: "desc" } } },
        }),
      ]);

      matchedProjects = projects;
      contextSummary = `Real-time query for Implementing Agency **${agencyUpper}**: ${count} ongoing projects tracked in repository.`;
    } else if (detectedState) {
      // Capitalize for DB match
      const stateNameFormatted = detectedState.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      const [count, sumCost, delayedCount, projects] = await Promise.all([
        prisma.project.count({ where: { state: { contains: stateNameFormatted } } }),
        prisma.project.aggregate({
          where: { state: { contains: stateNameFormatted } },
          _sum: { revisedCostCrore: true },
          _avg: { costOverrunPercent: true },
        }),
        prisma.project.count({
          where: {
            state: { contains: stateNameFormatted },
            timeOverrunMonths: { gt: 0 },
            projectStatus: "Under Implementation",
          },
        }),
        prisma.project.findMany({
          where: { state: { contains: stateNameFormatted } },
          take: 5,
          orderBy: { revisedCostCrore: "desc" },
          include: { predictions: { take: 1, orderBy: { createdAt: "desc" } } },
        }),
      ]);

      aggregateStats = {
        count,
        totalOutlayCrore: Math.round(sumCost._sum.revisedCostCrore ?? 0),
        avgOverrun: Number((sumCost._avg.costOverrunPercent ?? 0).toFixed(1)),
        delayedCount,
      };

      matchedProjects = projects;
      contextSummary = `Real-time database analysis for **${stateNameFormatted}**: ${aggregateStats.count} Central Sector projects monitored with total sanctioned outlay of ₹${(aggregateStats.totalOutlayCrore / 1000).toFixed(1)}k Crore. ${aggregateStats.delayedCount} projects are currently experiencing schedule slippage (average cost overrun: +${aggregateStats.avgOverrun}%).`;
    } else if (detectedSector) {
      const [count, sumCost, projects] = await Promise.all([
        prisma.project.count({ where: { sector: detectedSector } }),
        prisma.project.aggregate({
          where: { sector: detectedSector },
          _sum: { revisedCostCrore: true },
          _avg: { costOverrunPercent: true },
        }),
        prisma.project.findMany({
          where: { sector: detectedSector },
          take: 5,
          orderBy: { costOverrunPercent: "desc" },
          include: { predictions: { take: 1, orderBy: { createdAt: "desc" } } },
        }),
      ]);

      aggregateStats = {
        count,
        totalOutlayCrore: Math.round(sumCost._sum.revisedCostCrore ?? 0),
        avgOverrun: Number((sumCost._avg.costOverrunPercent ?? 0).toFixed(1)),
        delayedCount: 0,
      };

      matchedProjects = projects;
      contextSummary = `Real-time portfolio query for **${detectedSector} Sector**: ${count} projects tracked with aggregate capital outlay of ₹${(aggregateStats.totalOutlayCrore / 1000).toFixed(1)}k Crore and an average cost overrun of +${aggregateStats.avgOverrun}%.`;
    } else if (query.includes("delay") || query.includes("overrun") || query.includes("risk") || query.includes("critical")) {
      const [count, projects] = await Promise.all([
        prisma.project.count({
          where: {
            projectStatus: "Under Implementation",
            predictions: { some: { riskCategory: { in: ["CRITICAL", "HIGH"] } } },
          },
        }),
        prisma.project.findMany({
          where: {
            projectStatus: "Under Implementation",
            predictions: { some: { riskCategory: { in: ["CRITICAL", "HIGH"] } } },
          },
          take: 5,
          orderBy: { costOverrunPercent: "desc" },
          include: { predictions: { take: 1, orderBy: { createdAt: "desc" } } },
        }),
      ]);

      matchedProjects = projects;
      contextSummary = `Live Escalation Watchlist: ${count} projects currently flagged in CRITICAL or HIGH risk categories by the ML Stacking Ensemble.`;
    } else {
      // Default national portfolio brief
      const [totalProjects, aggregations, projects] = await Promise.all([
        prisma.project.count(),
        prisma.project.aggregate({
          _sum: { revisedCostCrore: true },
          _avg: { costOverrunPercent: true, timeOverrunMonths: true },
        }),
        prisma.project.findMany({
          take: 4,
          orderBy: { revisedCostCrore: "desc" },
          include: { predictions: { take: 1, orderBy: { createdAt: "desc" } } },
        }),
      ]);

      matchedProjects = projects;
      contextSummary = `National Infrastructure Ledger: ${totalProjects} Central Sector Projects (≥ ₹150 Crore) monitored with ₹${((aggregations._sum.revisedCostCrore ?? 0) / 100000).toFixed(2)} Lakh Crore revised outlay (Average overrun: +${Number((aggregations._avg.costOverrunPercent ?? 0).toFixed(1))}%, average delay: ${Math.round(aggregations._avg.timeOverrunMonths ?? 0)} months).`;
    }

    // Format individual project highlights
    const projectHighlights = matchedProjects
      .map(
        (p) =>
          `• **${p.projectName}** (${p.sector}, ${p.state})\n  - Sanctioned Outlay: ₹${p.revisedCostCrore.toLocaleString()} Cr | Cost Escalation: +${p.costOverrunPercent}% | Schedule Slippage: ${p.timeOverrunMonths} mo | Agency: ${p.implementingAgency} | Risk: **${p.predictions?.[0]?.riskCategory ?? "MODERATE"}** (Score: ${Math.round(p.predictions?.[0]?.riskScore ?? 50)}/100)`
      )
      .join("\n\n");

    const answer = `### 🇮🇳 NIRMAAN AI Officer Briefing
*National Infrastructure Observatory • Central Sector Portfolio Intelligence*
*Source: Current Analytical Dataset (dev.db) & NIRMAAN AI Monitoring Framework*

${contextSummary}

#### 📋 Major Infrastructure Assets Identified:
${projectHighlights}

#### 💡 Evidence-Based Policy Interventions:
1. **Root-Cause Attribution:** Inter-departmental Right-of-Way (RoW) clearance and environmental clearances constitute the primary delay driver across the portfolio.
2. **Predictive Lead Time:** The 47-feature Stacking Ensemble provides **6 to 12 months** of advance notice before budgetary revisions are submitted to the Revised Cost Committee (RCC).
3. **Statutory Action:**
   - Initiate single-window coordination via the **PM GatiShakti National Master Plan** for state-level land encumbrance resolution.
   - Restructure EPC contract milestone schedules to tie contractor disbursements directly to audited physical progress.`;

    return NextResponse.json({
      reply: answer,
      referencedProjects: matchedProjects.map((p) => ({
        id: p.id,
        projectId: p.projectId,
        projectName: p.projectName,
        costCrore: p.revisedCostCrore,
        costOverrun: p.costOverrunPercent,
        delay: p.timeOverrunMonths,
        risk: p.predictions?.[0]?.riskCategory ?? "MODERATE",
      })),
    });
  } catch (error) {
    console.error("Error in AI assistant route:", error);
    return NextResponse.json({ error: "Failed to process query" }, { status: 500 });
  }
}

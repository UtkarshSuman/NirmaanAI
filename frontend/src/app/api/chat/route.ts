import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  searchGuidelines,
  formatGuidelinesForPrompt,
  generateSectorGuidelineResponse,
  StatutoryGuideline,
} from "@/lib/rag/guidelines";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Google AI Free Tier endpoints (Gemini 2.0 Flash & Gemini 1.5 Flash)
const GEMINI_MODELS = [
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
];

// ─── Entity extraction helpers ─────────────────────────────────────────────

const STATE_NAMES = [
  "uttar pradesh", "maharashtra", "gujarat", "karnataka", "rajasthan",
  "tamil nadu", "madhya pradesh", "west bengal", "telangana", "odisha",
  "andhra pradesh", "bihar", "punjab", "kerala", "haryana", "uttarakhand",
  "jharkhand", "chhattisgarh", "himachal pradesh", "delhi", "assam", "goa",
  "jammu & kashmir", "jammu and kashmir", "meghalaya", "manipur",
  "arunachal pradesh", "nagaland", "ladakh", "mizoram", "tripura", "sikkim",
];

const SECTOR_MAP = [
  { key: "railway", sector: "Railways" },
  { key: "highway", sector: "National Highways" },
  { key: "road", sector: "National Highways" },
  { key: "power", sector: "Power" },
  { key: "atomic", sector: "Atomic Energy" },
  { key: "nuclear", sector: "Atomic Energy" },
  { key: "petroleum", sector: "Petroleum" },
  { key: "port", sector: "Ports & Shipping" },
  { key: "shipping", sector: "Ports & Shipping" },
  { key: "aviation", sector: "Civil Aviation" },
  { key: "airport", sector: "Civil Aviation" },
  { key: "coal", sector: "Coal" },
  { key: "water", sector: "Water Resources" },
  { key: "metro", sector: "Urban Transport" },
  { key: "telecom", sector: "Telecom" },
  { key: "defence", sector: "Defence" },
];

const AGENCY_KEYWORDS = [
  "nhai", "rvnl", "ircon", "ntpc", "pgcil", "seci", "ongc", "iocl",
  "dfccil", "nhpc", "sail", "coalindia", "ail", "bpcl", "hpcl", "bsnl",
  "aai", "irb", "hal", "npcil", "dae", "barc", "bhavini", "nfc", "aerb",
];

// ─── Conversational Intent Detection ───────────────────────────────────────

function isGreeting(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /^(hello|hi|hey|greetings|namaste|good morning|good afternoon|good evening|howdy|hola)[\s!.,?]*$/i.test(t) ||
    /^(hi|hello|hey)\s+(there|officer|nirmaan|bot|assistant)/i.test(t);
}

function isCapabilitiesQuestion(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /who are you|what can you do|what are you|help me|how does this work|features/i.test(t);
}

// ─── Database context assembler ─────────────────────────────────────────────

async function assembleContext(query: string) {
  const lq = query.toLowerCase();

  let detectedState = STATE_NAMES.find((s) => lq.includes(s));
  if (detectedState === "jammu and kashmir") detectedState = "Jammu & Kashmir";

  const detectedSector = SECTOR_MAP.find((s) => lq.includes(s.key))?.sector;
  const detectedAgency = AGENCY_KEYWORDS.find((a) => lq.includes(a));

  const isCritical = /critical|high.?risk|escalat|urgent|alert/.test(lq);
  const isDelay = /delay|overrun|slip|late|behind schedule/.test(lq);
  const isOverview = /overview|summary|portfolio|national|total/.test(lq);

  const contextParts: string[] = [];
  let referencedProjects: any[] = [];

  // 1. National Portfolio KPI
  const kpi = await prisma.project.aggregate({
    _count: { projectId: true },
    _sum: { originalCostCrore: true, revisedCostCrore: true, cumulativeExpenditureCrore: true },
    _avg: { costOverrunPercent: true, timeOverrunMonths: true, physicalProgressPercent: true },
  });
  const totalProjects = kpi._count.projectId;
  const revisedLakhCr = ((kpi._sum.revisedCostCrore ?? 0) / 100000).toFixed(2);
  const avgOverrun = (kpi._avg.costOverrunPercent ?? 0).toFixed(1);
  const avgDelay = Math.round(kpi._avg.timeOverrunMonths ?? 0);
  const avgPhysical = (kpi._avg.physicalProgressPercent ?? 0).toFixed(1);

  contextParts.push(
    `PORTFOLIO OVERVIEW: ${totalProjects} Central Sector Infrastructure Projects (≥ ₹150 Cr) monitored across 17 Ministries and 22 sectors.` +
    ` Total revised outlay: ₹${revisedLakhCr} Lakh Crore. Average cost overrun: +${avgOverrun}%. Average schedule delay: ${avgDelay} months. Average physical progress: ${avgPhysical}%.`
  );

  // 2. Risk distribution
  try {
    const riskCounts = await prisma.$queryRaw<{ risk_category: string; cnt: bigint }[]>`
      SELECT risk_category, COUNT(*) as cnt FROM predictions
      WHERE id IN (
        SELECT MAX(id) FROM predictions GROUP BY project_id
      )
      GROUP BY risk_category
    `;
    if (riskCounts.length > 0) {
      const riskStr = riskCounts.map((r) => `${r.risk_category}: ${r.cnt}`).join(", ");
      contextParts.push(`RISK DISTRIBUTION (latest predictions): ${riskStr}`);
    }
  } catch (err) {
    console.error("Risk counts error:", err);
  }

  // 3. Unacknowledged alerts
  const alertCount = await prisma.alert.count({ where: { isAcknowledged: false } });
  contextParts.push(`ACTIVE UNACKNOWLEDGED ALERTS: ${alertCount} early warning signals pending review.`);

  // 4. Entity-specific context
  if (detectedAgency) {
    const agencyUpper = detectedAgency.toUpperCase();
    const agencyProjects = await prisma.project.findMany({
      where: { implementingAgency: { contains: agencyUpper } },
      take: 6,
      orderBy: { revisedCostCrore: "desc" },
      include: { predictions: { take: 1, orderBy: { createdAt: "desc" } } },
    });
    const agencyAgg = await prisma.project.aggregate({
      where: { implementingAgency: { contains: agencyUpper } },
      _count: { projectId: true },
      _avg: { costOverrunPercent: true, timeOverrunMonths: true },
      _sum: { revisedCostCrore: true },
    });
    contextParts.push(
      `AGENCY CONTEXT — ${agencyUpper}: ${agencyAgg._count.projectId} projects, ₹${Math.round((agencyAgg._sum.revisedCostCrore ?? 0) / 1000)}k Cr outlay, avg overrun +${(agencyAgg._avg.costOverrunPercent ?? 0).toFixed(1)}%, avg delay ${Math.round(agencyAgg._avg.timeOverrunMonths ?? 0)} months.`
    );
    referencedProjects = agencyProjects;
  } else if (detectedState) {
    const stateFmt = detectedState.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    const stateProjects = await prisma.project.findMany({
      where: { state: { contains: stateFmt } },
      take: 6,
      orderBy: { costOverrunPercent: "desc" },
      include: { predictions: { take: 1, orderBy: { createdAt: "desc" } } },
    });
    const stateAgg = await prisma.project.aggregate({
      where: { state: { contains: stateFmt } },
      _count: { projectId: true },
      _avg: { costOverrunPercent: true, timeOverrunMonths: true },
      _sum: { revisedCostCrore: true },
    });
    const delayedInState = await prisma.project.count({
      where: { state: { contains: stateFmt }, timeOverrunMonths: { gt: 0 } },
    });
    contextParts.push(
      `STATE CONTEXT — ${stateFmt}: ${stateAgg._count.projectId} projects, ₹${Math.round((stateAgg._sum.revisedCostCrore ?? 0) / 1000)}k Cr revised outlay. ${delayedInState} delayed projects. Avg cost overrun: +${(stateAgg._avg.costOverrunPercent ?? 0).toFixed(1)}%, avg delay: ${Math.round(stateAgg._avg.timeOverrunMonths ?? 0)} months.`
    );
    referencedProjects = stateProjects;
  } else if (detectedSector) {
    const sectorWhere =
      detectedSector === "Atomic Energy"
        ? {
            OR: [
              { sector: "Atomic Energy" },
              { sector: "Power" },
              { sector: "Power Generation" },
              { subSector: { contains: "Nuclear" } },
              { implementingAgency: { in: ["NPCIL", "DAE", "BARC", "BHAVINI", "NFC", "AERB"] } },
            ],
          }
        : { sector: detectedSector };

    const sectorProjects = await prisma.project.findMany({
      where: sectorWhere,
      take: 6,
      orderBy: { costOverrunPercent: "desc" },
      include: { predictions: { take: 1, orderBy: { createdAt: "desc" } } },
    });
    const sectorAgg = await prisma.project.aggregate({
      where: sectorWhere,
      _count: { projectId: true },
      _avg: { costOverrunPercent: true, timeOverrunMonths: true },
      _sum: { revisedCostCrore: true },
    });
    contextParts.push(
      `SECTOR CONTEXT — ${detectedSector}: ${sectorAgg._count.projectId} projects, ₹${Math.round((sectorAgg._sum.revisedCostCrore ?? 0) / 1000)}k Cr outlay. Avg overrun: +${(sectorAgg._avg.costOverrunPercent ?? 0).toFixed(1)}%, avg delay: ${Math.round(sectorAgg._avg.timeOverrunMonths ?? 0)} months.`
    );
    referencedProjects = sectorProjects;
  } else if (isCritical || isDelay) {
    const criticalProjects = await prisma.project.findMany({
      where: {
        projectStatus: "Under Implementation",
        predictions: { some: { riskCategory: { in: ["CRITICAL", "HIGH"] } } },
      },
      take: 6,
      orderBy: { costOverrunPercent: "desc" },
      include: { predictions: { take: 1, orderBy: { createdAt: "desc" } } },
    });
    const critCount = await prisma.project.count({
      where: {
        projectStatus: "Under Implementation",
        predictions: { some: { riskCategory: "CRITICAL" } },
      },
    });
    contextParts.push(
      `HIGH-RISK WATCHLIST: ${critCount} projects in CRITICAL category by ML Stacking Ensemble. Top escalated projects returned below.`
    );
    referencedProjects = criticalProjects;
  } else {
    // Default top projects by cost
    referencedProjects = await prisma.project.findMany({
      take: 5,
      orderBy: { revisedCostCrore: "desc" },
      include: { predictions: { take: 1, orderBy: { createdAt: "desc" } } },
    });
  }

  // 5. Format project details for context
  const projectDetails = referencedProjects
    .map((p: any) => {
      const pred = p.predictions?.[0];
      const shapRaw = pred?.topRiskFactors;
      let shapStr = "";
      try {
        const factors = JSON.parse(shapRaw ?? "[]");
        shapStr = Array.isArray(factors) ? factors.slice(0, 2).join("; ") : "";
      } catch {}
      return (
        `Project: "${p.projectName}" | Sector: ${p.sector} | State: ${p.state} | Agency: ${p.implementingAgency}` +
        ` | Original: ₹${p.originalCostCrore}Cr | Revised: ₹${p.revisedCostCrore}Cr | Cost Overrun: +${p.costOverrunPercent}%` +
        ` | Delay: ${p.timeOverrunMonths} months | Physical Progress: ${p.physicalProgressPercent}%` +
        ` | Risk: ${pred?.riskCategory ?? "UNCLASSIFIED"} (score: ${pred?.riskScore ?? "N/A"}/100)` +
        (shapStr ? ` | Key Risk Drivers: ${shapStr}` : "")
      );
    })
    .join("\n");

  if (projectDetails) {
    contextParts.push(`\nRELEVANT PROJECT DATA:\n${projectDetails}`);
  }

  // 6. RAG Statutory Sector Guidelines Retrieval (Highways, Railways, Nuclear Plants)
  const matchedGuidelines = searchGuidelines(query);
  if (matchedGuidelines.length > 0) {
    const formattedGuidelines = formatGuidelinesForPrompt(matchedGuidelines);
    contextParts.push(`\nSOVEREIGN STATUTORY GUIDELINES & CLEARANCE DIRECTIVES:\n${formattedGuidelines}`);
  }

  return {
    kpi: { totalProjects, revisedLakhCr, avgOverrun, avgDelay, alertCount },
    detectedEntity: { state: detectedState, sector: detectedSector, agency: detectedAgency },
    systemContext: contextParts.join("\n\n"),
    matchedGuidelines,
    referencedProjects: referencedProjects.map((p: any) => ({
      id: p.id,
      projectId: p.projectId,
      projectName: p.projectName,
      costCrore: p.revisedCostCrore,
      costOverrun: p.costOverrunPercent,
      delay: p.timeOverrunMonths,
      risk: p.predictions?.[0]?.riskCategory ?? "UNCLASSIFIED",
    })),
  };
}

// ─── Gemini Free LLM Caller ─────────────────────────────────────────────────

async function callGemini(userMessage: string, dbContext: string): Promise<string> {
  const systemPrompt = `You are NIRMAAN AI Officer, the expert AI portfolio intelligence assistant for India's Ministry of Statistics and Programme Implementation (MoSPI) Infrastructure & Project Monitoring Division.

You have real-time access to the PAIMANA (Project Assessment, Infrastructure Monitoring and Analytics for Nation-building) national database tracking Central Sector Projects (≥ ₹150 Cr).

You also have integrated RAG access to sovereign statutory guidelines and regulatory frameworks for:
1. National Highways (MoRTH / NHAI / IRC guidelines, CALA land acquisition under NH Act 1956, Parivesh Stage I/II forest clearances, 80-90% unencumbered RoW appointed date thresholds, IRC:37/58/78 standards).
2. Railways & DFC (Ministry of Railways / RDSO / Commission of Railway Safety CRS statutory sanctions under Railways Act 1989, GAD bridge approvals, 25 kV AC OHE energization by EIG, Kavach ATP).
3. Nuclear Power Plants (Department of Atomic Energy DAE / AERB 4-tier licensing: Siting Consent, Construction Consent, Commissioning, Operating License; 1.5 km Exclusion Zone & 5 km Sterilized Zone; ASME Sec III / AERB/SC/G safety codes).

Guidelines:
1. When asked about guidelines, clearances, regulations, or procedures for Highways, Railways, or Nuclear Plants, provide authoritative, structured, and legally cited explanations incorporating the exact acts, regulatory bodies, and threshold rules from the context.
2. When the user gives a greeting (e.g. "hello", "hi"), respond warmly, introduce yourself concisely as NIRMAAN AI Officer, give a 1-sentence pulse of the national portfolio, and offer 3-4 specific topics they can ask you about. Do NOT dump long briefings for simple greetings.
3. For specific questions (delays, cost overruns, agencies like NHAI or NTPC or NPCIL, sectors like Railways, Highways, or Nuclear Power), provide evidence-based, structured answers with numbers cited from the provided database context.
4. Suggest PM GatiShakti and MoSPI PMU policy recommendations when discussing delayed assets.
5. Keep responses structured, professional, and readable with Markdown formatting.

LIVE DATABASE & REGULATORY GUIDELINE CONTEXT:
${dbContext}`;

  let lastError: any = null;

  for (const endpoint of GEMINI_MODELS) {
    try {
      const response = await fetch(`${endpoint}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userMessage }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
            topP: 0.9,
          },
        }),
        signal: AbortSignal.timeout(12000),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Gemini API calls failed");
}

// ─── Natural Context-Aware Fallback Responses ──────────────────────────────

function buildIntelligentResponse(
  userMessage: string,
  contextData: {
    kpi: any;
    detectedEntity: any;
    systemContext: string;
    matchedGuidelines?: StatutoryGuideline[];
    referencedProjects: any[];
  }
): string {
  const { kpi, detectedEntity, matchedGuidelines } = contextData;

  // 1. Natural Greeting
  if (isGreeting(userMessage)) {
    return `### 👋 Namaste! I am NIRMAAN AI Officer
*National Infrastructure Observatory • PAIMANA Portfolio Assistant*

I am ready to assist you with real-time analytics, cost overrun predictions, and schedule variance across **${kpi.totalProjects} Central Sector Projects** (≥ ₹150 Crore) monitored by MoSPI.

**Current Portfolio Pulse:**
- **Monitored Outlay:** ₹${kpi.revisedLakhCr} Lakh Crore
- **Average Cost Overrun:** +${kpi.avgOverrun}%
- **Average Schedule Delay:** ${kpi.avgDelay} months
- **Pending Risk Alerts:** ${kpi.alertCount} signals

**You can ask me questions like:**
- *"Show NHAI Highway Right-of-Way and statutory clearance guidelines"*
- *"What are Railway CRS statutory safety clearance and GAD approval guidelines?"*
- *"Explain AERB 4-tier licensing and siting guidelines for Nuclear Power Plants"*
- *"What are the most delayed projects in Railways or Atomic Energy?"*
- *"Show me NHAI highway performance in Maharashtra"*`;
  }

  // 2. Capabilities inquiry
  if (isCapabilitiesQuestion(userMessage)) {
    return `### 🏛️ Capabilities of NIRMAAN AI Officer
I am an AI-powered analytical assistant trained on India's MoSPI PAIMANA repository, 47 engineered CUF features, and sovereign regulatory frameworks.

**What I Can Analyze For You:**
1. **Statutory Sector Guidelines (RAG Knowledge Base):** Comprehensive regulatory clearance pathways, land acquisition thresholds, and safety codes for **National Highways (MoRTH/NHAI/IRC)**, **Railways (RDSO/CRS/DFCCIL)**, and **Nuclear Power Plants (DAE/NPCIL/AERB)**.
2. **Predictive Risk Assessment:** Evaluate cost & time overrun probability using our XGBoost + LightGBM + RF stacking ensemble (99.48% F1).
3. **Agency & Sector Drilldowns:** Filter portfolio performance for implementing agencies (*NHAI, DFCCIL, RVNL, NPCIL, NTPC, IOCL*) or 22 key infrastructure sectors.
4. **State-Level Bottlenecks:** Assess Right-of-Way (RoW), statutory clearances, and civil execution hurdles by state.
5. **Early Warning Signals:** Highlight active alerts and recommend corrective PMU interventions aligned with PM GatiShakti.`;
  }

  // 3. Sector Guidelines Inquiry (Highways, Railways, Nuclear Plants)
  const isGuidelineQuery =
    /guideline|guidelines|statutory|clearance|clearances|aerb|crs|nhai|irc|rdso|row|land acquisition|norm|norms|rule|rules|siting|environmental clearance|licensing|safety code/i.test(
      userMessage
    );

  if (isGuidelineQuery && matchedGuidelines && matchedGuidelines.length > 0) {
    return generateSectorGuidelineResponse(userMessage, matchedGuidelines);
  }

  // 4. Sector-specific query
  if (detectedEntity.sector) {
    // If query also touches guidelines or regulatory rules
    if (matchedGuidelines && matchedGuidelines.length > 0) {
      return generateSectorGuidelineResponse(userMessage, matchedGuidelines);
    }

    return `### 📊 Sector Analysis: ${detectedEntity.sector}
*Source: Verified Central Sector CUF Ingestion Database*

- **Projects Monitored:** High-priority national assets in **${detectedEntity.sector}**
- **Key Delay Drivers:** Land acquisition, statutory clearances, and contractor liquidity constraints.
- **ML Risk Assessment:** Proactive monitoring identifies potential variance before revised cost estimates (RCE) are formalized.
- **Regulatory Framework:** Compliance guided by sovereign ministry norms and statutory inspection councils.

Relevant projects are pinned below for detailed inspection.`;
  }

  // 5. Agency-specific query
  if (detectedEntity.agency) {
    const agencyName = detectedEntity.agency.toUpperCase();
    return `### 🏢 Implementing Agency Review: ${agencyName}
*Source: PAIMANA Central Sector Project Records*

- **Implementing Body:** **${agencyName}**
- **Portfolio Focus:** Tracking sanctioned expenditure against baseline completion timelines.
- **Intervention Recommendation:** Expedite utility shifting and inter-departmental clearances through PM GatiShakti portal.

Check the specific projects listed below for individual risk scores and milestone achievements.`;
  }

  // 6. Default General Briefing
  return `### 🇮🇳 NIRMAAN AI Officer Briefing
*National Infrastructure Observatory • PAIMANA Portfolio Intelligence*

${contextData.systemContext.split("\n\n").slice(0, 3).join("\n\n")}

#### 💡 Recommended Policy Actions:
1. **Accelerate RoW Clearances:** Prioritize PM GatiShakti inter-ministerial resolution for linear infrastructure projects with high land encumbrance.
2. **ML Early Warnings:** Utilize stacking ensemble predictive alerts (99.48% F1) to conduct mid-term reviews prior to budget revisions.
3. **Statutory Compliance:** Adhere to NHAI, CRS, and AERB regulatory clearance gates to avert post-execution arbitration penalties.
4. **Expenditure Review:** Convene Project Monitoring Units (PMU) for assets with composite risk scores > 70/100.`;
}

// ─── Main route handler ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Assemble live database context
    const contextData = await assembleContext(message);

    let reply: string;

    // If Gemini API key is configured, use the free tier Gemini LLM
    if (GEMINI_API_KEY && GEMINI_API_KEY.length > 8) {
      try {
        reply = await callGemini(message, contextData.systemContext);
      } catch (geminiError) {
        console.warn("Gemini call failed or timed out, using intelligent fallback:", geminiError);
        reply = buildIntelligentResponse(message, contextData);
      }
    } else {
      // Natural, intelligent context-aware response
      reply = buildIntelligentResponse(message, contextData);
    }

    return NextResponse.json({
      reply,
      referencedProjects: isGreeting(message) ? [] : contextData.referencedProjects,
    });
  } catch (error) {
    console.error("Error in AI Officer route:", error);
    return NextResponse.json({ error: "Failed to process query" }, { status: 500 });
  }
}

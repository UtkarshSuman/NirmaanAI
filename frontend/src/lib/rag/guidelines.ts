/**
 * Sovereign Infrastructure Statutory Guidelines Knowledge Base
 * RAG Domain Knowledge for MoSPI NIRMAAN AI / PAIMAANA
 *
 * Covers statutory frameworks, clearance stages, RoW norms, engineering standards,
 * and cost/schedule escalation governance for:
 * 1. National Highways (MoRTH / NHAI / IRC)
 * 2. Railways (Ministry of Railways / RDSO / CRS / DFCCIL)
 * 3. Nuclear Power Plants (Department of Atomic Energy / NPCIL / AERB)
 */

export interface StatutoryGuideline {
  sectorKey: "highway" | "railway" | "nuclear";
  sectorName: string;
  regulatoryAuthority: string;
  governingActs: string[];
  keyClearances: Array<{
    stage: string;
    authority: string;
    description: string;
    criticalPathThreshold: string;
  }>;
  landAcquisitionRoW: {
    statutoryProcess: string;
    mandatedThresholds: string[];
    riskMitigationRules: string[];
  };
  technicalAndQualityCodes: Array<{
    code: string;
    title: string;
    application: string;
  }>;
  costAndContractGovernance: {
    escalationFormula: string;
    variationOrderCap: string;
    disputeResolution: string;
  };
  environmentalAndHazardSafety: {
    clearances: string[];
    emergencySafetyZone: string;
    mitigationDirectives: string[];
  };
  commonOverrunCauses: string[];
  recommendedPmuInterventions: string[];
}

export const INFRASTRUCTURE_GUIDELINES: Record<"highway" | "railway" | "nuclear", StatutoryGuideline> = {
  highway: {
    sectorKey: "highway",
    sectorName: "National Highways & Road Transport",
    regulatoryAuthority: "Ministry of Road Transport & Highways (MoRTH) / National Highways Authority of India (NHAI)",
    governingActs: [
      "National Highways Act, 1956 (Sections 3A to 3J for CALA land acquisition)",
      "National Highways Authority of India Act, 1988",
      "Control of National Highways (Land and Traffic) Act, 2002",
      "Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act (RFCTLARR), 2013",
    ],
    keyClearances: [
      {
        stage: "Stage-I In-Principle Forest Clearance",
        authority: "MoEFCC via PARIVESH 2.0 Portal",
        description: "Stipulates conditions for Compensatory Afforestation (CA) and Net Present Value (NPV) calculation.",
        criticalPathThreshold: "Mandatory before felling or civil disturbance on forest land; targets 120-day clearance SLA.",
      },
      {
        stage: "Stage-II Final Forest Clearance",
        authority: "State Forest Dept & MoEFCC Regional Office",
        description: "Requires compliance report on NPV/CA fund deposition into CAMPA account before tree-cutting permission.",
        criticalPathThreshold: "Mandatory before commencing formation work on forest stretches.",
      },
      {
        stage: "Wildlife Clearance (NBWL)",
        authority: "Standing Committee of National Board for Wildlife (SC-NBWL)",
        description: "Mandatory for alignments passing within protected areas or designated Eco-Sensitive Zones (ESZ).",
        criticalPathThreshold: "Must incorporate animal overpasses/underpasses (IRC:SP:112 guidelines).",
      },
      {
        stage: "Utility Shifting Clearance",
        authority: "State DISCOMs, Water Supply Boards, GAIL/Petroleum pipelines",
        description: "Joint inventory with utility owners within 60 days of Letter of Award (LoA); shifting estimates finalized.",
        criticalPathThreshold: "Utility encumbrances must be eliminated prior to granular sub-base (GSB) paving.",
      },
      {
        stage: "Railway Road Over Bridge (ROB) / RUB General Arrangement Drawing (GAD)",
        authority: "Zonal Railways (Chief Bridge Engineer)",
        description: "Approval of structural spans, vertical clearances, and safety barriers across running railway tracks.",
        criticalPathThreshold: "Must achieve web-portal joint sign-off within 90 days to avoid milestone penalties.",
      },
    ],
    landAcquisitionRoW: {
      statutoryProcess:
        "Execution under Section 3A (Intention), 3D (Declaration), and 3G (Compensation Determination by CALA) of NH Act 1956.",
      mandatedThresholds: [
        "Hybrid Annuity Model (HAM): Minimum 80% contiguous unencumbered RoW in physical possession before 'Appointed Date' declaration.",
        "Engineering, Procurement & Construction (EPC): Minimum 90% contiguous unencumbered RoW in physical possession before 'Appointed Date'.",
        "Compensation disbursement must be verified via BhoomiRashi portal linked directly to PFMS (Public Financial Management System).",
      ],
      riskMitigationRules: [
        "No penalty clause invocation on concessionaire if delay originates from non-handover of RoW within 180 days of LoA.",
        "District-level RoW taskforces chaired by Deputy Commissioner/District Magistrate for linear dispute settlements.",
      ],
    },
    technicalAndQualityCodes: [
      {
        code: "IRC:37-2018",
        title: "Guidelines for Design of Flexible Pavements",
        application: "Pavement crust design based on California Bearing Ratio (CBR) and cumulative Equivalent Standard Axles (millet msax).",
      },
      {
        code: "IRC:58-2015",
        title: "Guidelines for Design of Plain Jointed Rigid Pavements",
        application: "Concrete pavement slab design for high-traffic corridors and expressway toll plazas.",
      },
      {
        code: "IRC:78-2014 & IRC:112-2020",
        title: "Standard Specifications & Code of Practice for Road Bridges",
        application: "Limit state design for prestressed concrete and structural steel flyovers and viaducts.",
      },
      {
        code: "IRC:SP:84 & IRC:SP:87",
        title: "Manual of Specifications & Standards for 4-Laning & 6-Laning",
        application: "Standard engineering specifications for national corridor expansion under Bharatmala Pariyojana.",
      },
    ],
    costAndContractGovernance: {
      escalationFormula:
        "Standard Price Adjustment formula under EPC Clause 19 based on RBI Wholesale Price Index (WPI) for cement, steel, bitumen, and CPI for labor.",
      variationOrderCap:
        "Variations capped at 10% of initial contract value; revisions exceeding 10% require Standing Finance Committee (SFC) or Expenditure Finance Committee (EFC) sanction.",
      disputeResolution:
        "Conciliation Committee of Independent Experts (CCIE) and dispute settlement under Society for Affordable Redressal of Disputes (SAROD-Ports/Roads).",
    },
    environmentalAndHazardSafety: {
      clearances: [
        "Environmental Clearance (EC) under EIA Notification 2006 for highway expansion > 100 km involving > 20m additional RoW.",
        "Coastal Regulation Zone (CRZ) clearance for coastal highways and causeways from MoEFCC.",
        "Tree felling permissions under State Preservation of Trees Acts with 1:10 compensatory plantation ratio.",
      ],
      emergencySafetyZone: "Median crash barriers complying with IRC:119; mandatory ambulance evacuation bays every 50 km.",
      mitigationDirectives: [
        "Slope stabilization in hilly/mountainous terrain using soil nailing, hydroseeding, and gabion retaining walls.",
        "Installation of continuous Intelligent Transport Systems (ITS) and advanced traffic management systems (ATMS).",
      ],
    },
    commonOverrunCauses: [
      "Stalled Competent Authority for Land Acquisition (CALA) compensation disbursement and village land valuation disputes.",
      "Delay in Stage-II Forest clearances and delayed tree-felling by state forest development corporations.",
      "High-tension power line shifting and underground utility discordance with DISCOMs.",
      "Contractor working capital insolvency on low-bid EPC tenders.",
    ],
    recommendedPmuInterventions: [
      "PM GatiShakti NMP (National Master Plan) GIS portal overlay to fast-track inter-agency utility alignment.",
      "Enforce mandatory pre-qualification financial health audits via CIBIL/CRILC banking telemetry before awarding packages.",
      "Activate state-level Empowered Committees led by Chief Secretaries for weekly RoW dispute resolutions.",
    ],
  },

  railway: {
    sectorKey: "railway",
    sectorName: "Railways & Dedicated Freight Corridors",
    regulatoryAuthority: "Ministry of Railways (Railway Board) / Dedicated Freight Corridor Corporation (DFCCIL) / RVNL",
    governingActs: [
      "Railways Act, 1989 (Sections 21, 22, 23 for opening of railway lines)",
      "Statutory Commission of Railway Safety (CRS) Rules under Ministry of Civil Aviation",
      "Indian Railway Code for the Engineering Department",
      "Land Acquisition (Special Railway Projects) under Railways Amendment Act, 2008",
    ],
    keyClearances: [
      {
        stage: "Commissioner of Railway Safety (CRS) Sanction",
        authority: "Commission of Railway Safety (Ministry of Civil Aviation)",
        description: "Statutory inspection, speed trials, oscillation testing, and track safety sanction before commercial operations.",
        criticalPathThreshold: "Mandatory legal requirement before any passenger train can run on newly doubled/electrified tracks.",
      },
      {
        stage: "Research Designs and Standards Organisation (RDSO) Approval",
        authority: "RDSO Lucknow",
        description: "Type approval for track fasteners, prestressed concrete sleepers, bridge girder fabrication, and signaling.",
        criticalPathThreshold: "Prototypes must be pre-certified before bulk placement on Golden Quadrilateral or DFC corridors.",
      },
      {
        stage: "Electrical Inspector to Government of India (EIG) Sanction",
        authority: "Principal Chief Electrical Engineer (PCEE / EIG)",
        description: "Statutory energization sanction for 25 kV 50 Hz AC overhead traction lines and traction substations (TSS).",
        criticalPathThreshold: "Mandatory before charging overhead equipment (OHE) and commencing electric locomotive trials.",
      },
      {
        stage: "Road Over Bridge (ROB) / Under Bridge (RUB) GAD Approval",
        authority: "Chief Bridge Engineer (Zonal Railway) & State PWD",
        description: "Bilateral agreement on deck clearance, foundation layout, and traffic detour plans.",
        criticalPathThreshold: "Joint engineering sign-off mandated within 90 days under Railway Board circulars.",
      },
      {
        stage: "Interlocking & Electronic Signalling Clearance",
        authority: "Chief Signal & Telecom Engineer (CSTE)",
        description: "Testing of Electronic Interlocking (EI), Track Circuits, Axle Counters, and Kavach (TCAS) Automatic Train Protection.",
        criticalPathThreshold: "Failsafe testing required before CRS formal inspection.",
      },
    ],
    landAcquisitionRoW: {
      statutoryProcess:
        "Competent Authority notifications under Chapter IVA of Railways Act (Special Railway Projects) or RFCTLARR 2013.",
      mandatedThresholds: [
        "Minimum 90% unencumbered linear strip for Dedicated Freight Corridors (DFCCIL) prior to major civil earthwork contracts.",
        "Buffer safety boundary: Minimum 30-meter track protection corridor on high-speed / heavy-haul freight alignments.",
        "Railway boundary demarcation stones must be planted immediately upon CALA possession.",
      ],
      riskMitigationRules: [
        "Zonal Railway General Managers empowered with enhanced financial delegation to settle local land compensation differences.",
        "Rehabilitation & Resettlement (R&R) packages including employment in railways under designated notifications.",
      ],
    },
    technicalAndQualityCodes: [
      {
        code: "IRS:GE-1 (RDSO)",
        title: "Guidelines for Earthwork in Railway Projects",
        application: "Blanket layer specification, soil compaction standards, and slope stabilization for 25-tonne and 32.5-tonne axle loads.",
      },
      {
        code: "IRS:Bridge Rules & IRS:Steel Bridge Code",
        title: "Indian Railway Standard Code of Practice for Bridge Engineering",
        application: "Loading standards for 25t loading-2008; seismic coefficient and fatigue stress evaluations for railway bridges.",
      },
      {
        code: "IRS:T-12 / IRS:T-39",
        title: "Prestressed Concrete Sleepers & UIC-60 High-Tensile Rails",
        application: "Continuous Welded Rail (CWR) / Long Welded Rail (LWR) laying standards adhering to Indian Railways Permanent Way Manual.",
      },
      {
        code: "RDSO/SPN/196",
        title: "Kavach - Indian Railway Automatic Train Protection (IR-ATP)",
        application: "Radio-frequency identification (RFID) and cab-signaling integration for zero SPAD (Signal Passed At Danger).",
      },
    ],
    costAndContractGovernance: {
      escalationFormula:
        "PVC (Price Variation Clause) linked to RBI Wholesale Price indices for structural steel, cement, HSD diesel, and CPI labor indices.",
      variationOrderCap:
        "Engineering variations > 25% require revised administrative approval (RAA) from Railway Board / Ministry of Railways.",
      disputeResolution:
        "Arbitration under Indian Railways General Conditions of Contract (GCC) with fast-track arbitral tribunals.",
    },
    environmentalAndHazardSafety: {
      clearances: [
        "Forest clearance for hill railway links and elephant corridor wildlife passes (coordinated with MoEFCC).",
        "Statutory clearance for explosive storage and magazine licensing under PESO for tunnel blasting operations.",
      ],
      emergencySafetyZone:
        "Trackside boundary fencing along semi-high speed sections (Vande Bharat corridors ≥ 130–160 km/h) to prevent cattle trespass.",
      mitigationDirectives: [
        "Himalayan Deep Tunneling: Mandatory New Austrian Tunnelling Method (NATM) / TBM geotechnical monitoring and drainage galleries.",
        "Avalanche and landslide protection sheds on fragile Jammu-Udhampur-Srinagar-Baramulla (USBRL) and Rishikesh-Karanprayag alignments.",
      ],
    },
    commonOverrunCauses: [
      "Adverse fragile geological shear zones and ingress of high-pressure groundwater in long-distance tunnels.",
      "Inter-departmental coordination delays in Road Over Bridge (ROB) GAD approvals with state highway departments.",
      "Contractor disputes over geological variation claims and rock mass rating classification revisions.",
      "CRS safety inspection observations requiring track realignment and signaling alterations prior to sanction.",
    ],
    recommendedPmuInterventions: [
      "Deploy 3D Laser Scanning and InSAR satellite interferometry for real-time hill slope and tunnel deformation telemetry.",
      "Direct integration of Zonal Railway engineering portals with state revenue departments via PM GatiShakti.",
      "Pre-bid geological risk-sharing clauses adhering to FIDIC Emerald Book for underground tunnel works.",
    ],
  },

  nuclear: {
    sectorKey: "nuclear",
    sectorName: "Nuclear Power Generation & Atomic Energy",
    regulatoryAuthority: "Department of Atomic Energy (DAE) / Atomic Energy Regulatory Board (AERB) / NPCIL",
    governingActs: [
      "Atomic Energy Act, 1962 (Control of radioactive substances and nuclear installations)",
      "Civil Liability for Nuclear Damage Act (CLNDA), 2010",
      "Atomic Energy (Radiation Protection) Rules, 2004",
      "Atomic Energy (Working of the Mines, Minerals and Handling of Prescribed Substances) Rules, 1984",
    ],
    keyClearances: [
      {
        stage: "Stage 1: Site Evaluation & Siting Consent",
        authority: "AERB Site Safety Review Committee (SSRC)",
        description: "Seismic hazard assessment (Design Basis Ground Motion - DBGM), flood/tsunami hazard, and exclusion zone boundary sign-off.",
        criticalPathThreshold: "Mandatory before land acquisition finalization and nuclear island civil design freeze.",
      },
      {
        stage: "Stage 2: Construction Consent",
        authority: "AERB Safety Committee for Advanced Power Reactors (ACAPR)",
        description: "Comprehensive review of safety-critical systems, reactor containment integrity, emergency core cooling, and civil foundation.",
        criticalPathThreshold: "Mandatory milestone before first pour of concrete (FPC) for reactor building basemat.",
      },
      {
        stage: "Stage 3: Commissioning Consent (Multi-Phase)",
        authority: "AERB Advisory Committee for Project Safety Review (ACPSR)",
        description: "Cold Hydro-Testing (CHT), Hot Functional Testing (HFT), and formal regulatory sanction for Fuel Loading.",
        criticalPathThreshold: "Must pass each sub-stage (CHT → HFT → Fuel Loading → First Approach to Criticality - FAC) consecutively.",
      },
      {
        stage: "Stage 4: Operating License & Commercial Run",
        authority: "Atomic Energy Regulatory Board (AERB)",
        description: "Authorization to synchronize with the national electrical grid and operate at full rated thermal capacity (MWth/MWe).",
        criticalPathThreshold: "Granted for 5-year cycles with mandatory Periodic Safety Reviews (PSR) under AERB Safety Codes.",
      },
      {
        stage: "Environmental Clearance & CRZ Authorization",
        authority: "MoEFCC Expert Appraisal Committee (Nuclear) & State Coastal Zone Management",
        description: "Cooling water discharge thermal limits (delta T ≤ 7°C) and baseline radiological survey validation.",
        criticalPathThreshold: "Mandatory prior to commencing intake/outfall marine civil engineering works.",
      },
    ],
    landAcquisitionRoW: {
      statutoryProcess:
        "Direct acquisition under Central Government authority (DAE/NPCIL) with strict physical zoning barriers.",
      mandatedThresholds: [
        "Exclusion Zone (EZ): Minimum 1.5 km radius from reactor center under absolute physical security and ownership of NPCIL (zero permanent human habitation).",
        "Sterilized Zone (SZ): Radial belt between 1.5 km and 5 km where human population expansion is strictly regulated via local town planning authorities.",
        "Emergency Planning Zone (EPZ): Radius extending up to 16 km for comprehensive off-site radiological emergency preparedness plans.",
      ],
      riskMitigationRules: [
        "100% boundary compound wall and multi-tier electronic perimeter intrusion detection system (PIDS) before reactor excavation.",
        "Comprehensive CSR and R&R community infrastructure (hospitals, schools, township roads) commissioned ahead of main plant erection.",
      ],
    },
    technicalAndQualityCodes: [
      {
        code: "AERB/SC/G & AERB/SC/D",
        title: "AERB Code of Practice: Quality Assurance & Design Safety in Nuclear Power Plants",
        application: "Stringent regulatory code governing nuclear design safety, redundant core cooling systems, and containment leak rates.",
      },
      {
        code: "ASME Section III Division 1",
        title: "Rules for Construction of Nuclear Facility Components",
        application: "Class 1, 2, and 3 pressure vessels, reactor pressure vessels (RPV), steam generators, and primary coolant piping.",
      },
      {
        code: "AERB/SS/CSE-1 to CSE-4",
        title: "Civil Engineering Safety Codes for Nuclear Installations",
        application: "Double-containment prestressed concrete design resisting aircraft impact, extreme seismic shocks, and internal hydrogen explosions.",
      },
      {
        code: "IEEE-323 / IEEE-344",
        title: "Environmental Qualification & Seismic Qualification of Nuclear Electrical Equipment",
        application: "Class 1E electrical instrumentation operating reliably under Post-Accident Design Basis Event (DBE) conditions.",
      },
    ],
    costAndContractGovernance: {
      escalationFormula:
        "Long-cycle capital escalation governed by DAE Project Financial Manual with index-linked capital equipment procurement formulas.",
      variationOrderCap:
        "Nuclear safety-related engineering modifications require AERB concurrence and DAE Apex Committee approval; zero unvetted field variations permitted.",
      disputeResolution:
        "High-level Standing Disputes Arbitral Mechanism under Department of Atomic Energy and Central Public Sector Enterprises (CPSE) guidelines.",
    },
    environmentalAndHazardSafety: {
      clearances: [
        "Comprehensive Environmental Clearance (EC) under Environment Impact Assessment (EIA) Notification 2006 (Schedule 1(d)).",
        "Consent to Establish (CTE) and Consent to Operate (CTO) from State Pollution Control Board for auxiliary cooling and diesel generators.",
        "PESO authorization for heavy hydrogen/gas storage and fuel handling infrastructure.",
      ],
      emergencySafetyZone:
        "Emergency Preparedness Plan (EPP) covering On-Site Emergency (Plant Superintendent) and Off-Site Emergency (District Magistrate & NDMA).",
      mitigationDirectives: [
        "Ultimate Heat Sink (UHS) safety reservoirs engineered to withstand 10,000-year return period natural disaster events (Fukushima lessons incorporated).",
        "Passive Decay Heat Removal Systems (PDHRS) operating indefinitely without external AC electric power.",
        "Continuous 24x7 Environmental Survey Laboratory (ESL) monitoring air, soil, sea water, and dietary food chain radioactivity.",
      ],
    },
    commonOverrunCauses: [
      "Rigorous multi-stage AERB regulatory safety audits requiring detailed finite element recalculations and component requalifications.",
      "International supply chain delays in heavy forgings for Reactor Pressure Vessels (RPV) and specialized zirconium alloys.",
      "Complex double-dome containment prestressing and nuclear-grade high-density concrete placement bottlenecks.",
      "Public litigation and local R&R apprehensions regarding exclusion zone resettlement.",
    ],
    recommendedPmuInterventions: [
      "Establish dedicated AERB-NPCIL Joint Technical Liaison Cells to parallel-track regulatory review dossiers during engineering design.",
      "Adopt Fleet Mode Construction (e.g., 10 Indigenous 700 MWe PHWR units) with standardized bulk procurement to reduce lead time by 30%.",
      "Deploy AI-driven 4D BIM digital twins to synchronize nuclear piping and electrical cable pulling in congested containment buildings.",
    ],
  },
};

/**
 * Search the statutory knowledge base for matching sector guidelines
 */
export function searchGuidelines(query: string): StatutoryGuideline[] {
  const q = query.toLowerCase();
  const matched: StatutoryGuideline[] = [];

  const isHighway =
    /\b(highway|highways|road|roads|nhai|morth|morth's|irc|expressway|corridor|pavement|row|cala|bhoomi)\b/i.test(q);
  const isRailway =
    /\b(rail|railway|railways|rvnl|dfccil|ircon|train|trains|track|tracks|crs|rdso|kavach|locomotive|rob|rub|ohe)\b/i.test(q);
  const isNuclear =
    /\b(nuclear|atomic|npcil|aerb|reactor|reactors|power plant|dae|bhavini|barc|heavy water|radiation|uranium|phwr)\b/i.test(q);

  if (isHighway) matched.push(INFRASTRUCTURE_GUIDELINES.highway);
  if (isRailway) matched.push(INFRASTRUCTURE_GUIDELINES.railway);
  if (isNuclear) matched.push(INFRASTRUCTURE_GUIDELINES.nuclear);

  // If general guideline query with no specific sector mentioned, return all 3 for complete context
  if (matched.length === 0 && /\b(guideline|guidelines|statutory|clearance|clearances|norm|norms|regulation|regulations|rule|rules)\b/i.test(q)) {
    return [
      INFRASTRUCTURE_GUIDELINES.highway,
      INFRASTRUCTURE_GUIDELINES.railway,
      INFRASTRUCTURE_GUIDELINES.nuclear,
    ];
  }

  return matched;
}

/**
 * Format guidelines into structured RAG prompt context
 */
export function formatGuidelinesForPrompt(guidelines: StatutoryGuideline[]): string {
  if (!guidelines || guidelines.length === 0) return "";

  return guidelines
    .map((g) => {
      const clearances = g.keyClearances
        .map((c) => `  - [${c.stage}] Authority: ${c.authority} | Scope: ${c.description} (Threshold: ${c.criticalPathThreshold})`)
        .join("\n");

      const technicalCodes = g.technicalAndQualityCodes
        .map((t) => `  - ${t.code}: ${t.title} -> ${t.application}`)
        .join("\n");

      return `=== STATUTORY & REGULATORY GUIDELINES: ${g.sectorName.toUpperCase()} ===
Authority: ${g.regulatoryAuthority}
Governing Acts: ${g.governingActs.join("; ")}

Mandatory Clearances & Critical Path Thresholds:
${clearances}

Land Acquisition & Right-of-Way (RoW) Rules:
  - Process: ${g.landAcquisitionRoW.statutoryProcess}
  - Mandated Thresholds: ${g.landAcquisitionRoW.mandatedThresholds.join(" | ")}
  - Risk Mitigation Rules: ${g.landAcquisitionRoW.riskMitigationRules.join(" | ")}

Key Engineering & Quality Standards:
${technicalCodes}

Cost & Contract Governance:
  - Escalation Formula: ${g.costAndContractGovernance.escalationFormula}
  - Variation Order Cap: ${g.costAndContractGovernance.variationOrderCap}
  - Dispute Resolution: ${g.costAndContractGovernance.disputeResolution}

Environmental, Coastal & Emergency Safety:
  - Clearances: ${g.environmentalAndHazardSafety.clearances.join("; ")}
  - Safety Buffer / Emergency Zone: ${g.environmentalAndHazardSafety.emergencySafetyZone}
  - Key Directives: ${g.environmentalAndHazardSafety.mitigationDirectives.join(" | ")}

Primary Root Causes of Delay in Sector:
  - ${g.commonOverrunCauses.join("\n  - ")}

Recommended PMU & Policy Interventions:
  - ${g.recommendedPmuInterventions.join("\n  - ")}`;
    })
    .join("\n\n");
}

/**
 * Generate comprehensive natural response when user asks for sector guidelines
 */
export function generateSectorGuidelineResponse(
  query: string,
  guidelines: StatutoryGuideline[]
): string {
  if (guidelines.length === 0) return "";

  const responseSections = guidelines.map((g) => {
    return `### 📜 Statutory & Operational Guidelines: ${g.sectorName}
*Authority: ${g.regulatoryAuthority}*

#### 1. Governing Legislation & Legal Acts:
${g.governingActs.map((act) => `- **${act}**`).join("\n")}

#### 2. Mandatory Clearances & Milestone Gates:
${g.keyClearances
  .map(
    (c) =>
      `- **${c.stage}** (${c.authority}): ${c.description}\n  *Critical Path Rule:* \`${c.criticalPathThreshold}\``
  )
  .join("\n")}

#### 3. Land Acquisition & Right-of-Way (RoW) Mandates:
- **Statutory Framework:** ${g.landAcquisitionRoW.statutoryProcess}
${g.landAcquisitionRoW.mandatedThresholds.map((t) => `- **Threshold:** ${t}`).join("\n")}
${g.landAcquisitionRoW.riskMitigationRules.map((r) => `- **Operational Directive:** ${r}`).join("\n")}

#### 4. Technical Standards & Quality Assurance Codes:
${g.technicalAndQualityCodes.map((t) => `- **${t.code}:** ${t.title} — *${t.application}*`).join("\n")}

#### 5. Cost Escalation & Variation Control:
- **Price Escalation:** ${g.costAndContractGovernance.escalationFormula}
- **Variation Order Cap:** ${g.costAndContractGovernance.variationOrderCap}
- **Dispute Redressal:** ${g.costAndContractGovernance.disputeResolution}

#### 6. Environmental Clearance & Emergency Safety:
- **Safety / Exclusion Zone:** ${g.environmentalAndHazardSafety.emergencySafetyZone}
- **Statutory Clearances:** ${g.environmentalAndHazardSafety.clearances.join("; ")}
- **Mitigation Protocols:** ${g.environmentalAndHazardSafety.mitigationDirectives.join("; ")}

#### 💡 PMU & PM GatiShakti Recommended Interventions:
${g.recommendedPmuInterventions.map((p) => `1. ${p}`).join("\n")}`;
  });

  return responseSections.join("\n\n---\n\n");
}

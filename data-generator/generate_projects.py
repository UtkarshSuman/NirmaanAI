"""
NIRMAAN AI — Synthetic Infrastructure Data Generator
=====================================================
Generates a realistic synthetic dataset of ~1,931 infrastructure projects
for development and demonstration purposes.

IMPORTANT: All generated data is SYNTHETIC. It does NOT represent live or
official government project records. Project names, costs, timelines, and
agency assignments are procedurally generated for system demonstration only.

Outputs:
  - projects.csv: Core project data
  - project_snapshots.csv: Monthly historical snapshots
  - project_milestones.csv: Milestone data

Usage:
  python generate_projects.py
"""

import csv
import json
import random
import math
import os
from datetime import datetime, timedelta
from pathlib import Path

# Seed for reproducibility
random.seed(42)

# ─── SECTOR & MINISTRY DEFINITIONS ──────────────────────────────────────────────

SECTORS = {
    "National Highways": {
        "ministry": "Ministry of Road Transport & Highways",
        "sub_sectors": ["Expressway", "National Highway", "Bypass", "Ring Road", "Bridge/Flyover"],
        "project_count": 287,
        "cost_range": (150, 25000),
        "cost_mean": 2500,
        "cost_std": 3000,
        "duration_range": (24, 84),
        "overrun_prob": 0.42,
        "mean_cost_overrun": 18.5,
        "std_cost_overrun": 15.0,
        "delay_prob": 0.48,
        "mean_delay_months": 24,
        "std_delay_months": 18,
        "agencies": ["NHAI", "NHIDCL", "BRO", "State PWD", "MSRDC", "UPEIDA"],
    },
    "Railways": {
        "ministry": "Ministry of Railways",
        "sub_sectors": ["New Line", "Gauge Conversion", "Doubling", "Electrification", "Station Redevelopment", "High-Speed Rail", "Dedicated Freight Corridor"],
        "project_count": 312,
        "cost_range": (150, 50000),
        "cost_mean": 4000,
        "cost_std": 5000,
        "duration_range": (36, 96),
        "overrun_prob": 0.52,
        "mean_cost_overrun": 22.3,
        "std_cost_overrun": 20.0,
        "delay_prob": 0.55,
        "mean_delay_months": 30,
        "std_delay_months": 20,
        "agencies": ["Indian Railways", "RVNL", "IRCON", "KRCL", "NHSRCL", "DFCCIL"],
    },
    "Ports & Shipping": {
        "ministry": "Ministry of Ports, Shipping & Waterways",
        "sub_sectors": ["Port Development", "Inland Waterway", "Shipyard", "Dredging"],
        "project_count": 65,
        "cost_range": (150, 15000),
        "cost_mean": 2000,
        "cost_std": 2500,
        "duration_range": (24, 72),
        "overrun_prob": 0.35,
        "mean_cost_overrun": 14.0,
        "std_cost_overrun": 12.0,
        "delay_prob": 0.40,
        "mean_delay_months": 18,
        "std_delay_months": 14,
        "agencies": ["Sagarmala", "IWAI", "Cochin Shipyard", "Major Port Trusts"],
    },
    "Civil Aviation": {
        "ministry": "Ministry of Civil Aviation",
        "sub_sectors": ["Airport", "Terminal Building", "Runway Extension", "ATC"],
        "project_count": 48,
        "cost_range": (150, 20000),
        "cost_mean": 3000,
        "cost_std": 4000,
        "duration_range": (24, 60),
        "overrun_prob": 0.38,
        "mean_cost_overrun": 16.0,
        "std_cost_overrun": 13.0,
        "delay_prob": 0.42,
        "mean_delay_months": 20,
        "std_delay_months": 15,
        "agencies": ["AAI", "DIAL", "MIAL", "BIAL", "HIAL", "GMR", "Adani"],
    },
    "Power Generation": {
        "ministry": "Ministry of Power",
        "sub_sectors": ["Thermal", "Hydro", "Nuclear (NPCIL)", "Gas-based"],
        "project_count": 125,
        "cost_range": (150, 80000),
        "cost_mean": 8000,
        "cost_std": 10000,
        "duration_range": (48, 120),
        "overrun_prob": 0.45,
        "mean_cost_overrun": 20.0,
        "std_cost_overrun": 18.0,
        "delay_prob": 0.50,
        "mean_delay_months": 36,
        "std_delay_months": 24,
        "agencies": ["NTPC", "NHPC", "SJVN", "THDC", "NEEPCO", "DVC"],
    },
    "Power Transmission": {
        "ministry": "Ministry of Power",
        "sub_sectors": ["Transmission Line", "Substation", "Grid Interconnection", "HVDC"],
        "project_count": 98,
        "cost_range": (150, 12000),
        "cost_mean": 1800,
        "cost_std": 2000,
        "duration_range": (18, 60),
        "overrun_prob": 0.30,
        "mean_cost_overrun": 12.0,
        "std_cost_overrun": 10.0,
        "delay_prob": 0.35,
        "mean_delay_months": 14,
        "std_delay_months": 10,
        "agencies": ["PGCIL", "Power Grid Corporation"],
    },
    "Renewable Energy": {
        "ministry": "Ministry of New & Renewable Energy",
        "sub_sectors": ["Solar Park", "Wind Farm", "Hybrid", "Green Hydrogen"],
        "project_count": 75,
        "cost_range": (150, 15000),
        "cost_mean": 2200,
        "cost_std": 2800,
        "duration_range": (18, 48),
        "overrun_prob": 0.25,
        "mean_cost_overrun": 10.0,
        "std_cost_overrun": 8.0,
        "delay_prob": 0.30,
        "mean_delay_months": 12,
        "std_delay_months": 8,
        "agencies": ["SECI", "NTPC RE", "IREDA", "State RE Agencies"],
    },
    "Petroleum Refining": {
        "ministry": "Ministry of Petroleum & Natural Gas",
        "sub_sectors": ["Refinery Expansion", "New Refinery", "Petrochemical Complex"],
        "project_count": 45,
        "cost_range": (500, 100000),
        "cost_mean": 15000,
        "cost_std": 12000,
        "duration_range": (36, 96),
        "overrun_prob": 0.40,
        "mean_cost_overrun": 18.0,
        "std_cost_overrun": 14.0,
        "delay_prob": 0.45,
        "mean_delay_months": 24,
        "std_delay_months": 18,
        "agencies": ["IOCL", "BPCL", "HPCL", "MRPL", "CPCL", "NRL"],
    },
    "Oil & Gas Pipelines": {
        "ministry": "Ministry of Petroleum & Natural Gas",
        "sub_sectors": ["Crude Pipeline", "Product Pipeline", "Gas Pipeline", "LNG Terminal"],
        "project_count": 52,
        "cost_range": (150, 30000),
        "cost_mean": 4000,
        "cost_std": 5000,
        "duration_range": (24, 72),
        "overrun_prob": 0.38,
        "mean_cost_overrun": 15.0,
        "std_cost_overrun": 12.0,
        "delay_prob": 0.42,
        "mean_delay_months": 20,
        "std_delay_months": 14,
        "agencies": ["GAIL", "IOCL Pipelines", "BPCL Pipelines", "HPCL Pipelines", "Indian Oil Pipelines Division"],
    },
    "Telecom": {
        "ministry": "Ministry of Communications",
        "sub_sectors": ["Optical Fiber", "Mobile Tower", "5G Network", "Data Center"],
        "project_count": 55,
        "cost_range": (150, 20000),
        "cost_mean": 2500,
        "cost_std": 3000,
        "duration_range": (18, 48),
        "overrun_prob": 0.28,
        "mean_cost_overrun": 10.0,
        "std_cost_overrun": 8.0,
        "delay_prob": 0.32,
        "mean_delay_months": 12,
        "std_delay_months": 8,
        "agencies": ["BSNL", "BharatNet", "TCIL", "C-DOT"],
    },
    "Urban Infrastructure": {
        "ministry": "Ministry of Housing & Urban Affairs",
        "sub_sectors": ["Metro Rail", "Smart City", "Urban Transport", "Housing", "Sewerage"],
        "project_count": 112,
        "cost_range": (150, 40000),
        "cost_mean": 5000,
        "cost_std": 6000,
        "duration_range": (36, 84),
        "overrun_prob": 0.50,
        "mean_cost_overrun": 25.0,
        "std_cost_overrun": 20.0,
        "delay_prob": 0.55,
        "mean_delay_months": 30,
        "std_delay_months": 22,
        "agencies": ["DMRC", "BMRCL", "CMRL", "KMRL", "NMRC", "LMRC", "Smart City SPVs"],
    },
    "Water Resources": {
        "ministry": "Ministry of Jal Shakti",
        "sub_sectors": ["Dam", "Barrage", "Canal", "Flood Control", "River Linking"],
        "project_count": 95,
        "cost_range": (150, 30000),
        "cost_mean": 3500,
        "cost_std": 4000,
        "duration_range": (36, 120),
        "overrun_prob": 0.48,
        "mean_cost_overrun": 22.0,
        "std_cost_overrun": 18.0,
        "delay_prob": 0.55,
        "mean_delay_months": 36,
        "std_delay_months": 24,
        "agencies": ["CWC", "NWDA", "State Water Resource Dept", "WAPCOS"],
    },
    "Irrigation": {
        "ministry": "Ministry of Jal Shakti",
        "sub_sectors": ["Major Irrigation", "Medium Irrigation", "Micro Irrigation", "Command Area Development"],
        "project_count": 85,
        "cost_range": (150, 15000),
        "cost_mean": 2000,
        "cost_std": 2500,
        "duration_range": (36, 96),
        "overrun_prob": 0.52,
        "mean_cost_overrun": 25.0,
        "std_cost_overrun": 20.0,
        "delay_prob": 0.58,
        "mean_delay_months": 36,
        "std_delay_months": 24,
        "agencies": ["State Irrigation Dept", "CADA", "AIBP Agencies"],
    },
    "Drinking Water & Sanitation": {
        "ministry": "Ministry of Jal Shakti",
        "sub_sectors": ["Water Supply", "STP", "Water Treatment Plant", "Pipeline Network"],
        "project_count": 72,
        "cost_range": (150, 10000),
        "cost_mean": 1500,
        "cost_std": 1800,
        "duration_range": (24, 60),
        "overrun_prob": 0.35,
        "mean_cost_overrun": 14.0,
        "std_cost_overrun": 10.0,
        "delay_prob": 0.38,
        "mean_delay_months": 16,
        "std_delay_months": 12,
        "agencies": ["Jal Jeevan Mission", "State PHED", "State Water Supply Board"],
    },
    "Coal": {
        "ministry": "Ministry of Coal",
        "sub_sectors": ["Coal Mine", "Coal Washery", "Coal Handling Plant", "Rail Corridor"],
        "project_count": 78,
        "cost_range": (150, 15000),
        "cost_mean": 1200,
        "cost_std": 1500,
        "duration_range": (24, 72),
        "overrun_prob": 0.40,
        "mean_cost_overrun": 16.0,
        "std_cost_overrun": 12.0,
        "delay_prob": 0.45,
        "mean_delay_months": 20,
        "std_delay_months": 14,
        "agencies": ["CIL", "SCCL", "NLC", "ECL", "BCCL", "MCL", "CCL"],
    },
    "Steel": {
        "ministry": "Ministry of Steel",
        "sub_sectors": ["Steel Plant Expansion", "New Steel Plant", "Special Steel"],
        "project_count": 42,
        "cost_range": (150, 50000),
        "cost_mean": 6000,
        "cost_std": 8000,
        "duration_range": (36, 84),
        "overrun_prob": 0.42,
        "mean_cost_overrun": 18.0,
        "std_cost_overrun": 15.0,
        "delay_prob": 0.48,
        "mean_delay_months": 24,
        "std_delay_months": 18,
        "agencies": ["SAIL", "RINL", "NMDC Steel", "Mecon"],
    },
    "Mining": {
        "ministry": "Ministry of Mines",
        "sub_sectors": ["Iron Ore Mine", "Bauxite Mine", "Limestone Mine", "Processing Plant"],
        "project_count": 55,
        "cost_range": (150, 10000),
        "cost_mean": 1500,
        "cost_std": 2000,
        "duration_range": (24, 60),
        "overrun_prob": 0.32,
        "mean_cost_overrun": 12.0,
        "std_cost_overrun": 10.0,
        "delay_prob": 0.38,
        "mean_delay_months": 16,
        "std_delay_months": 12,
        "agencies": ["NMDC", "HCL", "MOIL", "MECL", "State Mining Corp"],
    },
    "Atomic Energy": {
        "ministry": "Department of Atomic Energy",
        "sub_sectors": ["Nuclear Power Plant", "Research Reactor", "Nuclear Fuel Complex", "Heavy Water Plant"],
        "project_count": 35,
        "cost_range": (500, 80000),
        "cost_mean": 12000,
        "cost_std": 15000,
        "duration_range": (60, 144),
        "overrun_prob": 0.55,
        "mean_cost_overrun": 35.0,
        "std_cost_overrun": 25.0,
        "delay_prob": 0.60,
        "mean_delay_months": 48,
        "std_delay_months": 30,
        "agencies": ["NPCIL", "BHAVINI", "BARC", "NFC", "DAE"],
    },
    "Space": {
        "ministry": "Department of Space",
        "sub_sectors": ["Launch Pad", "Satellite Ground Station", "Space Research Center", "Mission Control"],
        "project_count": 28,
        "cost_range": (150, 15000),
        "cost_mean": 2500,
        "cost_std": 3000,
        "duration_range": (24, 72),
        "overrun_prob": 0.30,
        "mean_cost_overrun": 12.0,
        "std_cost_overrun": 8.0,
        "delay_prob": 0.35,
        "mean_delay_months": 16,
        "std_delay_months": 12,
        "agencies": ["ISRO", "VSSC", "SDSC SHAR", "SAC", "IIST"],
    },
    "Defence Infrastructure": {
        "ministry": "Ministry of Defence",
        "sub_sectors": ["Cantonment", "Ordnance Factory", "Naval Dockyard", "Air Base", "Border Roads"],
        "project_count": 85,
        "cost_range": (150, 25000),
        "cost_mean": 3000,
        "cost_std": 4000,
        "duration_range": (36, 84),
        "overrun_prob": 0.45,
        "mean_cost_overrun": 20.0,
        "std_cost_overrun": 16.0,
        "delay_prob": 0.50,
        "mean_delay_months": 28,
        "std_delay_months": 20,
        "agencies": ["BRO", "MES", "DRDO", "HAL", "BEL", "Defence Estates"],
    },
    "Health Infrastructure": {
        "ministry": "Ministry of Health & Family Welfare",
        "sub_sectors": ["AIIMS", "Medical College", "Hospital", "Research Institute"],
        "project_count": 62,
        "cost_range": (150, 8000),
        "cost_mean": 1200,
        "cost_std": 1500,
        "duration_range": (24, 60),
        "overrun_prob": 0.35,
        "mean_cost_overrun": 14.0,
        "std_cost_overrun": 10.0,
        "delay_prob": 0.40,
        "mean_delay_months": 18,
        "std_delay_months": 12,
        "agencies": ["CPWD", "HSCC", "State Health Dept", "AIIMS Admin"],
    },
    "Education Infrastructure": {
        "ministry": "Ministry of Education",
        "sub_sectors": ["IIT", "IIM", "NIT", "Central University", "Research Lab"],
        "project_count": 48,
        "cost_range": (150, 5000),
        "cost_mean": 800,
        "cost_std": 1000,
        "duration_range": (24, 48),
        "overrun_prob": 0.30,
        "mean_cost_overrun": 12.0,
        "std_cost_overrun": 8.0,
        "delay_prob": 0.35,
        "mean_delay_months": 14,
        "std_delay_months": 10,
        "agencies": ["CPWD", "NBCC", "IIT Admin", "State PWD"],
    },
}

# ─── INDIAN STATES ──────────────────────────────────────────────────────────────

STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu & Kashmir", "Ladakh"
]

# State-wise project distribution weights (proportional to infrastructure activity)
STATE_WEIGHTS = {
    "Maharashtra": 0.10, "Uttar Pradesh": 0.09, "Gujarat": 0.07, "Rajasthan": 0.06,
    "Tamil Nadu": 0.06, "Karnataka": 0.06, "Madhya Pradesh": 0.05, "Odisha": 0.04,
    "Telangana": 0.04, "Andhra Pradesh": 0.04, "West Bengal": 0.04, "Bihar": 0.04,
    "Jharkhand": 0.03, "Chhattisgarh": 0.03, "Punjab": 0.03, "Haryana": 0.03,
    "Kerala": 0.03, "Assam": 0.02, "Uttarakhand": 0.02, "Himachal Pradesh": 0.02,
    "Delhi": 0.02, "Jammu & Kashmir": 0.01, "Goa": 0.01, "Tripura": 0.01,
    "Meghalaya": 0.01, "Manipur": 0.01, "Mizoram": 0.005, "Nagaland": 0.005,
    "Arunachal Pradesh": 0.01, "Sikkim": 0.005, "Ladakh": 0.005,
}

# ─── DELAY REASONS ──────────────────────────────────────────────────────────────

DELAY_REASONS = [
    "Land acquisition delays",
    "Environmental clearance pending",
    "Forest clearance pending",
    "Contractual issues with EPC contractor",
    "Slow mobilization by contractor",
    "Fund release delays",
    "Change in project scope",
    "Geological surprises during construction",
    "Adverse weather conditions",
    "Right-of-Way (RoW) issues",
    "Utility shifting delays",
    "Law and order issues",
    "State government coordination issues",
    "Design changes during execution",
    "Material supply chain disruption",
    "Labour shortage",
    "COVID-19 pandemic impact",
    "Court stay orders",
    "Rehabilitation and resettlement issues",
    "Inter-departmental coordination delays",
    "Change in technology specifications",
    "Regulatory approvals pending",
    "Equipment delivery delays",
]

# ─── PROJECT NAME TEMPLATES ─────────────────────────────────────────────────────

PROJECT_NAME_TEMPLATES = {
    "National Highways": [
        "{subsector} - {city1} to {city2} Section ({state})",
        "Construction of {subsector} in {district}, {state}",
        "{subsector} Project on NH-{num} ({state})",
    ],
    "Railways": [
        "{subsector} of {city1}-{city2} Railway Line",
        "{subsector} Project - {city1} to {city2} Section",
        "{subsector} of Railway Line between {city1} and {city2}",
    ],
    "default": [
        "{subsector} Project in {district}, {state}",
        "{subsector} - {state} ({district})",
        "Construction of {subsector} at {district}, {state}",
    ],
}

CITIES = [
    "Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune",
    "Ahmedabad", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Visakhapatnam",
    "Bhopal", "Patna", "Ludhiana", "Agra", "Varanasi", "Surat", "Vadodara",
    "Indore", "Coimbatore", "Kochi", "Bhubaneswar", "Raipur", "Ranchi",
    "Guwahati", "Thiruvananthapuram", "Jodhpur", "Udaipur", "Amritsar",
    "Dehradun", "Shimla", "Chandigarh", "Gangtok", "Imphal", "Shillong",
]

DISTRICTS = [
    "North", "South", "East", "West", "Central",
    "Anand", "Barmer", "Bellary", "Bijapur", "Bokaro",
    "Burdwan", "Chittoor", "Dharwad", "Dibrugarh", "Durg",
    "Guntur", "Hassan", "Jalgaon", "Jharsuguda", "Karnal",
    "Khammam", "Korba", "Latur", "Meerut", "Nellore",
    "Raichur", "Raigad", "Rourkela", "Salem", "Satna",
    "Siliguri", "Solapur", "Tirunelveli", "Tumkur", "Warangal",
]


def generate_project_name(sector: str, sub_sector: str, state: str) -> str:
    """Generate a realistic project name."""
    templates = PROJECT_NAME_TEMPLATES.get(sector, PROJECT_NAME_TEMPLATES["default"])
    template = random.choice(templates)
    city1, city2 = random.sample(CITIES, 2)
    district = random.choice(DISTRICTS)
    num = random.randint(1, 365)
    return template.format(
        subsector=sub_sector, city1=city1, city2=city2,
        state=state, district=district, num=num
    )


def weighted_random_state() -> str:
    """Select a state based on infrastructure activity weights."""
    states = list(STATE_WEIGHTS.keys())
    weights = list(STATE_WEIGHTS.values())
    return random.choices(states, weights=weights, k=1)[0]


def generate_cost(sector_data: dict) -> float:
    """Generate a realistic project cost following log-normal distribution."""
    mean = sector_data["cost_mean"]
    std = sector_data["cost_std"]
    min_cost = sector_data["cost_range"][0]
    max_cost = sector_data["cost_range"][1]

    # Log-normal distribution for realistic cost distribution
    mu = math.log(mean ** 2 / math.sqrt(std ** 2 + mean ** 2))
    sigma = math.sqrt(math.log(1 + (std ** 2) / (mean ** 2)))
    cost = random.lognormvariate(mu, sigma)

    return round(max(min_cost, min(max_cost, cost)), 2)


def s_curve(t: float, steepness: float = 10.0, midpoint: float = 0.5) -> float:
    """S-curve function for realistic progress modeling."""
    return 1.0 / (1.0 + math.exp(-steepness * (t - midpoint)))


def generate_projects():
    """Generate all project data."""
    projects = []
    snapshots = []
    milestones = []

    project_counter = 0
    today = datetime(2026, 4, 1)  # As of April 2026

    total_original_cost = 0
    total_revised_cost = 0
    total_expenditure = 0

    for sector_name, sector_data in SECTORS.items():
        sector_code = "".join(w[0] for w in sector_name.split()).upper()[:3]
        count = sector_data["project_count"]

        for i in range(count):
            project_counter += 1
            project_id = f"PRJ-{sector_code}-{i+1:04d}"

            state = weighted_random_state()
            district = random.choice(DISTRICTS)
            sub_sector = random.choice(sector_data["sub_sectors"])
            agency = random.choice(sector_data["agencies"])
            project_name = generate_project_name(sector_name, sub_sector, state)

            # Financial data
            original_cost = generate_cost(sector_data)
            total_original_cost += original_cost

            # Determine if project will have cost overrun
            has_cost_overrun = random.random() < sector_data["overrun_prob"]
            if has_cost_overrun:
                overrun_pct = max(0, random.gauss(sector_data["mean_cost_overrun"], sector_data["std_cost_overrun"]))
                revised_cost = round(original_cost * (1 + overrun_pct / 100), 2)
            else:
                # Small variation even without overrun
                revised_cost = round(original_cost * random.uniform(0.98, 1.05), 2)
                overrun_pct = round((revised_cost - original_cost) / original_cost * 100, 2)

            total_revised_cost += revised_cost

            # Timeline
            year_of_approval = random.randint(2008, 2024)
            duration_range = sector_data["duration_range"]
            planned_duration = random.randint(duration_range[0], duration_range[1])

            original_start = datetime(year_of_approval, random.choice([1, 4, 7, 10]), 1)
            original_completion = original_start + timedelta(days=planned_duration * 30)

            # Time overrun
            has_time_overrun = random.random() < sector_data["delay_prob"]
            if has_time_overrun:
                delay_months = max(0, int(random.gauss(sector_data["mean_delay_months"], sector_data["std_delay_months"])))
                revised_completion = original_completion + timedelta(days=delay_months * 30)
            else:
                delay_months = 0
                revised_completion = original_completion + timedelta(days=random.randint(-60, 90))

            anticipated_completion = revised_completion + timedelta(days=random.randint(-90, 180))

            # Determine project status
            if today > revised_completion and random.random() < 0.4:
                project_status = "Completed"
                physical_progress = 100.0
            elif today < original_start:
                project_status = "Not Started"
                physical_progress = 0.0
            elif random.random() < 0.03:
                project_status = random.choice(["Shelved", "Stalled"])
                physical_progress = round(random.uniform(5, 60), 1)
            else:
                project_status = "Under Implementation"
                # Calculate realistic progress using S-curve
                elapsed = (today - original_start).days
                total_planned = (revised_completion - original_start).days
                if total_planned > 0:
                    t = min(elapsed / total_planned, 1.2)
                    # Add noise and use S-curve
                    noise = random.gauss(0, 0.05)
                    progress = s_curve(t, steepness=random.uniform(6, 14)) + noise
                    physical_progress = round(max(0, min(99.9, progress * 100)), 1)
                else:
                    physical_progress = round(random.uniform(10, 90), 1)

            # Expenditure based on progress and financial patterns
            if project_status == "Completed":
                cumulative_expenditure = revised_cost
            else:
                # Financial progress slightly trails/leads physical progress
                financial_factor = random.uniform(0.85, 1.15)
                cumulative_expenditure = round(revised_cost * (physical_progress / 100) * financial_factor, 2)

            cumulative_expenditure = min(cumulative_expenditure, revised_cost)
            total_expenditure += cumulative_expenditure

            financial_progress = round(cumulative_expenditure / revised_cost * 100, 1) if revised_cost > 0 else 0

            # Current/previous year expenditure
            if project_status == "Completed":
                exp_current_year = 0
                exp_previous_year = round(cumulative_expenditure * random.uniform(0.05, 0.15), 2)
            elif project_status in ["Shelved", "Stalled"]:
                exp_current_year = round(cumulative_expenditure * random.uniform(0, 0.02), 2)
                exp_previous_year = round(cumulative_expenditure * random.uniform(0.02, 0.08), 2)
            else:
                yearly_rate = random.uniform(0.08, 0.25)
                exp_current_year = round(revised_cost * yearly_rate * random.uniform(0.6, 1.4), 2)
                exp_previous_year = round(revised_cost * yearly_rate * random.uniform(0.5, 1.2), 2)
                exp_current_year = min(exp_current_year, revised_cost - cumulative_expenditure + exp_current_year)

            # Land acquisition cost
            land_cost_ratio = random.uniform(0.03, 0.25)
            land_acquisition_cost = round(original_cost * land_cost_ratio, 2)

            # Milestones
            total_milestones = random.randint(5, 20)
            if project_status == "Completed":
                achieved_milestones = total_milestones
            else:
                expected_milestones = int(total_milestones * physical_progress / 100)
                achieved_milestones = max(0, expected_milestones + random.randint(-2, 1))
                achieved_milestones = min(achieved_milestones, total_milestones)

            # Delay reasons
            if has_time_overrun and delay_months > 0:
                num_reasons = random.randint(1, 3)
                reasons = random.sample(DELAY_REASONS, num_reasons)
                reason_for_delay = "; ".join(reasons)
            else:
                reason_for_delay = ""

            # Cost revision count
            cost_revision_count = 0
            if has_cost_overrun:
                cost_revision_count = random.randint(1, 4)
            schedule_revision_count = 0
            if has_time_overrun:
                schedule_revision_count = random.randint(1, 3)

            project = {
                "project_id": project_id,
                "project_name": project_name,
                "ministry_department": sector_data["ministry"],
                "sector": sector_name,
                "sub_sector": sub_sector,
                "state": state,
                "district": district,
                "implementing_agency": agency,
                "original_cost_crore": original_cost,
                "revised_cost_crore": revised_cost,
                "anticipated_cost_crore": round(revised_cost * random.uniform(0.98, 1.08), 2),
                "cumulative_expenditure_crore": round(cumulative_expenditure, 2),
                "expenditure_current_year_crore": round(exp_current_year, 2),
                "expenditure_previous_year_crore": round(exp_previous_year, 2),
                "land_acquisition_cost_crore": land_acquisition_cost,
                "original_start_date": original_start.strftime("%Y-%m-%d"),
                "original_completion_date": original_completion.strftime("%Y-%m-%d"),
                "revised_completion_date": revised_completion.strftime("%Y-%m-%d"),
                "anticipated_completion_date": anticipated_completion.strftime("%Y-%m-%d"),
                "year_of_approval": year_of_approval,
                "physical_progress_percent": physical_progress,
                "financial_progress_percent": financial_progress,
                "milestone_achieved_count": achieved_milestones,
                "milestone_total_count": total_milestones,
                "project_status": project_status,
                "cost_overrun_percent": round(overrun_pct, 2),
                "time_overrun_months": delay_months,
                "reason_for_delay": reason_for_delay,
                "cost_revision_count": cost_revision_count,
                "schedule_revision_count": schedule_revision_count,
                "last_updated": (today - timedelta(days=random.randint(0, 30))).strftime("%Y-%m-%d"),
            }
            projects.append(project)

            # ─── GENERATE HISTORICAL SNAPSHOTS ───────────────────────────────
            snapshot_start = max(original_start, datetime(2020, 1, 1))
            snapshot_end = min(today, revised_completion + timedelta(days=180))

            current_date = snapshot_start
            while current_date < snapshot_end:
                elapsed_from_start = (current_date - original_start).days
                total_planned_days = (revised_completion - original_start).days

                if total_planned_days > 0:
                    t = min(elapsed_from_start / total_planned_days, 1.3)
                    snap_progress = s_curve(t, steepness=random.uniform(6, 14)) * 100
                    snap_progress = max(0, min(100, snap_progress + random.gauss(0, 3)))
                else:
                    snap_progress = random.uniform(0, 100)

                snap_expenditure = round(revised_cost * snap_progress / 100 * random.uniform(0.85, 1.15), 2)
                snap_expenditure = min(snap_expenditure, revised_cost)

                # Cost overrun evolves over time
                if has_cost_overrun and t > 0.3:
                    snap_overrun = round(overrun_pct * min(t / 0.8, 1.0) + random.gauss(0, 2), 2)
                else:
                    snap_overrun = round(random.uniform(-2, 3), 2)

                snapshot = {
                    "project_id": project_id,
                    "snapshot_date": current_date.strftime("%Y-%m-%d"),
                    "revised_cost_crore": round(original_cost * (1 + max(0, snap_overrun) / 100), 2),
                    "cumulative_expenditure_crore": round(snap_expenditure, 2),
                    "physical_progress_percent": round(snap_progress, 1),
                    "financial_progress_percent": round(snap_expenditure / revised_cost * 100, 1) if revised_cost > 0 else 0,
                    "milestone_achieved_count": min(int(snap_progress / 100 * total_milestones), total_milestones),
                    "project_status": project_status if current_date > datetime(2024, 1, 1) else "Under Implementation",
                    "cost_overrun_percent": round(max(0, snap_overrun), 2),
                    "time_overrun_months": max(0, delay_months) if t > 0.5 else 0,
                }
                snapshots.append(snapshot)

                # Monthly snapshots
                current_date += timedelta(days=30)

            # ─── GENERATE MILESTONES ─────────────────────────────────────────
            milestone_names = [
                "Land Acquisition", "Environmental Clearance", "Foundation/Civil Works",
                "Structural Work", "Equipment Procurement", "Installation",
                "Mechanical Completion", "Electrical Works", "Testing & Commissioning",
                "Trial Run", "Final Inspection", "Commercial Operation",
                "Documentation Complete", "Handover", "Defect Liability Period",
                "Phase 1 Complete", "Phase 2 Complete", "Phase 3 Complete",
                "Safety Audit", "Final Audit"
            ]

            for m_idx in range(total_milestones):
                m_name = milestone_names[m_idx % len(milestone_names)]
                m_target = original_start + timedelta(
                    days=int((m_idx + 1) / total_milestones * planned_duration * 30)
                )
                m_achieved = m_idx < achieved_milestones
                m_actual = None
                if m_achieved:
                    delay_factor = random.uniform(0.9, 1.3) if has_time_overrun else random.uniform(0.95, 1.1)
                    m_actual = m_target + timedelta(
                        days=int((m_target - original_start).days * (delay_factor - 1))
                    )

                milestones.append({
                    "project_id": project_id,
                    "milestone_index": m_idx + 1,
                    "milestone_name": m_name,
                    "target_date": m_target.strftime("%Y-%m-%d"),
                    "actual_date": m_actual.strftime("%Y-%m-%d") if m_actual else "",
                    "is_achieved": m_achieved,
                })

    # ─── WRITE OUTPUT FILES ──────────────────────────────────────────────────────

    output_dir = Path(__file__).parent.parent / "data" / "raw"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Projects CSV
    projects_file = output_dir / "projects.csv"
    with open(projects_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=projects[0].keys())
        writer.writeheader()
        writer.writerows(projects)

    # Snapshots CSV
    snapshots_file = output_dir / "project_snapshots.csv"
    with open(snapshots_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=snapshots[0].keys())
        writer.writeheader()
        writer.writerows(snapshots)

    # Milestones CSV
    milestones_file = output_dir / "project_milestones.csv"
    with open(milestones_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=milestones[0].keys())
        writer.writeheader()
        writer.writerows(milestones)

    # Summary stats
    print("=" * 60)
    print("NIRMAAN AI — Synthetic Data Generation Complete")
    print("=" * 60)
    print(f"Total Projects: {len(projects)}")
    print(f"Total Snapshots: {len(snapshots)}")
    print(f"Total Milestones: {len(milestones)}")
    print(f"Total Original Cost: Rs.{total_original_cost / 100000:.2f} lakh crore")
    print(f"Total Revised Cost: Rs.{total_revised_cost / 100000:.2f} lakh crore")
    print(f"Total Expenditure: Rs.{total_expenditure / 100000:.2f} lakh crore")
    print(f"Projects with Cost Overrun: {sum(1 for p in projects if p['cost_overrun_percent'] > 5)}")
    print(f"Projects with Time Overrun: {sum(1 for p in projects if p['time_overrun_months'] > 0)}")
    print(f"\nOutput files:")
    print(f"  {projects_file}")
    print(f"  {snapshots_file}")
    print(f"  {milestones_file}")

    # Also output JSON summary
    summary = {
        "total_projects": len(projects),
        "total_snapshots": len(snapshots),
        "total_milestones": len(milestones),
        "total_original_cost_lakh_crore": round(total_original_cost / 100000, 2),
        "total_revised_cost_lakh_crore": round(total_revised_cost / 100000, 2),
        "total_expenditure_lakh_crore": round(total_expenditure / 100000, 2),
        "sectors": len(SECTORS),
        "ministries": len(set(s["ministry"] for s in SECTORS.values())),
    }

    with open(output_dir / "data_summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    return projects, snapshots, milestones


if __name__ == "__main__":
    generate_projects()

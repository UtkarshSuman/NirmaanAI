import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const sector = searchParams.get("sector") || "";
    const state = searchParams.get("state") || "";
    const status = searchParams.get("status") || "";
    const risk = searchParams.get("risk") || "";
    const sortBy = searchParams.get("sortBy") || "revisedCostCrore";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "25", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { projectName: { contains: search } },
        { projectId: { contains: search } },
        { ministryDepartment: { contains: search } },
        { implementingAgency: { contains: search } },
      ];
    }

    if (sector && sector !== "ALL") {
      where.sector = sector;
    }

    if (state && state !== "ALL") {
      where.state = state;
    }

    if (status && status !== "ALL") {
      where.projectStatus = status;
    }

    if (risk && risk !== "ALL") {
      where.predictions = {
        some: {
          riskCategory: risk,
        },
      };
    }

    // Build orderBy
    const orderBy: any = {};
    if (["originalCostCrore", "revisedCostCrore", "costOverrunPercent", "timeOverrunMonths", "physicalProgressPercent"].includes(sortBy)) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.revisedCostCrore = "desc";
    }

    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          predictions: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
          alerts: {
            where: { isAcknowledged: false },
            take: 3,
          },
        },
      }),
    ]);

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

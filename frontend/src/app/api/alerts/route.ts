import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const severity = searchParams.get("severity");
    const status = searchParams.get("status"); // "all", "pending", "acknowledged"
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50", 10));

    const where: any = {};
    if (severity && severity !== "ALL") {
      where.severity = severity;
    }
    if (status === "pending") {
      where.isAcknowledged = false;
    } else if (status === "acknowledged") {
      where.isAcknowledged = true;
    }

    const alerts = await prisma.alert.findMany({
      where,
      take: limit,
      orderBy: [
        { isAcknowledged: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        project: {
          select: {
            projectName: true,
            ministryDepartment: true,
            state: true,
            sector: true,
            revisedCostCrore: true,
            costOverrunPercent: true,
            timeOverrunMonths: true,
          },
        },
      },
    });

    return NextResponse.json({ alerts, count: alerts.length });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { alertId, isAcknowledged } = body;

    if (!alertId) {
      return NextResponse.json({ error: "alertId is required" }, { status: 400 });
    }

    const updated = await prisma.alert.update({
      where: { id: alertId },
      data: {
        isAcknowledged: isAcknowledged ?? true,
        acknowledgedAt: isAcknowledged !== false ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, alert: updated });
  } catch (error) {
    console.error("Error updating alert:", error);
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}

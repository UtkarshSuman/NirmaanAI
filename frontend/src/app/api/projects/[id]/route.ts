import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentPredictionForProject } from "@/lib/services/predictionService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { projectId: id }],
      },
      include: {
        predictions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        alerts: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const currentPrediction = await getCurrentPredictionForProject(project.id);

    return NextResponse.json({
      ...project,
      currentPrediction,
    });
  } catch (error) {
    console.error("Error fetching project detail:", error);
    return NextResponse.json({ error: "Failed to fetch project details" }, { status: 500 });
  }
}


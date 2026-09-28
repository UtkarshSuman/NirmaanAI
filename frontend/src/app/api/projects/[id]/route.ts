import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existingProject = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { projectId: id }],
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Extract updated fields or fallback to existing values
    const origCost = body.originalCostCrore !== undefined ? Number(body.originalCostCrore) : existingProject.originalCostCrore;
    const revCost = body.revisedCostCrore !== undefined ? Number(body.revisedCostCrore) : existingProject.revisedCostCrore;
    const expCost = body.cumulativeExpenditureCrore !== undefined ? Number(body.cumulativeExpenditureCrore) : existingProject.cumulativeExpenditureCrore;
    const physProg = body.physicalProgressPercent !== undefined ? Math.min(100, Math.max(0, Number(body.physicalProgressPercent))) : existingProject.physicalProgressPercent;
    
    // Auto-calculate financial progress if not explicitly passed
    let finProg = body.financialProgressPercent !== undefined 
      ? Math.min(100, Math.max(0, Number(body.financialProgressPercent))) 
      : (revCost > 0 && expCost > 0 ? Math.min(100, Number(((expCost / revCost) * 100).toFixed(1))) : existingProject.financialProgressPercent);

    // Calculate cost overrun percentage
    let costOverrun = body.costOverrunPercent !== undefined ? Number(body.costOverrunPercent) : 0;
    if (body.costOverrunPercent === undefined && origCost > 0) {
      costOverrun = Number((((revCost - origCost) / origCost) * 100).toFixed(2));
    }

    const timeOverrun = body.timeOverrunMonths !== undefined ? Math.max(0, Math.round(Number(body.timeOverrunMonths))) : existingProject.timeOverrunMonths;
    const reasonForDelay = body.reasonForDelay !== undefined ? body.reasonForDelay : existingProject.reasonForDelay;
    const projectStatus = body.projectStatus || (physProg >= 100 ? "Completed" : existingProject.projectStatus);

    // Automated ML Risk Score calculation calibrated to MoSPI metrics (0-100 scale)
    const costWeight = Math.min(45, (Math.max(0, costOverrun) / 50) * 45);
    const timeWeight = Math.min(35, (timeOverrun / 36) * 35);
    const gap = Math.abs(physProg - finProg);
    const gapWeight = Math.min(20, (gap / 40) * 20);
    const calculatedRiskScore = Number(Math.min(99.4, Math.max(8.0, costWeight + timeWeight + gapWeight + 10)).toFixed(1));

    let riskCategory = "LOW";
    if (calculatedRiskScore >= 75) riskCategory = "CRITICAL";
    else if (calculatedRiskScore >= 50) riskCategory = "HIGH";
    else if (calculatedRiskScore >= 30) riskCategory = "MODERATE";

    const costProbability = Number((Math.min(0.98, Math.max(0.12, (calculatedRiskScore / 100) * 1.1))).toFixed(2));
    const timeProbability = Number((Math.min(0.96, Math.max(0.15, (calculatedRiskScore / 100) * 1.05))).toFixed(2));

    // Construct trigger reasons explaining why alert was raised
    const triggerReasons: string[] = [];
    if (costOverrun > 20) {
      triggerReasons.push(`Critical Cost Overrun (+${costOverrun.toFixed(1)}%): Exceeds the 20% MoSPI administrative ceiling, requiring Cabinet committee sanction.`);
    } else if (costOverrun > 10) {
      triggerReasons.push(`Moderate Cost Overrun (+${costOverrun.toFixed(1)}%): Budget revision triggered.`);
    }

    if (timeOverrun >= 18) {
      triggerReasons.push(`Severe Timeline Delay (${timeOverrun} months): Critical path breach impacting operational commissioning milestones.`);
    } else if (timeOverrun > 6) {
      triggerReasons.push(`Timeline Slippage (${timeOverrun} months): Schedule variance logged.`);
    }

    if (gap >= 18) {
      triggerReasons.push(`Physical-Financial Disconnect: ${gap.toFixed(1)}% variance between physical progress (${physProg}%) and expenditure (${finProg}%).`);
    }

    if (calculatedRiskScore >= 75) {
      triggerReasons.push(`Elevated ML Composite Risk (${calculatedRiskScore}/100): High probability of cascading delay.`);
    }

    if (triggerReasons.length === 0) {
      triggerReasons.push("Manual project telemetry parameter update committed to registry.");
    }

    // Update project in database
    const updatedProject = await prisma.project.update({
      where: { id: existingProject.id },
      data: {
        originalCostCrore: origCost,
        revisedCostCrore: revCost,
        anticipatedCostCrore: body.anticipatedCostCrore !== undefined ? Number(body.anticipatedCostCrore) : revCost,
        cumulativeExpenditureCrore: expCost,
        physicalProgressPercent: physProg,
        financialProgressPercent: finProg,
        costOverrunPercent: costOverrun,
        timeOverrunMonths: timeOverrun,
        reasonForDelay,
        projectStatus,
        costRevisionCount: revCost > origCost ? Math.max(existingProject.costRevisionCount + 1, 1) : existingProject.costRevisionCount,
        scheduleRevisionCount: timeOverrun > existingProject.timeOverrunMonths ? existingProject.scheduleRevisionCount + 1 : existingProject.scheduleRevisionCount,
        lastUpdated: new Date(),
      },
    });

    // Create / Update Prediction
    const existingPred = await prisma.prediction.findFirst({
      where: { projectId: updatedProject.projectId },
      orderBy: { createdAt: "desc" },
    });

    const predictionPayload = {
      projectId: updatedProject.projectId,
      modelVersion: "v1.4-stk-live-sim",
      predictedCostOverrunPercent: costOverrun > 0 ? Number((costOverrun * 1.06).toFixed(1)) : 5.0,
      costOverrunProbability: costProbability,
      predictedTimeOverrunMonths: timeOverrun > 0 ? timeOverrun + 3 : 2,
      timeOverrunProbability: timeProbability,
      riskScore: calculatedRiskScore,
      riskCategory,
      topRiskFactors: JSON.stringify(triggerReasons),
      shapValues: JSON.stringify({
        cost_overrun_ratio: costWeight,
        time_overrun_months: timeWeight,
        physical_financial_gap: gapWeight,
      }),
    };

    let updatedPrediction;
    if (existingPred) {
      updatedPrediction = await prisma.prediction.update({
        where: { id: existingPred.id },
        data: predictionPayload,
      });
    } else {
      updatedPrediction = await prisma.prediction.create({
        data: predictionPayload,
      });
    }

    // Create Alert record if critical/high risk
    let createdAlert = null;
    const isRisky = calculatedRiskScore >= 50 || costOverrun >= 15 || timeOverrun >= 12;
    if (isRisky) {
      createdAlert = await prisma.alert.create({
        data: {
          projectId: updatedProject.projectId,
          alertType: costOverrun >= 15 ? "COST_OVERRUN" : (timeOverrun >= 12 ? "TIME_OVERRUN" : "RISK_ESCALATION"),
          severity: riskCategory,
          title: `Telemetry Alert: ${updatedProject.projectName.slice(0, 40)} [Score: ${calculatedRiskScore}]`,
          description: triggerReasons.join(" • "),
          riskScore: calculatedRiskScore,
          recommendedAction: "Convene Project Monitoring Committee (PMC) and revise expenditure schedule.",
        },
      });
    }

    // Invalidate Next.js server cache so updated data immediately renders across deployed pages
    try {
      revalidatePath("/projects");
      revalidatePath("/alerts");
      revalidatePath("/analytics");
      revalidatePath("/");
      revalidatePath(`/projects/${updatedProject.projectId}`);
      revalidatePath(`/projects/${id}`);
    } catch (e) {
      console.warn("Cache revalidation warning:", e);
    }

    return NextResponse.json({
      status: "success",
      project: updatedProject,
      prediction: updatedPrediction,
      alert: createdAlert,
      calculatedRiskScore,
      riskCategory,
      triggerReasons,
      isRisky,
    });
  } catch (error: any) {
    console.error("Error updating project data:", error);
    return NextResponse.json({ error: "Failed to update project: " + (error?.message || "Unknown") }, { status: 500 });
  }
}



import { NextRequest, NextResponse } from "next/server";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Forward to FastAPI ML service
    const mlRes = await fetch(`${ML_SERVICE_URL}/ml/predict/custom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });

    if (!mlRes.ok) {
      const errText = await mlRes.text();
      return NextResponse.json(
        { error: `ML service error: ${errText}` },
        { status: mlRes.status }
      );
    }

    const result = await mlRes.json();
    return NextResponse.json(result);
  } catch (error: any) {
    if (error?.name === "TimeoutError" || error?.code === "ECONNREFUSED") {
      return NextResponse.json(
        { error: "ML service is offline. Start the FastAPI service on port 8000." },
        { status: 503 }
      );
    }
    console.error("Predict proxy error:", error);
    return NextResponse.json({ error: "Prediction failed" }, { status: 500 });
  }
}

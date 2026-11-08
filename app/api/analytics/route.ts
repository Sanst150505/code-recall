import { NextRequest, NextResponse } from "next/server";
import { calculateHistoricalAnalytics } from "@/lib/analytics-service";

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get("username")?.trim() || undefined;

    const analyticsSummary = await calculateHistoricalAnalytics(username);

    return NextResponse.json(analyticsSummary);
  } catch (error) {
    console.error("Analytics computation error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate historical analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

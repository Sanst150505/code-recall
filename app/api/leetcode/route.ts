
import { NextRequest, NextResponse } from "next/server";
import {
  getLeetCodeProfile,
  getRecentSubmissions,
  getProblemDetails
} from "@/lib/leetcode";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  try {
    const submissions = await getRecentSubmissions(username);

    const firstProblem = submissions[0];

    const details = firstProblem
    ? await getProblemDetails(firstProblem.titleSlug)
    : null;

    return NextResponse.json({
    submissions,
    firstProblemDetails: details
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}

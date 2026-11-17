import { NextRequest, NextResponse } from "next/server";
import { getRecentSubmissions } from "@/lib/leetcode";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, problemSlug } = body;

    if (!username || !problemSlug) {
      return NextResponse.json(
        { error: "Username and problemSlug are required" },
        { status: 400 }
      );
    }

    const trimmedUser = username.trim();
    const targetSlug = problemSlug.trim().toLowerCase();

    // 1. If testing on the demo persona, provide simulated verification so recruiters/visitors can test the UI flow
    if (trimmedUser === "demo") {
      return NextResponse.json({
        verified: true,
        isDemo: true,
        problemSlug: targetSlug,
        submittedAt: new Date().toISOString(),
        message: "Demo Verified: Simulated Accepted submission detected for demo showcase.",
      });
    }

    // 2. For real users, query LeetCode's live GraphQL API for recent AC submissions
    const recentSubmissions = await getRecentSubmissions(trimmedUser);

    const match = recentSubmissions.find(
      (sub) => sub.titleSlug.toLowerCase() === targetSlug
    );

    if (!match) {
      return NextResponse.json({
        verified: false,
        problemSlug: targetSlug,
        message: `No recent Accepted submission found on LeetCode for "${targetSlug}". Please submit your code on LeetCode, get an "Accepted" verdict, and click verify again.`,
      });
    }

    const submissionTime = new Date(parseInt(match.timestamp, 10) * 1000);

    return NextResponse.json({
      verified: true,
      problemSlug: targetSlug,
      title: match.title,
      submittedAt: submissionTime.toISOString(),
      message: `Verified! LeetCode confirmed an Accepted submission for "${match.title}".`,
    });
  } catch (err) {
    console.error("Error verifying LeetCode submission:", err);
    return NextResponse.json(
      {
        verified: false,
        error: err instanceof Error ? err.message : "Failed to verify submission with LeetCode API",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { syncLeetCodeData } from "@/lib/sync-service";

export async function POST(request: NextRequest) {
  try {
    let username = "";
    let forceFullSync = false;

    try {
      const body = await request.json();
      username = body.username?.trim() || "";
      forceFullSync = Boolean(body.forceFullSync);
    } catch {
      // Body may be empty or plain text
    }

    if (!username) {
      username = request.nextUrl.searchParams.get("username")?.trim() || "";
    }

    if (!username) {
      return NextResponse.json(
        { error: "Username is required in request body or query parameter" },
        { status: 400 }
      );
    }

    // Credentials accessed strictly server-side from local environment variables
    const session = process.env.LEETCODE_SESSION?.trim();
    const csrf = process.env.LEETCODE_CSRF_TOKEN?.trim();

    const result = await syncLeetCodeData({
      username,
      session,
      csrf,
      forceFullSync,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Synchronization failed";

    if (message.includes("Authentication failed")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    if (message.includes("Identity mismatch")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    console.error("Sync pipeline error:", message);
    return NextResponse.json(
      { error: "Failed to synchronize LeetCode data", details: message },
      { status: 500 }
    );
  }
}

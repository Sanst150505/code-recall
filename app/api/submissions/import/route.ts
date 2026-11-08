import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProblemDetails } from "@/lib/leetcode";

interface ExtensionSubmissionPayload {
  id: string | number;
  titleSlug: string;
  title?: string;
  statusDisplay?: string;
  lang?: string;
  runtime?: string | number;
  memory?: string | number;
  timestamp: string | number;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

function parseSubmissionDate(ts: string | number | undefined | null): Date {
  if (!ts) return new Date();
  const n = Number(ts);
  if (isNaN(n) || n <= 0) return new Date();
  // If timestamp is in seconds (< 100 billion), convert to milliseconds
  const ms = n < 100000000000 ? n * 1000 : n;
  const d = new Date(ms);
  return isNaN(d.getTime()) ? new Date() : d;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leetcodeUsername, submissions, pageOffset, hasNext } = body;

    if (!leetcodeUsername || typeof leetcodeUsername !== "string") {
      return NextResponse.json(
        { error: "Invalid payload: leetcodeUsername string is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!Array.isArray(submissions)) {
      return NextResponse.json(
        { error: "Invalid payload: submissions array is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const trimmedUsername = leetcodeUsername.trim();

    // 1. Get or create User
    const user = await prisma.user.upsert({
      where: { username: trimmedUsername },
      update: { lastSyncedAt: new Date() },
      create: { username: trimmedUsername, lastSyncedAt: new Date() },
      include: { syncCheckpoint: true },
    });

    // Filter to only submissions with valid id and titleSlug
    const validSubmissions: ExtensionSubmissionPayload[] = submissions.filter(
      (s: ExtensionSubmissionPayload) => s && s.id && s.titleSlug && typeof s.titleSlug === "string"
    );

    if (validSubmissions.length === 0) {
      return NextResponse.json(
        {
          success: true,
          savedCount: 0,
          duplicatesSkipped: 0,
          message: "No valid submissions in this batch",
        },
        { headers: corsHeaders }
      );
    }

    // 2. Collect unique problem slugs
    const distinctSlugs = Array.from(new Set(validSubmissions.map((s) => s.titleSlug.trim())));
    const existingProblems = await prisma.problem.findMany({
      where: { slug: { in: distinctSlugs } },
      select: { id: true, slug: true },
    });

    const slugToIdMap = new Map<string, number>();
    existingProblems.forEach((p) => slugToIdMap.set(p.slug, p.id));

    // For any missing problem slugs, enrich them or fallback
    const missingSlugs = distinctSlugs.filter((s) => !slugToIdMap.has(s));
    for (const slug of missingSlugs) {
      const sub = validSubmissions.find((s) => s.titleSlug === slug);
      let details = null;

      try {
        // Attempt fast problem metadata lookup
        details = await Promise.race([
          getProblemDetails(slug),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000)),
        ]);
      } catch {
        // Fallback gracefully without throwing
        details = null;
      }

      const initialSolvedAt =
        sub?.statusDisplay === "Accepted" ? parseSubmissionDate(sub.timestamp) : null;

      const saved = await prisma.problem.upsert({
        where: { slug },
        update: details
          ? {
              title: details.title,
              difficulty: details.difficulty,
              topics: details.topicTags.map((t) => t.name),
            }
          : {},
        create: {
          slug,
          title: details?.title || sub?.title || slug,
          difficulty: details?.difficulty || "Unknown",
          solvedAt: initialSolvedAt,
          topics: details ? details.topicTags.map((t) => t.name) : [],
        },
      });

      slugToIdMap.set(slug, saved.id);
    }

    // 3. Prepare submission records
    const recordsToInsert = validSubmissions
      .map((sub: ExtensionSubmissionPayload) => {
        const pId = slugToIdMap.get(sub.titleSlug);
        if (!pId) return null;

        const rtStr = sub.runtime !== undefined && sub.runtime !== null ? String(sub.runtime) : "";
        const memStr = sub.memory !== undefined && sub.memory !== null ? String(sub.memory) : "";

        const rtVal =
          rtStr && rtStr !== "N/A"
            ? parseInt(rtStr.replace(/[^0-9]/g, ""), 10) || null
            : null;

        const memVal =
          memStr && memStr !== "N/A"
            ? parseFloat(memStr.replace(/[^0-9.]/g, "")) || null
            : null;

        return {
          id: String(sub.id),
          userId: user.id,
          problemId: pId,
          status: sub.statusDisplay || "Unknown",
          language: sub.lang ? String(sub.lang) : null,
          runtime: rtVal,
          memory: memVal,
          submittedAt: parseSubmissionDate(sub.timestamp),
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    const insertRes = await prisma.submission.createMany({
      data: recordsToInsert,
      skipDuplicates: true,
    });

    // 4. Update checkpoint using upsert to avoid duplicate key conflicts
    const firstSub = validSubmissions[0];
    const lastSub = validSubmissions[validSubmissions.length - 1];
    const firstDate = parseSubmissionDate(firstSub.timestamp);
    const lastDate = parseSubmissionDate(lastSub.timestamp);

    const currentCheckpoint = user.syncCheckpoint;
    const isNewer =
      !currentCheckpoint?.newestSubmissionTime || firstDate > currentCheckpoint.newestSubmissionTime;
    const isOlder =
      !currentCheckpoint?.oldestSubmissionTime || lastDate < currentCheckpoint.oldestSubmissionTime;

    const checkpoint = await prisma.syncCheckpoint.upsert({
      where: { userId: user.id },
      update: {
        lastPersistedOffset: pageOffset ?? ((currentCheckpoint?.lastPersistedOffset || 0) + validSubmissions.length),
        totalSyncedCount: { increment: insertRes.count },
        newestSubmissionId: isNewer ? String(firstSub.id) : currentCheckpoint?.newestSubmissionId,
        newestSubmissionTime: isNewer ? firstDate : currentCheckpoint?.newestSubmissionTime,
        oldestSubmissionId: isOlder ? String(lastSub.id) : currentCheckpoint?.oldestSubmissionId,
        oldestSubmissionTime: isOlder ? lastDate : currentCheckpoint?.oldestSubmissionTime,
        isInitialSyncComplete: !hasNext || (currentCheckpoint?.isInitialSyncComplete ?? false),
        lastSyncedAt: new Date(),
      },
      create: {
        userId: user.id,
        lastPersistedOffset: pageOffset ?? validSubmissions.length,
        totalSyncedCount: insertRes.count,
        newestSubmissionId: String(firstSub.id),
        newestSubmissionTime: firstDate,
        oldestSubmissionId: String(lastSub.id),
        oldestSubmissionTime: lastDate,
        isInitialSyncComplete: !hasNext,
        lastSyncedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        savedCount: insertRes.count,
        duplicatesSkipped: validSubmissions.length - insertRes.count,
        isInitialSyncComplete: checkpoint.isInitialSyncComplete,
        checkpoint: {
          lastPersistedOffset: checkpoint.lastPersistedOffset,
          newestSubmissionId: checkpoint.newestSubmissionId,
          oldestSubmissionId: checkpoint.oldestSubmissionId,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Extension import API error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: "Failed to import submissions", details: message },
      { status: 500, headers: corsHeaders }
    );
  }
}

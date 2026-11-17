import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get("username")?.trim();

    let user;
    if (username) {
      user = await prisma.user.findUnique({
        where: { username },
        include: { syncCheckpoint: true },
      });
    } else {
      user = await prisma.user.findFirst({
        where: { submissions: { some: {} } },
        include: { syncCheckpoint: true },
        orderBy: { lastSyncedAt: "desc" },
      });

      if (!user) {
        user = await prisma.user.findFirst({
          include: { syncCheckpoint: true },
          orderBy: { lastSyncedAt: "desc" },
        });
      }
    }

    if (!user) {
      return NextResponse.json({
        hasUser: false,
        message: "No user account has been synchronized yet.",
      });
    }

    const [totalSubmissions, totalProblems, acceptedCount] = await Promise.all([
      prisma.submission.count({ where: { userId: user.id } }),
      prisma.problem.count(),
      prisma.submission.count({ where: { userId: user.id, status: "Accepted" } }),
    ]);

    return NextResponse.json({
      hasUser: true,
      user: {
        id: user.id,
        username: user.username,
        lastSyncedAt: user.lastSyncedAt?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
      },
      stats: {
        totalSubmissions,
        totalProblems,
        acceptedCount,
        passRate: totalSubmissions > 0 ? Math.round((acceptedCount / totalSubmissions) * 1000) / 10 : null,
      },
      checkpoint: user.syncCheckpoint
        ? {
            isInitialSyncComplete: user.syncCheckpoint.isInitialSyncComplete,
            lastPersistedOffset: user.syncCheckpoint.lastPersistedOffset,
            totalSyncedCount: user.syncCheckpoint.totalSyncedCount,
            newestSubmissionTime: user.syncCheckpoint.newestSubmissionTime?.toISOString() ?? null,
            oldestSubmissionTime: user.syncCheckpoint.oldestSubmissionTime?.toISOString() ?? null,
            newestSubmissionId: user.syncCheckpoint.newestSubmissionId,
            oldestSubmissionId: user.syncCheckpoint.oldestSubmissionId,
            lastSyncedAt: user.syncCheckpoint.lastSyncedAt?.toISOString() ?? null,
          }
        : null,
    });
  } catch (error) {
    console.error("Sync status API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sync status", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

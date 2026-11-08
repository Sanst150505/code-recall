import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(10, parseInt(searchParams.get("pageSize") || "20", 10)));
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const difficulty = searchParams.get("difficulty")?.trim() || "";
    const topic = searchParams.get("topic")?.trim() || "";
    const username = searchParams.get("username")?.trim() || "";

    // Build filter conditions
    const where: Record<string, unknown> = {};

    if (username) {
      where.user = { username };
    }

    if (status) {
      if (status === "Accepted") {
        where.status = "Accepted";
      } else if (status === "Failed") {
        where.status = { not: "Accepted" };
      } else {
        where.status = status;
      }
    }

    // Problem-level filters
    const problemWhere: Record<string, unknown> = {};

    if (difficulty && difficulty !== "All") {
      problemWhere.difficulty = difficulty;
    }

    if (topic && topic !== "All") {
      problemWhere.topics = { has: topic };
    }

    if (search) {
      problemWhere.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    if (Object.keys(problemWhere).length > 0) {
      where.problem = problemWhere;
    }

    const [total, submissions] = await Promise.all([
      prisma.submission.count({ where }),
      prisma.submission.findMany({
        where,
        include: {
          problem: {
            select: {
              id: true,
              slug: true,
              title: true,
              difficulty: true,
              topics: true,
            },
          },
        },
        orderBy: { submittedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      submissions: submissions.map((sub) => ({
        id: sub.id,
        problemId: sub.problemId,
        title: sub.problem.title,
        titleSlug: sub.problem.slug,
        difficulty: sub.problem.difficulty,
        topics: sub.problem.topics,
        status: sub.status,
        language: sub.language,
        runtime: sub.runtime,
        memory: sub.memory,
        submittedAt: sub.submittedAt.toISOString(),
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Submissions API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

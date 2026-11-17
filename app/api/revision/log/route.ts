import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, topic, problemSlug, outcome, notes } = body;

    if (!username || !topic || !outcome) {
      return NextResponse.json(
        { error: "username, topic, and outcome are required" },
        { status: 400 }
      );
    }

    const validOutcomes = ["INDEPENDENT", "WITH_HINTS", "COULD_NOT_SOLVE"];
    if (!validOutcomes.includes(outcome)) {
      return NextResponse.json(
        { error: `Invalid outcome. Must be one of: ${validOutcomes.join(", ")}` },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const record = await prisma.revisionRecord.create({
      data: {
        userId: user.id,
        topic: topic.trim(),
        problemSlug: problemSlug?.trim() || null,
        outcome,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      record: {
        id: record.id,
        topic: record.topic,
        problemSlug: record.problemSlug,
        outcome: record.outcome,
        revisedAt: record.revisedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Error creating revision record:", err);
    return NextResponse.json(
      { error: "Internal server error logging revision" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const username = searchParams.get("username")?.trim();
    const topic = searchParams.get("topic")?.trim();

    if (!username) {
      return NextResponse.json({ records: [] });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ records: [] });
    }

    const where: { userId: number; topic?: string } = { userId: user.id };
    if (topic) {
      where.topic = topic;
    }

    const records = await prisma.revisionRecord.findMany({
      where,
      orderBy: { revisedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      records: records.map((r) => ({
        id: r.id,
        topic: r.topic,
        problemSlug: r.problemSlug,
        outcome: r.outcome,
        notes: r.notes,
        revisedAt: r.revisedAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("Error fetching revision records:", err);
    return NextResponse.json({ records: [] }, { status: 500 });
  }
}

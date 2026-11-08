import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const user = await prisma.user.findFirst({
    include: {
      submissions: {
        include: {
          problem: true,
        },
        orderBy: { submittedAt: "desc" },
      },
    },
  });

  if (!user) {
    console.log("No user found.");
    return;
  }

  console.log(`User: ${user.username}`);
  console.log(`Total Submissions: ${user.submissions.length}`);

  const topicStats = new Map<string, { totalAttempts: number; acCount: number; lastDate: Date }>();

  for (const sub of user.submissions) {
    for (const topic of sub.problem.topics) {
      if (!topicStats.has(topic)) {
        topicStats.set(topic, { totalAttempts: 0, acCount: 0, lastDate: sub.submittedAt });
      }
      const s = topicStats.get(topic)!;
      s.totalAttempts++;
      if (sub.status === "Accepted") {
        s.acCount++;
      }
      if (sub.submittedAt > s.lastDate) {
        s.lastDate = sub.submittedAt;
      }
    }
  }

  console.log(`Distinct Topics: ${topicStats.size}`);
  const sorted = Array.from(topicStats.entries()).sort((a, b) => b[1].totalAttempts - a[1].totalAttempts);
  console.log("\nTop 15 Topics by submission volume:");
  for (const [topic, s] of sorted.slice(0, 15)) {
    console.log(`  - ${topic.padEnd(25)} Attempts: ${s.totalAttempts.toString().padStart(3)} | AC: ${s.acCount.toString().padStart(3)} | Last: ${s.lastDate.toISOString().split("T")[0]}`);
  }
}

main().finally(() => prisma.$disconnect());

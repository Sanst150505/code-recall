import "dotenv/config";
import { prisma } from "../lib/prisma";

interface SeedProblemDef {
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
}

const PROBLEMS: SeedProblemDef[] = [
  // Two Pointers / Arrays / Math (Maintained & Recent)
  { slug: "two-sum", title: "Two Sum", difficulty: "Easy", topics: ["Array", "Hash Table"] },
  { slug: "valid-palindrome", title: "Valid Palindrome", difficulty: "Easy", topics: ["Two Pointers", "String"] },
  { slug: "3sum", title: "3Sum", difficulty: "Medium", topics: ["Array", "Two Pointers", "Sorting"] },
  { slug: "container-with-most-water", title: "Container With Most Water", difficulty: "Medium", topics: ["Array", "Two Pointers", "Greedy"] },
  { slug: "trapping-rain-water", title: "Trapping Rain Water", difficulty: "Hard", topics: ["Array", "Two Pointers", "Stack", "Monotonic Stack"] },
  { slug: "best-time-to-buy-and-sell-stock", title: "Best Time to Buy and Sell Stock", difficulty: "Easy", topics: ["Array", "Dynamic Programming"] },

  // Binary Search (Recent & Active)
  { slug: "binary-search", title: "Binary Search", difficulty: "Easy", topics: ["Array", "Binary Search"] },
  { slug: "search-in-rotated-sorted-array", title: "Search in Rotated Sorted Array", difficulty: "Medium", topics: ["Array", "Binary Search"] },
  { slug: "find-minimum-in-rotated-sorted-array", title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", topics: ["Array", "Binary Search"] },
  { slug: "koko-eating-bananas", title: "Koko Eating Bananas", difficulty: "Medium", topics: ["Array", "Binary Search"] },

  // Dynamic Programming (Critical Revision - Solved 100-130 days ago, 0 recent practice)
  { slug: "climbing-stairs", title: "Climbing Stairs", difficulty: "Easy", topics: ["Math", "Dynamic Programming", "Memoization"] },
  { slug: "coin-change", title: "Coin Change", difficulty: "Medium", topics: ["Array", "Dynamic Programming", "Breadth-First Search"] },
  { slug: "longest-increasing-subsequence", title: "Longest Increasing Subsequence", difficulty: "Medium", topics: ["Array", "Binary Search", "Dynamic Programming"] },
  { slug: "house-robber", title: "House Robber", difficulty: "Medium", topics: ["Array", "Dynamic Programming"] },
  { slug: "word-break", title: "Word Break", difficulty: "Medium", topics: ["Hash Table", "String", "Dynamic Programming", "Trie", "Memoization"] },
  { slug: "maximum-subarray", title: "Maximum Subarray", difficulty: "Medium", topics: ["Array", "Divide and Conquer", "Dynamic Programming"] },

  // Graph / DFS / BFS (High Friction - 3-4 attempts per problem, high struggle ratio, 20 days ago)
  { slug: "course-schedule", title: "Course Schedule", difficulty: "Medium", topics: ["Depth-First Search", "Breadth-First Search", "Graph", "Topological Sort"] },
  { slug: "course-schedule-ii", title: "Course Schedule II", difficulty: "Medium", topics: ["Depth-First Search", "Breadth-First Search", "Graph", "Topological Sort"] },
  { slug: "number-of-islands", title: "Number of Islands", difficulty: "Medium", topics: ["Array", "Depth-First Search", "Breadth-First Search", "Union Find", "Matrix"] },
  { slug: "clone-graph", title: "Clone Graph", difficulty: "Medium", topics: ["Hash Table", "Depth-First Search", "Breadth-First Search", "Graph"] },
  { slug: "pacific-atlantic-water-flow", title: "Pacific Atlantic Water Flow", difficulty: "Medium", topics: ["Array", "Depth-First Search", "Breadth-First Search", "Matrix"] },

  // Trees (Maintained, moderate depth)
  { slug: "invert-binary-tree", title: "Invert Binary Tree", difficulty: "Easy", topics: ["Tree", "Depth-First Search", "Breadth-First Search", "Binary Tree"] },
  { slug: "maximum-depth-of-binary-tree", title: "Maximum Depth of Binary Tree", difficulty: "Easy", topics: ["Tree", "Depth-First Search", "Breadth-First Search", "Binary Tree"] },
  { slug: "validate-binary-search-tree", title: "Validate Binary Search Tree", difficulty: "Medium", topics: ["Tree", "Depth-First Search", "Binary Search Tree", "Binary Tree"] },
  { slug: "lowest-common-ancestor-of-a-binary-search-tree", title: "Lowest Common Ancestor of a Binary Search Tree", difficulty: "Medium", topics: ["Tree", "Depth-First Search", "Binary Search Tree", "Binary Tree"] },

  // Low Exposure Deficits (Only 1 or 2 solved problems all-time)
  { slug: "implement-trie-prefix-tree", title: "Implement Trie (Prefix Tree)", difficulty: "Medium", topics: ["Hash Table", "String", "Design", "Trie"] },
  { slug: "single-number", title: "Single Number", difficulty: "Easy", topics: ["Array", "Bit Manipulation"] },
  { slug: "number-of-1-bits", title: "Number of 1 Bits", difficulty: "Easy", topics: ["Divide and Conquer", "Bit Manipulation"] },
  { slug: "lru-cache", title: "LRU Cache", difficulty: "Medium", topics: ["Hash Table", "Linked List", "Design", "Doubly-Linked List"] },
];

async function main() {
  console.log("Seeding demo user and submissions...");

  // 1. Upsert User "demo"
  const user = await prisma.user.upsert({
    where: { username: "demo" },
    update: { lastSyncedAt: new Date() },
    create: {
      username: "demo",
      lastSyncedAt: new Date(),
    },
  });

  // 2. Clean up existing submissions for demo to ensure deterministic re-runs
  await prisma.submission.deleteMany({
    where: { userId: user.id },
  });

  // 3. Upsert Problems
  const problemMap = new Map<string, number>();
  for (const p of PROBLEMS) {
    const record = await prisma.problem.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        difficulty: p.difficulty,
        topics: p.topics,
      },
      create: {
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty,
        topics: p.topics,
      },
    });
    problemMap.set(p.slug, record.id);
  }

  const now = new Date();
  const daysAgo = (d: number, hoursOffset = 0) => {
    const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000 - hoursOffset * 60 * 60 * 1000);
    return date;
  };

  interface RawSub {
    slug: string;
    status: "Accepted" | "Wrong Answer" | "Time Limit Exceeded";
    lang: string;
    runtime: number;
    memory: number;
    date: Date;
  }

  const submissionRows: RawSub[] = [];

  // Group 1: Historical Timeline Foundations (6 to 10 months ago)
  submissionRows.push(
    { slug: "two-sum", status: "Accepted", lang: "python3", runtime: 48, memory: 17.2, date: daysAgo(270) },
    { slug: "valid-palindrome", status: "Accepted", lang: "python3", runtime: 35, memory: 16.8, date: daysAgo(260) },
    { slug: "maximum-depth-of-binary-tree", status: "Accepted", lang: "cpp", runtime: 4, memory: 18.9, date: daysAgo(240) },
    { slug: "invert-binary-tree", status: "Accepted", lang: "cpp", runtime: 3, memory: 10.1, date: daysAgo(230) },
    { slug: "binary-search", status: "Accepted", lang: "python3", runtime: 195, memory: 18.1, date: daysAgo(210) }
  );

  // Group 2: Dynamic Programming (Critical Revision - 110-125 days ago, 0 recent)
  submissionRows.push(
    { slug: "climbing-stairs", status: "Accepted", lang: "python3", runtime: 31, memory: 16.4, date: daysAgo(125) },
    { slug: "coin-change", status: "Wrong Answer", lang: "python3", runtime: 0, memory: 0, date: daysAgo(120, 2) },
    { slug: "coin-change", status: "Accepted", lang: "python3", runtime: 852, memory: 17.1, date: daysAgo(120) },
    { slug: "longest-increasing-subsequence", status: "Accepted", lang: "python3", runtime: 120, memory: 16.9, date: daysAgo(118) },
    { slug: "house-robber", status: "Accepted", lang: "python3", runtime: 38, memory: 16.5, date: daysAgo(115) },
    { slug: "word-break", status: "Wrong Answer", lang: "cpp", runtime: 0, memory: 0, date: daysAgo(112, 1) },
    { slug: "word-break", status: "Accepted", lang: "cpp", runtime: 8, memory: 12.3, date: daysAgo(112) },
    { slug: "maximum-subarray", status: "Accepted", lang: "python3", runtime: 54, memory: 31.2, date: daysAgo(108) },
    { slug: "best-time-to-buy-and-sell-stock", status: "Accepted", lang: "python3", runtime: 620, memory: 27.5, date: daysAgo(105) }
  );

  // Group 3: Low Exposure Deficits (Trie, Bit Manipulation, LRU Cache - only 1 solve each, 45-70 days ago)
  submissionRows.push(
    { slug: "implement-trie-prefix-tree", status: "Accepted", lang: "cpp", runtime: 42, memory: 45.1, date: daysAgo(65) },
    { slug: "single-number", status: "Accepted", lang: "python3", runtime: 110, memory: 18.5, date: daysAgo(60) },
    { slug: "number-of-1-bits", status: "Accepted", lang: "python3", runtime: 35, memory: 16.2, date: daysAgo(50) },
    { slug: "lru-cache", status: "Wrong Answer", lang: "cpp", runtime: 0, memory: 0, date: daysAgo(45, 3) },
    { slug: "lru-cache", status: "Accepted", lang: "cpp", runtime: 58, memory: 168.4, date: daysAgo(45) }
  );

  // Group 4: High Friction (Graph / DFS / Topological Sort - heavy failed attempts, 20-30 days ago)
  submissionRows.push(
    // Course Schedule - 3 attempts
    { slug: "course-schedule", status: "Time Limit Exceeded", lang: "python3", runtime: 0, memory: 0, date: daysAgo(28, 4) },
    { slug: "course-schedule", status: "Wrong Answer", lang: "python3", runtime: 0, memory: 0, date: daysAgo(28, 2) },
    { slug: "course-schedule", status: "Accepted", lang: "python3", runtime: 78, memory: 19.4, date: daysAgo(28) },

    // Course Schedule II - 4 attempts
    { slug: "course-schedule-ii", status: "Wrong Answer", lang: "python3", runtime: 0, memory: 0, date: daysAgo(26, 6) },
    { slug: "course-schedule-ii", status: "Time Limit Exceeded", lang: "python3", runtime: 0, memory: 0, date: daysAgo(26, 3) },
    { slug: "course-schedule-ii", status: "Wrong Answer", lang: "python3", runtime: 0, memory: 0, date: daysAgo(26, 1) },
    { slug: "course-schedule-ii", status: "Accepted", lang: "python3", runtime: 85, memory: 19.8, date: daysAgo(26) },

    // Number of Islands - 2 attempts
    { slug: "number-of-islands", status: "Wrong Answer", lang: "python3", runtime: 0, memory: 0, date: daysAgo(24, 2) },
    { slug: "number-of-islands", status: "Accepted", lang: "python3", runtime: 220, memory: 24.1, date: daysAgo(24) },

    // Clone Graph - 3 attempts
    { slug: "clone-graph", status: "Time Limit Exceeded", lang: "cpp", runtime: 0, memory: 0, date: daysAgo(22, 3) },
    { slug: "clone-graph", status: "Wrong Answer", lang: "cpp", runtime: 0, memory: 0, date: daysAgo(22, 1) },
    { slug: "clone-graph", status: "Accepted", lang: "cpp", runtime: 7, memory: 11.2, date: daysAgo(22) },

    // Pacific Atlantic - 3 attempts
    { slug: "pacific-atlantic-water-flow", status: "Time Limit Exceeded", lang: "python3", runtime: 0, memory: 0, date: daysAgo(20, 2) },
    { slug: "pacific-atlantic-water-flow", status: "Wrong Answer", lang: "python3", runtime: 0, memory: 0, date: daysAgo(20, 1) },
    { slug: "pacific-atlantic-water-flow", status: "Accepted", lang: "python3", runtime: 240, memory: 20.1, date: daysAgo(20) }
  );

  // Group 5: Active & Maintained (Binary Search, Two Pointers, Trees - practiced within last 12 days)
  submissionRows.push(
    { slug: "validate-binary-search-tree", status: "Accepted", lang: "python3", runtime: 45, memory: 19.3, date: daysAgo(12) },
    { slug: "lowest-common-ancestor-of-a-binary-search-tree", status: "Accepted", lang: "python3", runtime: 60, memory: 21.0, date: daysAgo(11) },
    { slug: "search-in-rotated-sorted-array", status: "Accepted", lang: "python3", runtime: 38, memory: 16.7, date: daysAgo(9) },
    { slug: "find-minimum-in-rotated-sorted-array", status: "Accepted", lang: "python3", runtime: 42, memory: 16.9, date: daysAgo(8) },
    { slug: "koko-eating-bananas", status: "Accepted", lang: "python3", runtime: 180, memory: 17.8, date: daysAgo(6) },
    { slug: "3sum", status: "Accepted", lang: "python3", runtime: 550, memory: 20.5, date: daysAgo(4) },
    { slug: "container-with-most-water", status: "Accepted", lang: "python3", runtime: 490, memory: 29.1, date: daysAgo(3) },
    { slug: "trapping-rain-water", status: "Wrong Answer", lang: "python3", runtime: 0, memory: 0, date: daysAgo(2, 2) },
    { slug: "trapping-rain-water", status: "Accepted", lang: "python3", runtime: 115, memory: 18.5, date: daysAgo(2) }
  );

  // Insert all submissions
  let subIdCounter = 9000100;
  for (const s of submissionRows) {
    const problemId = problemMap.get(s.slug);
    if (!problemId) continue;

    await prisma.submission.create({
      data: {
        id: `demo-sub-${subIdCounter++}`,
        userId: user.id,
        problemId: problemId,
        status: s.status,
        language: s.lang,
        runtime: s.runtime,
        memory: s.memory,
        submittedAt: s.date,
      },
    });
  }

  // 4. Upsert SyncCheckpoint for demo
  await prisma.syncCheckpoint.upsert({
    where: { userId: user.id },
    update: {
      isInitialSyncComplete: true,
      totalSyncedCount: submissionRows.length,
      lastSyncedAt: new Date(),
      newestSubmissionTime: submissionRows[submissionRows.length - 1].date,
      oldestSubmissionTime: submissionRows[0].date,
      newestSubmissionId: `demo-sub-${subIdCounter - 1}`,
      oldestSubmissionId: `demo-sub-9000100`,
    },
    create: {
      userId: user.id,
      isInitialSyncComplete: true,
      totalSyncedCount: submissionRows.length,
      lastSyncedAt: new Date(),
      newestSubmissionTime: submissionRows[submissionRows.length - 1].date,
      oldestSubmissionTime: submissionRows[0].date,
      newestSubmissionId: `demo-sub-${subIdCounter - 1}`,
      oldestSubmissionId: `demo-sub-9000100`,
    },
  });

  console.log(`Successfully seeded ${submissionRows.length} submissions for user "demo"!`);
}

main()
  .catch((e) => {
    console.error("Error seeding demo user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

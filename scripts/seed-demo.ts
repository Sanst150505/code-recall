import "dotenv/config";
import { prisma } from "../lib/prisma";

interface SeedProblemDef {
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
}

const PROBLEMS: SeedProblemDef[] = [
  // 1. Two Pointers / Arrays / Recent Active
  { slug: "two-sum", title: "Two Sum", difficulty: "Easy", topics: ["Array", "Hash Table"] },
  { slug: "valid-palindrome", title: "Valid Palindrome", difficulty: "Easy", topics: ["Two Pointers", "String"] },
  { slug: "3sum", title: "3Sum", difficulty: "Medium", topics: ["Array", "Two Pointers"] },
  { slug: "container-with-most-water", title: "Container With Most Water", difficulty: "Medium", topics: ["Array", "Two Pointers"] },

  // 2. Binary Search (Recent & Active)
  { slug: "binary-search", title: "Binary Search", difficulty: "Easy", topics: ["Array", "Binary Search"] },
  { slug: "search-in-rotated-sorted-array", title: "Search in Rotated Sorted Array", difficulty: "Medium", topics: ["Array", "Binary Search"] },
  { slug: "find-minimum-in-rotated-sorted-array", title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", topics: ["Array", "Binary Search"] },
  { slug: "koko-eating-bananas", title: "Koko Eating Bananas", difficulty: "Medium", topics: ["Array", "Binary Search"] },

  // 3. Tree / Binary Tree (Recent & Maintained)
  { slug: "invert-binary-tree", title: "Invert Binary Tree", difficulty: "Easy", topics: ["Tree", "Binary Tree"] },
  { slug: "maximum-depth-of-binary-tree", title: "Maximum Depth of Binary Tree", difficulty: "Easy", topics: ["Tree", "Binary Tree"] },
  { slug: "validate-binary-search-tree", title: "Validate Binary Search Tree", difficulty: "Medium", topics: ["Tree", "Binary Tree"] },
  { slug: "lowest-common-ancestor-of-a-binary-search-tree", title: "Lowest Common Ancestor of a Binary Search Tree", difficulty: "Medium", topics: ["Tree", "Binary Tree"] },

  // 4. Critical Revision 1: Dynamic Programming (105-130 days ago, 0 recent)
  { slug: "climbing-stairs", title: "Climbing Stairs", difficulty: "Easy", topics: ["Dynamic Programming", "Math"] },
  { slug: "coin-change", title: "Coin Change", difficulty: "Medium", topics: ["Dynamic Programming"] },
  { slug: "longest-increasing-subsequence", title: "Longest Increasing Subsequence", difficulty: "Medium", topics: ["Dynamic Programming"] },
  { slug: "house-robber", title: "House Robber", difficulty: "Medium", topics: ["Dynamic Programming"] },
  { slug: "word-break", title: "Word Break", difficulty: "Medium", topics: ["Dynamic Programming", "String"] },
  { slug: "maximum-subarray", title: "Maximum Subarray", difficulty: "Medium", topics: ["Dynamic Programming"] },
  { slug: "best-time-to-buy-and-sell-stock", title: "Best Time to Buy and Sell Stock", difficulty: "Easy", topics: ["Dynamic Programming"] },

  // 5. Critical Revision 2: Backtracking (98-115 days ago, 0 recent)
  { slug: "subsets", title: "Subsets", difficulty: "Medium", topics: ["Backtracking"] },
  { slug: "subsets-ii", title: "Subsets II", difficulty: "Medium", topics: ["Backtracking"] },
  { slug: "permutations", title: "Permutations", difficulty: "Medium", topics: ["Backtracking"] },
  { slug: "combination-sum", title: "Combination Sum", difficulty: "Medium", topics: ["Backtracking"] },
  { slug: "word-search", title: "Word Search", difficulty: "Medium", topics: ["Backtracking", "Matrix"] },
  { slug: "letter-combinations-of-a-phone-number", title: "Letter Combinations of a Phone Number", difficulty: "Medium", topics: ["Backtracking"] },

  // 6. Critical Revision 3: Sliding Window (95-108 days ago, 0 recent)
  { slug: "longest-substring-without-repeating-characters", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", topics: ["Sliding Window"] },
  { slug: "longest-repeating-character-replacement", title: "Longest Repeating Character Replacement", difficulty: "Medium", topics: ["Sliding Window"] },
  { slug: "minimum-window-substring", title: "Minimum Window Substring", difficulty: "Hard", topics: ["Sliding Window"] },
  { slug: "permutation-in-string", title: "Permutation in String", difficulty: "Medium", topics: ["Sliding Window"] },
  { slug: "sliding-window-maximum", title: "Sliding Window Maximum", difficulty: "Hard", topics: ["Sliding Window", "Monotonic Queue"] },

  // 7. Critical Revision 4: Heap (Priority Queue) (93-104 days ago, 0 recent)
  { slug: "kth-largest-element-in-an-array", title: "Kth Largest Element in an Array", difficulty: "Medium", topics: ["Heap (Priority Queue)"] },
  { slug: "top-k-frequent-elements", title: "Top K Frequent Elements", difficulty: "Medium", topics: ["Heap (Priority Queue)"] },
  { slug: "k-closest-points-to-origin", title: "K Closest Points to Origin", difficulty: "Medium", topics: ["Heap (Priority Queue)"] },
  { slug: "find-median-from-data-stream", title: "Find Median from Data Stream", difficulty: "Hard", topics: ["Heap (Priority Queue)"] },
  { slug: "task-scheduler", title: "Task Scheduler", difficulty: "Medium", topics: ["Heap (Priority Queue)", "Greedy"] },

  // 8. Critical Revision 5: Monotonic Stack (92-100 days ago, 0 recent)
  { slug: "daily-temperatures", title: "Daily Temperatures", difficulty: "Medium", topics: ["Monotonic Stack"] },
  { slug: "online-stock-span", title: "Online Stock Span", difficulty: "Medium", topics: ["Monotonic Stack"] },
  { slug: "next-greater-element-i", title: "Next Greater Element I", difficulty: "Easy", topics: ["Monotonic Stack"] },
  { slug: "next-greater-element-ii", title: "Next Greater Element II", difficulty: "Medium", topics: ["Monotonic Stack"] },
  { slug: "largest-rectangle-in-histogram", title: "Largest Rectangle in Histogram", difficulty: "Hard", topics: ["Monotonic Stack"] },

  // 9. High Friction: Graph / Topological Sort (20-30 days ago, high struggle ratio)
  { slug: "course-schedule", title: "Course Schedule", difficulty: "Medium", topics: ["Graph", "Topological Sort"] },
  { slug: "course-schedule-ii", title: "Course Schedule II", difficulty: "Medium", topics: ["Graph", "Topological Sort"] },
  { slug: "number-of-islands", title: "Number of Islands", difficulty: "Medium", topics: ["Graph"] },
  { slug: "clone-graph", title: "Clone Graph", difficulty: "Medium", topics: ["Graph"] },
  { slug: "pacific-atlantic-water-flow", title: "Pacific Atlantic Water Flow", difficulty: "Medium", topics: ["Graph"] },

  // 10. Low Exposure Deficits (1-2 solved problems all-time)
  { slug: "implement-trie-prefix-tree", title: "Implement Trie (Prefix Tree)", difficulty: "Medium", topics: ["Trie"] },
  { slug: "single-number", title: "Single Number", difficulty: "Easy", topics: ["Bit Manipulation"] },
  { slug: "number-of-1-bits", title: "Number of 1 Bits", difficulty: "Easy", topics: ["Bit Manipulation"] },
  { slug: "lru-cache", title: "LRU Cache", difficulty: "Medium", topics: ["Doubly-Linked List"] },
];

async function main() {
  console.log("Seeding demo user with extended revision categories...");

  // 1. Upsert User "demo"
  const user = await prisma.user.upsert({
    where: { username: "demo" },
    update: { lastSyncedAt: new Date() },
    create: {
      username: "demo",
      lastSyncedAt: new Date(),
    },
  });

  // 2. Clean up existing submissions for demo
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
    return new Date(now.getTime() - d * 24 * 60 * 60 * 1000 - hoursOffset * 60 * 60 * 1000);
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

  // Group 0: Foundations (200-270 days ago) for timeline depth
  submissionRows.push(
    { slug: "two-sum", status: "Accepted", lang: "python3", runtime: 48, memory: 17.2, date: daysAgo(270) },
    { slug: "valid-palindrome", status: "Accepted", lang: "python3", runtime: 35, memory: 16.8, date: daysAgo(255) },
    { slug: "maximum-depth-of-binary-tree", status: "Accepted", lang: "cpp", runtime: 4, memory: 18.9, date: daysAgo(240) },
    { slug: "invert-binary-tree", status: "Accepted", lang: "cpp", runtime: 3, memory: 10.1, date: daysAgo(220) },
    { slug: "binary-search", status: "Accepted", lang: "python3", runtime: 195, memory: 18.1, date: daysAgo(200) }
  );

  // Group 1: Critical Revision - Dynamic Programming (105-125 days ago)
  submissionRows.push(
    { slug: "climbing-stairs", status: "Accepted", lang: "python3", runtime: 31, memory: 16.4, date: daysAgo(125) },
    { slug: "coin-change", status: "Wrong Answer", lang: "python3", runtime: 0, memory: 0, date: daysAgo(120, 2) },
    { slug: "coin-change", status: "Accepted", lang: "python3", runtime: 852, memory: 17.1, date: daysAgo(120) },
    { slug: "longest-increasing-subsequence", status: "Accepted", lang: "python3", runtime: 120, memory: 16.9, date: daysAgo(118) },
    { slug: "house-robber", status: "Accepted", lang: "python3", runtime: 38, memory: 16.5, date: daysAgo(115) },
    { slug: "word-break", status: "Accepted", lang: "cpp", runtime: 8, memory: 12.3, date: daysAgo(112) },
    { slug: "maximum-subarray", status: "Accepted", lang: "python3", runtime: 54, memory: 31.2, date: daysAgo(108) },
    { slug: "best-time-to-buy-and-sell-stock", status: "Accepted", lang: "python3", runtime: 620, memory: 27.5, date: daysAgo(105) }
  );

  // Group 2: Critical Revision - Backtracking (98-115 days ago)
  submissionRows.push(
    { slug: "subsets", status: "Accepted", lang: "python3", runtime: 35, memory: 16.5, date: daysAgo(115) },
    { slug: "subsets-ii", status: "Accepted", lang: "python3", runtime: 38, memory: 16.7, date: daysAgo(112) },
    { slug: "permutations", status: "Accepted", lang: "python3", runtime: 40, memory: 16.8, date: daysAgo(109) },
    { slug: "combination-sum", status: "Accepted", lang: "python3", runtime: 52, memory: 17.0, date: daysAgo(105) },
    { slug: "word-search", status: "Wrong Answer", lang: "python3", runtime: 0, memory: 0, date: daysAgo(100, 2) },
    { slug: "word-search", status: "Accepted", lang: "python3", runtime: 210, memory: 17.5, date: daysAgo(100) },
    { slug: "letter-combinations-of-a-phone-number", status: "Accepted", lang: "python3", runtime: 32, memory: 16.4, date: daysAgo(98) }
  );

  // Group 3: Critical Revision - Sliding Window (95-108 days ago)
  submissionRows.push(
    { slug: "longest-substring-without-repeating-characters", status: "Accepted", lang: "python3", runtime: 48, memory: 17.1, date: daysAgo(108) },
    { slug: "longest-repeating-character-replacement", status: "Accepted", lang: "python3", runtime: 95, memory: 17.3, date: daysAgo(104) },
    { slug: "permutation-in-string", status: "Accepted", lang: "python3", runtime: 65, memory: 17.0, date: daysAgo(101) },
    { slug: "minimum-window-substring", status: "Time Limit Exceeded", lang: "cpp", runtime: 0, memory: 0, date: daysAgo(97, 3) },
    { slug: "minimum-window-substring", status: "Accepted", lang: "cpp", runtime: 12, memory: 10.5, date: daysAgo(97) },
    { slug: "sliding-window-maximum", status: "Accepted", lang: "cpp", runtime: 185, memory: 134.2, date: daysAgo(95) }
  );

  // Group 4: Critical Revision - Heap (Priority Queue) (93-104 days ago)
  submissionRows.push(
    { slug: "kth-largest-element-in-an-array", status: "Accepted", lang: "python3", runtime: 620, memory: 30.1, date: daysAgo(104) },
    { slug: "top-k-frequent-elements", status: "Accepted", lang: "python3", runtime: 88, memory: 21.4, date: daysAgo(100) },
    { slug: "k-closest-points-to-origin", status: "Accepted", lang: "python3", runtime: 540, memory: 23.2, date: daysAgo(97) },
    { slug: "find-median-from-data-stream", status: "Accepted", lang: "cpp", runtime: 180, memory: 120.4, date: daysAgo(94) },
    { slug: "task-scheduler", status: "Accepted", lang: "python3", runtime: 410, memory: 18.2, date: daysAgo(93) }
  );

  // Group 5: Critical Revision - Monotonic Stack (92-100 days ago)
  submissionRows.push(
    { slug: "daily-temperatures", status: "Accepted", lang: "python3", runtime: 780, memory: 31.4, date: daysAgo(100) },
    { slug: "online-stock-span", status: "Accepted", lang: "python3", runtime: 290, memory: 22.1, date: daysAgo(98) },
    { slug: "next-greater-element-i", status: "Accepted", lang: "python3", runtime: 45, memory: 16.9, date: daysAgo(95) },
    { slug: "next-greater-element-ii", status: "Accepted", lang: "python3", runtime: 185, memory: 18.2, date: daysAgo(93) },
    { slug: "largest-rectangle-in-histogram", status: "Accepted", lang: "cpp", runtime: 98, memory: 76.5, date: daysAgo(92) }
  );

  // Group 6: High Friction - Graph (20-28 days ago, multiple failed submissions)
  submissionRows.push(
    { slug: "course-schedule", status: "Time Limit Exceeded", lang: "python3", runtime: 0, memory: 0, date: daysAgo(28, 4) },
    { slug: "course-schedule", status: "Wrong Answer", lang: "python3", runtime: 0, memory: 0, date: daysAgo(28, 2) },
    { slug: "course-schedule", status: "Accepted", lang: "python3", runtime: 78, memory: 19.4, date: daysAgo(28) },

    { slug: "course-schedule-ii", status: "Wrong Answer", lang: "python3", runtime: 0, memory: 0, date: daysAgo(26, 6) },
    { slug: "course-schedule-ii", status: "Time Limit Exceeded", lang: "python3", runtime: 0, memory: 0, date: daysAgo(26, 3) },
    { slug: "course-schedule-ii", status: "Wrong Answer", lang: "python3", runtime: 0, memory: 0, date: daysAgo(26, 1) },
    { slug: "course-schedule-ii", status: "Accepted", lang: "python3", runtime: 85, memory: 19.8, date: daysAgo(26) },

    { slug: "number-of-islands", status: "Wrong Answer", lang: "python3", runtime: 0, memory: 0, date: daysAgo(24, 2) },
    { slug: "number-of-islands", status: "Accepted", lang: "python3", runtime: 220, memory: 24.1, date: daysAgo(24) },

    { slug: "clone-graph", status: "Time Limit Exceeded", lang: "cpp", runtime: 0, memory: 0, date: daysAgo(22, 3) },
    { slug: "clone-graph", status: "Wrong Answer", lang: "cpp", runtime: 0, memory: 0, date: daysAgo(22, 1) },
    { slug: "clone-graph", status: "Accepted", lang: "cpp", runtime: 7, memory: 11.2, date: daysAgo(22) },

    { slug: "pacific-atlantic-water-flow", status: "Time Limit Exceeded", lang: "python3", runtime: 0, memory: 0, date: daysAgo(20, 2) },
    { slug: "pacific-atlantic-water-flow", status: "Wrong Answer", lang: "python3", runtime: 0, memory: 0, date: daysAgo(20, 1) },
    { slug: "pacific-atlantic-water-flow", status: "Accepted", lang: "python3", runtime: 240, memory: 20.1, date: daysAgo(20) }
  );

  // Group 7: Low Exposure Deficits (45-65 days ago, 1-2 solved)
  submissionRows.push(
    { slug: "implement-trie-prefix-tree", status: "Accepted", lang: "cpp", runtime: 42, memory: 45.1, date: daysAgo(65) },
    { slug: "single-number", status: "Accepted", lang: "python3", runtime: 110, memory: 18.5, date: daysAgo(60) },
    { slug: "number-of-1-bits", status: "Accepted", lang: "python3", runtime: 35, memory: 16.2, date: daysAgo(50) },
    { slug: "lru-cache", status: "Wrong Answer", lang: "cpp", runtime: 0, memory: 0, date: daysAgo(45, 2) },
    { slug: "lru-cache", status: "Accepted", lang: "cpp", runtime: 58, memory: 168.4, date: daysAgo(45) }
  );

  // Group 8: Active & Maintained (Binary Search, Two Pointers, Trees - practiced 2-12 days ago)
  submissionRows.push(
    { slug: "validate-binary-search-tree", status: "Accepted", lang: "python3", runtime: 45, memory: 19.3, date: daysAgo(12) },
    { slug: "lowest-common-ancestor-of-a-binary-search-tree", status: "Accepted", lang: "python3", runtime: 60, memory: 21.0, date: daysAgo(11) },
    { slug: "search-in-rotated-sorted-array", status: "Accepted", lang: "python3", runtime: 38, memory: 16.7, date: daysAgo(9) },
    { slug: "find-minimum-in-rotated-sorted-array", status: "Accepted", lang: "python3", runtime: 42, memory: 16.9, date: daysAgo(8) },
    { slug: "koko-eating-bananas", status: "Accepted", lang: "python3", runtime: 180, memory: 17.8, date: daysAgo(6) },
    { slug: "3sum", status: "Accepted", lang: "python3", runtime: 550, memory: 20.5, date: daysAgo(4) },
    { slug: "container-with-most-water", status: "Accepted", lang: "python3", runtime: 490, memory: 29.1, date: daysAgo(3) }
  );

  // Sort submissions chronologically for proper checkpoint times
  submissionRows.sort((a, b) => a.date.getTime() - b.date.getTime());

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

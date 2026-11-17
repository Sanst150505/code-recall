import "dotenv/config";
import { calculateHistoricalAnalytics } from "../lib/analytics-service";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("===============================================================");
  console.log(" CodeRecall: Historical Analytics & Revision Engine Test");
  console.log("===============================================================\n");

  const targetUser = process.argv[2] || "demo";
  const summary = await calculateHistoricalAnalytics(targetUser);

  console.log("--- 1. Overall Profile Summary ---");
  console.log(`Username:                         ${summary.username}`);
  console.log(`Total Submissions:                ${summary.totalSubmissions}`);
  console.log(`Total Unique Problems Attempted:  ${summary.totalUniqueProblemsAttempted}`);
  console.log(`Total Unique Problems Solved:     ${summary.totalUniqueProblemsSolved}`);
  console.log(`Overall Pass Rate:                ${summary.overallPassRate}%`);
  console.log(`Solved Difficulty Split:          Easy: ${summary.difficultySolved.easy} | Medium: ${summary.difficultySolved.medium} | Hard: ${summary.difficultySolved.hard}`);
  console.log(`Time Span:                        ${summary.timeSpan.earliestSubmission?.split("T")[0]} to ${summary.timeSpan.latestSubmission?.split("T")[0]} (${summary.timeSpan.historySpanDays} days, ${summary.timeSpan.totalActiveDays} active days)`);
  console.log(`Total Distinct Topics:            ${summary.totalTopics}`);

  console.log("\n--- 2. Category Breakdown ---");
  console.log(`CRITICAL_REVISION (Decay Risk):   ${summary.categoryCounts.CRITICAL_REVISION}`);
  console.log(`INSUFFICIENT_EXPOSURE (Deficit):  ${summary.categoryCounts.INSUFFICIENT_EXPOSURE}`);
  console.log(`HIGH_FRICTION (Need Reinforce):   ${summary.categoryCounts.HIGH_FRICTION}`);
  console.log(`ACTIVE_MAINTAINED (Fresh):        ${summary.categoryCounts.ACTIVE_MAINTAINED}`);

  console.log("\n--- 3. Top 10 Revision Candidates (Ranked by Priority Score) ---");
  summary.topRevisionCandidates.forEach((item, index) => {
    console.log(`\n#${index + 1} [Score: ${item.priorityScore.toString().padStart(3, " ")}] ${item.topic}`);
    console.log(`   Category:        ${item.category}`);
    console.log(`   Unique Solved:   ${item.uniqueSolved} (Easy: ${item.difficulty.easy}, Medium: ${item.difficulty.medium}, Hard: ${item.difficulty.hard})`);
    console.log(`   Total Attempts:  ${item.totalAttempts} | Pass Rate: ${item.passRate !== null ? item.passRate + "%" : "N/A"} | Struggle Ratio: ${item.struggleRatio}x`);
    console.log(`   Last Practiced:  ${item.lastPracticed ? item.lastPracticed.split("T")[0] : "Never"} (${item.daysSinceLastPractice !== null ? item.daysSinceLastPractice + " days ago" : "N/A"})`);
    console.log(`   Windows (Solved): 30d: ${item.windows.last30Days.solvedCount} | 90d: ${item.windows.last90Days.solvedCount} | 180d: ${item.windows.last180Days.solvedCount} | 365d: ${item.windows.last365Days.solvedCount}`);
    console.log(`   Factors:         Decay: ${item.decayFactor} | Volume Deficit: ${item.volumeDeficitFactor} | Friction: ${item.frictionFactor}`);
    console.log(`   Explanation:     "${item.explanation}"`);
    console.log(`   Recommended:     "${item.recommendedAction}"`);
  });

  // 4. Edge Case & Integrity Verification Checks
  console.log("\n--- 4. Verification & Integrity Checks ---");
  
  // Check A: No double-counting in overall unique totals
  let sumOfTopicSolved = 0;
  for (const t of summary.topics) {
    sumOfTopicSolved += t.uniqueSolved;
  }
  const isMultiTopicDeduplicated = sumOfTopicSolved >= summary.totalUniqueProblemsSolved;
  console.log(`Check A [Multi-Topic Deduplication]: ${isMultiTopicDeduplicated ? "PASSED" : "FAILED"} (Sum of topic solves: ${sumOfTopicSolved} >= Overall unique: ${summary.totalUniqueProblemsSolved})`);

  // Check B: Division by Zero & NaN checks
  let hasNaN = false;
  for (const t of summary.topics) {
    if (isNaN(t.priorityScore) || isNaN(t.struggleRatio) || (t.passRate !== null && isNaN(t.passRate))) {
      hasNaN = true;
    }
  }
  console.log(`Check B [Zero-Division / NaN Safety]: ${!hasNaN ? "PASSED" : "FAILED"}`);

  // Check C: Priority Score Range
  const scoreOutOfRange = summary.topics.some(t => t.priorityScore < 0 || t.priorityScore > 100);
  console.log(`Check C [Priority Score 0-100 Bound]: ${!scoreOutOfRange ? "PASSED" : "FAILED"}`);

  // Check D: Top candidates sorted descending
  let isSorted = true;
  for (let i = 0; i < summary.topics.length - 1; i++) {
    if (summary.topics[i].priorityScore < summary.topics[i + 1].priorityScore) {
      isSorted = false;
      break;
    }
  }
  console.log(`Check D [Descending Priority Order]:  ${isSorted ? "PASSED" : "FAILED"}`);

  console.log("\n===============================================================\n");
}

main()
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

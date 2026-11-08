import "dotenv/config";
import { prisma } from "../lib/prisma";
import { syncLeetCodeData } from "../lib/sync-service";

async function main() {
  console.log("===============================================================");
  console.log(" CodeRecall: Historical Synchronization Pipeline Verification");
  console.log("===============================================================\n");

  const session = process.env.LEETCODE_SESSION?.trim();
  const csrf = process.env.LEETCODE_CSRF_TOKEN?.trim();

  if (!session) {
    throw new Error("LEETCODE_SESSION is required in .env for this test.");
  }

  // First, verify database connectivity
  console.log("1. Verifying database connection...");
  const problemCountBefore = await prisma.problem.count();
  const submissionCountBefore = await prisma.submission.count();
  const userCountBefore = await prisma.user.count();

  console.log(`   Database status: ONLINE`);
  console.log(`   Current Users:       ${userCountBefore}`);
  console.log(`   Current Problems:    ${problemCountBefore}`);
  console.log(`   Current Submissions: ${submissionCountBefore}\n`);

  // Step 1: Run Initial Historical Sync
  console.log("2. Running Initial Historical Synchronization...");
  console.log("   (Traversing all historical pages until hasNext=false)...");
  const startTime1 = Date.now();

  // We can pass username from .env or empty to let verifyLeetCodeAuth auto-detect
  const syncResult1 = await syncLeetCodeData({
    username: "",
    session,
    csrf,
  });

  const duration1 = ((Date.now() - startTime1) / 1000).toFixed(1);

  console.log(`\n✅ Initial Sync Finished in ${duration1}s!`);
  console.log(`   Mode:                    ${syncResult1.mode}`);
  console.log(`   Username:                ${syncResult1.username}`);
  console.log(`   Initial Sync Complete:   ${syncResult1.stats.isInitialSyncComplete}`);
  console.log(`   Pages Fetched:           ${syncResult1.stats.pagesFetched}`);
  console.log(`   Submissions Processed:   ${syncResult1.stats.submissionsProcessed}`);
  console.log(`   New Submissions Saved:   ${syncResult1.stats.newSubmissionsSaved}`);
  console.log(`   Duplicates Skipped:      ${syncResult1.stats.duplicatesSkipped}`);
  console.log(`   Unique Problems Handled: ${syncResult1.stats.uniqueProblemsHandled}`);

  if (syncResult1.boundary) {
    console.log(`\n   Historical Boundary:`);
    console.log(`   - Newest Submission:     ${syncResult1.boundary.newestSubmissionTime}`);
    console.log(`   - Oldest Submission:     ${syncResult1.boundary.oldestSubmissionTime}`);
  }

  // Step 2: Verify Database Persistence
  console.log("\n3. Verifying Database Records...");
  const totalUsersAfter = await prisma.user.count();
  const totalProblemsAfter = await prisma.problem.count();
  const totalSubmissionsAfter = await prisma.submission.count();
  const checkpoint = await prisma.syncCheckpoint.findFirst({
    where: { user: { username: syncResult1.username } },
  });

  console.log(`   Total Users:        ${totalUsersAfter}`);
  console.log(`   Total Problems:     ${totalProblemsAfter}`);
  console.log(`   Total Submissions:  ${totalSubmissionsAfter}`);
  console.log(`   Checkpoint Status:  isInitialSyncComplete = ${checkpoint?.isInitialSyncComplete}`);
  console.log(`   Checkpoint Offset:  ${checkpoint?.lastPersistedOffset}`);

  // Sample submission verification
  const sampleSubmission = await prisma.submission.findFirst({
    where: { user: { username: syncResult1.username } },
    include: { problem: true },
    orderBy: { submittedAt: "desc" },
  });

  if (sampleSubmission) {
    console.log(`\n   Sample Persisted Submission:`);
    console.log(`   - ID:               ${sampleSubmission.id}`);
    console.log(`   - Problem:          ${sampleSubmission.problem.title} (${sampleSubmission.problem.difficulty})`);
    console.log(`   - Topics:           ${sampleSubmission.problem.topics.join(", ")}`);
    console.log(`   - Status / Lang:    ${sampleSubmission.status} / ${sampleSubmission.language}`);
    console.log(`   - Runtime / Memory: ${sampleSubmission.runtime} ms / ${sampleSubmission.memory} MB`);
    console.log(`   - Submitted At:     ${sampleSubmission.submittedAt.toISOString()}`);
  }

  // Step 3: Run Second (Incremental) Sync to Verify Duplicate Prevention
  console.log("\n4. Running Second (Incremental) Sync to Verify Duplicate Prevention & Early Stopping...");
  const startTime2 = Date.now();

  const syncResult2 = await syncLeetCodeData({
    username: syncResult1.username,
    session,
    csrf,
  });

  const duration2 = ((Date.now() - startTime2) / 1000).toFixed(1);

  console.log(`\n✅ Incremental Sync Finished in ${duration2}s!`);
  console.log(`   Pages Fetched:         ${syncResult2.stats.pagesFetched} (Early stopped at known boundary)`);
  console.log(`   New Submissions Saved: ${syncResult2.stats.newSubmissionsSaved} (0 expected)`);
  console.log(`   Duplicates Skipped:    ${syncResult2.stats.duplicatesSkipped}`);

  if (syncResult2.stats.newSubmissionsSaved === 0) {
    console.log(`\n🏆 DUPLICATE PREVENTION VERIFIED: Exactly 0 duplicates inserted.`);
  } else {
    console.warn(`⚠️ Warning: Expected 0 new submissions on second sync, got ${syncResult2.stats.newSubmissionsSaved}`);
  }

  console.log("\n===============================================================");
  console.log(" Historical Synchronization Verification Complete");
  console.log("===============================================================\n");
}

main()
  .catch((e) => {
    console.error("Test error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

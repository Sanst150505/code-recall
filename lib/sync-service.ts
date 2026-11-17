import { prisma } from "@/lib/prisma";
import {
  verifyLeetCodeAuth,
  getAuthenticatedSubmissions,
  getRecentSubmissions,
  getProblemDetails,
  AuthenticatedSubmissionItem,
} from "@/lib/leetcode";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface SyncOptions {
  username: string;
  session?: string;
  csrf?: string;
  forceFullSync?: boolean;
}

export interface SyncResult {
  success: boolean;
  mode: "authenticated_historical" | "public_recent";
  username: string;
  stats: {
    isInitialSyncComplete: boolean;
    pagesFetched: number;
    submissionsProcessed: number;
    newSubmissionsSaved: number;
    duplicatesSkipped: number;
    uniqueProblemsHandled: number;
  };
  boundary?: {
    newestSubmissionTime: string | null;
    oldestSubmissionTime: string | null;
    newestSubmissionId: string | null;
    oldestSubmissionId: string | null;
  };
  timestamp: string;
}

/**
 * Normalizes runtime string (e.g. "45 ms", "12 ms", "N/A") to an integer in milliseconds.
 */
function parseRuntime(runtimeStr: string | null | undefined): number | null {
  if (!runtimeStr || runtimeStr === "N/A") return null;
  const match = runtimeStr.replace(/[^0-9]/g, "");
  const val = parseInt(match, 10);
  return isNaN(val) ? null : val;
}

/**
 * Normalizes memory string (e.g. "16.4 MB", "42.1 MB", "N/A") to a float in megabytes.
 */
function parseMemory(memoryStr: string | null | undefined): number | null {
  if (!memoryStr || memoryStr === "N/A") return null;
  const match = memoryStr.replace(/[^0-9.]/g, "");
  const val = parseFloat(match);
  return isNaN(val) ? null : val;
}

/**
 * Normalizes 10-digit Unix epoch seconds into a valid JavaScript Date.
 */
function parseTimestamp(timestampStr: string | number): Date {
  const sec = Number(timestampStr);
  if (isNaN(sec) || sec <= 0) {
    throw new Error(`Invalid submission timestamp: ${timestampStr}`);
  }
  return new Date(sec * 1000);
}

/**
 * Ensures all distinct problems from the given submissions exist in PostgreSQL.
 * Uses local database caching first, and only queries LeetCode for newly discovered slugs.
 */
async function ensureProblemsExist(
  submissions: Array<{ titleSlug: string; title: string; statusDisplay: string; timestamp: string }>
): Promise<Map<string, number>> {
  const distinctSlugs = Array.from(new Set(submissions.map((s) => s.titleSlug)));
  const slugToIdMap = new Map<string, number>();

  if (distinctSlugs.length === 0) {
    return slugToIdMap;
  }

  // 1. Check existing problems in local database
  const existingInDb = await prisma.problem.findMany({
    where: { slug: { in: distinctSlugs } },
    select: { id: true, slug: true },
  });

  for (const prob of existingInDb) {
    slugToIdMap.set(prob.slug, prob.id);
  }

  // 2. Slugs that do not yet exist in PostgreSQL
  const missingSlugs = distinctSlugs.filter((s) => !slugToIdMap.has(s));

  if (missingSlugs.length > 0) {
    // Fetch problem details in small batches of 5 to avoid rate-limiting
    for (let i = 0; i < missingSlugs.length; i += 5) {
      const batch = missingSlugs.slice(i, i + 5);

      await Promise.all(
        batch.map(async (slug) => {
          try {
            const details = await getProblemDetails(slug);
            const subForProblem = submissions.find((s) => s.titleSlug === slug);
            const isAccepted = subForProblem?.statusDisplay === "Accepted";
            const initialSolvedAt = isAccepted && subForProblem
              ? parseTimestamp(subForProblem.timestamp)
              : null;

            const saved = await prisma.problem.upsert({
              where: { slug },
              update: {
                title: details.title,
                difficulty: details.difficulty,
                topics: details.topicTags.map((t) => t.name),
              },
              create: {
                slug,
                title: details.title,
                difficulty: details.difficulty,
                topics: details.topicTags.map((t) => t.name),
                solvedAt: initialSolvedAt,
              },
            });

            slugToIdMap.set(slug, saved.id);
          } catch (err) {
            console.error(`Warning: Failed to fetch problem details for "${slug}":`, err instanceof Error ? err.message : err);
            // Fallback problem record to prevent submission foreign key failure
            const subForProblem = submissions.find((s) => s.titleSlug === slug);
            const saved = await prisma.problem.upsert({
              where: { slug },
              update: {},
              create: {
                slug,
                title: subForProblem?.title || slug,
                difficulty: "Unknown",
                topics: [],
                solvedAt: null,
              },
            });
            slugToIdMap.set(slug, saved.id);
          }
        })
      );

      if (i + 5 < missingSlugs.length) {
        await delay(200);
      }
    }
  }

  return slugToIdMap;
}

/**
 * Main synchronization dispatcher.
 */
export async function syncLeetCodeData(options: SyncOptions): Promise<SyncResult> {
  const { username, session, csrf, forceFullSync } = options;

  if (session && session.trim().length > 0) {
    return syncAuthenticatedUser(username, session.trim(), csrf?.trim(), forceFullSync);
  }

  return syncPublicUser(username);
}

/**
 * Authenticated historical synchronization engine with fault-tolerant checkpointing.
 */
async function syncAuthenticatedUser(
  targetUsername: string,
  session: string,
  csrf: string | undefined,
  forceFullSync?: boolean
): Promise<SyncResult> {
  // 1. Verify authentication status
  const auth = await verifyLeetCodeAuth(session, csrf);
  if (!auth.isSignedIn) {
    throw new Error("Authentication failed: LEETCODE_SESSION is expired or invalid.");
  }

  // 2. Strict identity verification
  if (targetUsername && auth.username.toLowerCase() !== targetUsername.toLowerCase()) {
    throw new Error(
      `Identity mismatch: Authenticated session belongs to "${auth.username}", but sync was requested for "${targetUsername}". Cross-account synchronization rejected.`
    );
  }

  const verifiedUsername = auth.username;

  // 3. User lookup or creation
  const user = await prisma.user.upsert({
    where: { username: verifiedUsername },
    update: {},
    create: { username: verifiedUsername },
    include: { syncCheckpoint: true },
  });

  // 4. Retrieve or initialize SyncCheckpoint
  let checkpoint = user.syncCheckpoint;
  if (!checkpoint) {
    checkpoint = await prisma.syncCheckpoint.create({
      data: {
        userId: user.id,
        isInitialSyncComplete: false,
      },
    });
  }

  const isResumingOrInitial = !checkpoint.isInitialSyncComplete || Boolean(forceFullSync);

  let pagesFetched = 0;
  let totalProcessed = 0;
  let totalNewSaved = 0;
  let totalDuplicatesSkipped = 0;
  const uniqueProblemSlugs = new Set<string>();

  const PAGE_SIZE = 20;
  let offset = 0;

  if (isResumingOrInitial) {
    // Resuming incomplete sync or initial sync:
    // If resuming, start with a 1-page overlap for boundary safety
    if (checkpoint.lastPersistedOffset > 0 && !forceFullSync) {
      offset = Math.max(0, checkpoint.lastPersistedOffset - PAGE_SIZE);
    } else {
      offset = 0;
    }

    let hasNext = true;

    while (hasNext) {
      const page = await getAuthenticatedSubmissions(session, csrf, offset, PAGE_SIZE);
      pagesFetched++;
      const submissions = page.submissions;

      if (submissions.length === 0) {
        break;
      }

      totalProcessed += submissions.length;
      submissions.forEach((s) => uniqueProblemSlugs.add(s.titleSlug));

      // Ensure problem catalog entries exist
      const slugToIdMap = await ensureProblemsExist(submissions);

      // Check existing submission IDs in database
      const batchIds = submissions.map((s) => s.id);
      const existingSubmissions = await prisma.submission.findMany({
        where: { id: { in: batchIds } },
        select: { id: true },
      });
      const existingIdSet = new Set(existingSubmissions.map((s) => s.id));

      const newRecordsToInsert = submissions
        .filter((sub) => !existingIdSet.has(sub.id))
        .map((sub) => {
          const problemId = slugToIdMap.get(sub.titleSlug);
          if (!problemId) {
            throw new Error(`Integrity error: Problem ID missing for slug "${sub.titleSlug}"`);
          }

          return {
            id: sub.id,
            userId: user.id,
            problemId,
            status: sub.statusDisplay,
            language: sub.lang || null,
            runtime: parseRuntime(sub.runtime),
            memory: parseMemory(sub.memory),
            submittedAt: parseTimestamp(sub.timestamp),
          };
        });

      if (newRecordsToInsert.length > 0) {
        const insertRes = await prisma.submission.createMany({
          data: newRecordsToInsert,
          skipDuplicates: true,
        });
        totalNewSaved += insertRes.count;
      }

      totalDuplicatesSkipped += (submissions.length - newRecordsToInsert.length);

      // Identify boundary dates on this page
      const pageTimestamps = submissions.map((s) => parseTimestamp(s.timestamp));
      const pageNewestTime = new Date(Math.max(...pageTimestamps.map((d) => d.getTime())));
      const pageOldestTime = new Date(Math.min(...pageTimestamps.map((d) => d.getTime())));
      const pageNewestItem = submissions[0];
      const pageOldestItem = submissions[submissions.length - 1];

      // Atomic checkpoint update after successful persistence
      const currentNewestTime: Date | null = checkpoint.newestSubmissionTime;
      const updatedNewestTime: Date = currentNewestTime && currentNewestTime > pageNewestTime ? currentNewestTime : pageNewestTime;
      const updatedNewestId: string = currentNewestTime && currentNewestTime > pageNewestTime ? (checkpoint.newestSubmissionId || pageNewestItem.id) : pageNewestItem.id;

      const currentOldestTime: Date | null = checkpoint.oldestSubmissionTime;
      const updatedOldestTime: Date = currentOldestTime && currentOldestTime < pageOldestTime ? currentOldestTime : pageOldestTime;
      const updatedOldestId: string = currentOldestTime && currentOldestTime < pageOldestTime ? (checkpoint.oldestSubmissionId || pageOldestItem.id) : pageOldestItem.id;

      hasNext = page.hasNext;
      const reachedEnd = !hasNext;

      checkpoint = await prisma.syncCheckpoint.update({
        where: { userId: user.id },
        data: {
          lastPersistedOffset: offset + submissions.length,
          totalSyncedCount: { increment: newRecordsToInsert.length },
          newestSubmissionId: updatedNewestId,
          newestSubmissionTime: updatedNewestTime,
          oldestSubmissionId: updatedOldestId,
          oldestSubmissionTime: updatedOldestTime,
          isInitialSyncComplete: reachedEnd,
          lastSyncedAt: reachedEnd ? new Date() : checkpoint.lastSyncedAt,
        },
      });

      offset += PAGE_SIZE;

      if (hasNext) {
        await delay(350); // Politeness throttling
      }
    }
  } else {
    // Incremental Sync:
    // Initial sync is already complete. Scan downwards from offset 0 until encountering the known newest boundary.
    const knownBoundaryTime = checkpoint.newestSubmissionTime;
    const knownBoundaryId = checkpoint.newestSubmissionId;

    let hitBoundary = false;

    while (!hitBoundary) {
      const page = await getAuthenticatedSubmissions(session, csrf, offset, PAGE_SIZE);
      pagesFetched++;
      const submissions = page.submissions;

      if (submissions.length === 0) {
        break;
      }

      totalProcessed += submissions.length;
      submissions.forEach((s) => uniqueProblemSlugs.add(s.titleSlug));

      // Separate submissions that are newer than the known boundary
      const newSubmissionsInBatch: AuthenticatedSubmissionItem[] = [];

      for (const sub of submissions) {
        const subTime = parseTimestamp(sub.timestamp);
        const isKnown = sub.id === knownBoundaryId || (knownBoundaryTime && subTime <= knownBoundaryTime);

        if (isKnown) {
          hitBoundary = true;
          break; // Reached previously synced horizon
        } else {
          newSubmissionsInBatch.push(sub);
        }
      }

      if (newSubmissionsInBatch.length > 0) {
        const slugToIdMap = await ensureProblemsExist(newSubmissionsInBatch);

        const newRecords = newSubmissionsInBatch.map((sub) => ({
          id: sub.id,
          userId: user.id,
          problemId: slugToIdMap.get(sub.titleSlug)!,
          status: sub.statusDisplay,
          language: sub.lang || null,
          runtime: parseRuntime(sub.runtime),
          memory: parseMemory(sub.memory),
          submittedAt: parseTimestamp(sub.timestamp),
        }));

        const insertRes = await prisma.submission.createMany({
          data: newRecords,
          skipDuplicates: true,
        });

        totalNewSaved += insertRes.count;

        // Update newest boundary to the most recent item seen
        const firstItem = newSubmissionsInBatch[0];
        checkpoint = await prisma.syncCheckpoint.update({
          where: { userId: user.id },
          data: {
            newestSubmissionId: firstItem.id,
            newestSubmissionTime: parseTimestamp(firstItem.timestamp),
            totalSyncedCount: { increment: insertRes.count },
            lastSyncedAt: new Date(),
          },
        });
      }

      totalDuplicatesSkipped += (submissions.length - newSubmissionsInBatch.length);

      if (!hitBoundary && page.hasNext) {
        offset += PAGE_SIZE;
        await delay(350);
      } else {
        break;
      }
    }

    // Update user lastSyncedAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSyncedAt: new Date() },
    });
  }

  // Refresh user lastSyncedAt on completion
  await prisma.user.update({
    where: { id: user.id },
    data: { lastSyncedAt: new Date() },
  });

  return {
    success: true,
    mode: "authenticated_historical",
    username: verifiedUsername,
    stats: {
      isInitialSyncComplete: checkpoint.isInitialSyncComplete,
      pagesFetched,
      submissionsProcessed: totalProcessed,
      newSubmissionsSaved: totalNewSaved,
      duplicatesSkipped: totalDuplicatesSkipped,
      uniqueProblemsHandled: uniqueProblemSlugs.size,
    },
    boundary: {
      newestSubmissionTime: checkpoint.newestSubmissionTime?.toISOString() ?? null,
      oldestSubmissionTime: checkpoint.oldestSubmissionTime?.toISOString() ?? null,
      newestSubmissionId: checkpoint.newestSubmissionId,
      oldestSubmissionId: checkpoint.oldestSubmissionId,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Preserved public fallback synchronization for unauthenticated / external users.
 */
async function syncPublicUser(username: string): Promise<SyncResult> {
  const submissions = await getRecentSubmissions(username);

  // Look up or create public user record
  const user = await prisma.user.upsert({
    where: { username },
    update: { lastSyncedAt: new Date() },
    create: { username, lastSyncedAt: new Date() },
  });

  const distinctSlugs = Array.from(new Set(submissions.map((s) => s.titleSlug)));
  const uniqueSubmissions = Array.from(
    new Map(submissions.map((s) => [s.titleSlug, s])).values()
  );

  const slugToIdMap = new Map<string, number>();

  // Fetch problem metadata and upsert Problem catalog
  for (let i = 0; i < uniqueSubmissions.length; i += 5) {
    const batch = uniqueSubmissions.slice(i, i + 5);

    await Promise.all(
      batch.map(async (sub) => {
        try {
          const details = await getProblemDetails(sub.titleSlug);
          const solvedAt = parseTimestamp(sub.timestamp);

          const saved = await prisma.problem.upsert({
            where: { slug: sub.titleSlug },
            update: {
              title: details.title,
              difficulty: details.difficulty,
              solvedAt,
              topics: details.topicTags.map((t) => t.name),
            },
            create: {
              slug: sub.titleSlug,
              title: details.title,
              difficulty: details.difficulty,
              solvedAt,
              topics: details.topicTags.map((t) => t.name),
            },
          });

          slugToIdMap.set(sub.titleSlug, saved.id);
        } catch (err) {
          console.error(`Failed to sync public problem details for "${sub.titleSlug}":`, err instanceof Error ? err.message : err);
        }
      })
    );
  }

  // Insert submission records for this user
  const submissionRecords = submissions
    .filter((s) => slugToIdMap.has(s.titleSlug))
    .map((s) => ({
      id: s.id,
      userId: user.id,
      problemId: slugToIdMap.get(s.titleSlug)!,
      status: "Accepted",
      language: null,
      runtime: null,
      memory: null,
      submittedAt: parseTimestamp(s.timestamp),
    }));

  let newSaved = 0;
  if (submissionRecords.length > 0) {
    const insertRes = await prisma.submission.createMany({
      data: submissionRecords,
      skipDuplicates: true,
    });
    newSaved = insertRes.count;
  }

  return {
    success: true,
    mode: "public_recent",
    username,
    stats: {
      isInitialSyncComplete: false,
      pagesFetched: 1,
      submissionsProcessed: submissions.length,
      newSubmissionsSaved: newSaved,
      duplicatesSkipped: submissions.length - newSaved,
      uniqueProblemsHandled: distinctSlugs.length,
    },
    timestamp: new Date().toISOString(),
  };
}

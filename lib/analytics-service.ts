import { prisma } from "@/lib/prisma";

export type RecommendationCategory =
  | "CRITICAL_REVISION"
  | "INSUFFICIENT_EXPOSURE"
  | "HIGH_FRICTION"
  | "ACTIVE_MAINTAINED";

export interface TopicExposureWindow {
  solvedCount: number;
  attemptCount: number;
}

export interface SolvedProblemMeta {
  id: number;
  slug: string;
  title: string;
  difficulty: string;
  lastSubmittedAt: string;
}

export interface TopicAnalytics {
  topic: string;
  uniqueSolved: number;
  uniqueAttempted: number;
  totalAttempts: number;
  acceptedAttempts: number;
  failedAttempts: number;
  struggleRatio: number;
  passRate: number | null; // null if 0 attempts
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
    unknown: number;
  };
  lastPracticed: string | null;
  daysSinceLastPractice: number | null;
  windows: {
    last30Days: TopicExposureWindow;
    last90Days: TopicExposureWindow;
    last180Days: TopicExposureWindow;
    last365Days: TopicExposureWindow;
  };
  historicalDepth: number; // problems solved > 90 days ago
  recentPractice: number;   // problems solved <= 90 days ago
  decayFactor: number;
  volumeDeficitFactor: number;
  frictionFactor: number;
  priorityScore: number;
  category: RecommendationCategory;
  explanation: string;
  recommendedAction: string;
  solvedProblems: SolvedProblemMeta[];
  reassessmentCount: number;
  lastRevisedAt: string | null;
  lastOutcome: "INDEPENDENT" | "WITH_HINTS" | "COULD_NOT_SOLVE" | null;
}

export interface OverallAnalyticsSummary {
  username: string;
  totalSubmissions: number;
  totalUniqueProblemsAttempted: number;
  totalUniqueProblemsSolved: number;
  overallPassRate: number | null;
  difficultySolved: {
    easy: number;
    medium: number;
    hard: number;
    unknown: number;
  };
  timeSpan: {
    earliestSubmission: string | null;
    latestSubmission: string | null;
    totalActiveDays: number;
    historySpanDays: number;
  };
  categoryCounts: Record<RecommendationCategory, number>;
  totalTopics: number;
  totalSupportedTopics: number;
  totalRevisionsCompleted: number;
  topRevisionCandidates: TopicAnalytics[];
  topics: TopicAnalytics[];
}

/**
 * Computes comprehensive historical analytics and explainable revision recommendations for a user.
 */
export async function calculateHistoricalAnalytics(
  targetUsername?: string,
  nowReference: Date = new Date()
): Promise<OverallAnalyticsSummary> {
  // 1. Locate the user
  let user = null;
  if (targetUsername && targetUsername.trim() !== "") {
    user = await prisma.user.findUnique({
      where: { username: targetUsername.trim() },
    });
  }

  if (!user) {
    // If no user was requested or user does not exist, return an empty analytics structure
    return {
      username: targetUsername || "",
      totalSubmissions: 0,
      totalUniqueProblemsAttempted: 0,
      totalUniqueProblemsSolved: 0,
      overallPassRate: null,
      difficultySolved: { easy: 0, medium: 0, hard: 0, unknown: 0 },
      timeSpan: {
        earliestSubmission: null,
        latestSubmission: null,
        totalActiveDays: 0,
        historySpanDays: 0,
      },
      categoryCounts: {
        CRITICAL_REVISION: 0,
        INSUFFICIENT_EXPOSURE: 0,
        HIGH_FRICTION: 0,
        ACTIVE_MAINTAINED: 0,
      },
      totalTopics: 0,
      totalSupportedTopics: 88,
      totalRevisionsCompleted: 0,
      topRevisionCandidates: [],
      topics: [],
    };
  }

  // 2. Fetch all historical submissions with problem details AND user revision records
  const [submissions, revisionRecords] = await Promise.all([
    prisma.submission.findMany({
      where: { userId: user.id },
      include: {
        problem: true,
      },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.revisionRecord.findMany({
      where: { userId: user.id },
      orderBy: { revisedAt: "desc" },
    }),
  ]);

  const revisionByTopic = new Map<
    string,
    { count: number; lastRevisedAt: string; lastOutcome: "INDEPENDENT" | "WITH_HINTS" | "COULD_NOT_SOLVE" | null }
  >();

  for (const rev of revisionRecords) {
    if (!revisionByTopic.has(rev.topic)) {
      revisionByTopic.set(rev.topic, {
        count: 0,
        lastRevisedAt: rev.revisedAt.toISOString(),
        lastOutcome: rev.outcome as "INDEPENDENT" | "WITH_HINTS" | "COULD_NOT_SOLVE",
      });
    }
    revisionByTopic.get(rev.topic)!.count++;
  }

  const now = nowReference;
  const nowMs = now.getTime();

  // Consistent UTC cutoff timestamps for rolling windows
  const t30 = new Date(nowMs - 30 * 24 * 60 * 60 * 1000);
  const t90 = new Date(nowMs - 90 * 24 * 60 * 60 * 1000);
  const t180 = new Date(nowMs - 180 * 24 * 60 * 60 * 1000);
  const t365 = new Date(nowMs - 365 * 24 * 60 * 60 * 1000);

  // Global tracking structures (guarantee zero double-counting across topics)
  const globalAttemptedProblemIds = new Set<number>();
  const globalSolvedProblemIds = new Set<number>();
  const problemDifficultyMap = new Map<number, string>();
  const problemMetaMap = new Map<number, SolvedProblemMeta>();
  const activeDaysSet = new Set<string>();

  let globalAcceptedCount = 0;
  let earliestSubDate: Date | null = null;
  let latestSubDate: Date | null = null;

  // Internal per-topic tracking accumulator
  interface TopicAccumulator {
    topic: string;
    attemptedProblemIds: Set<number>;
    solvedProblemIds: Set<number>;
    totalAttempts: number;
    acceptedAttempts: number;
    lastPracticed: Date | null;
    solvedW30: Set<number>;
    solvedW90: Set<number>;
    solvedW180: Set<number>;
    solvedW365: Set<number>;
    attemptsW30: number;
    attemptsW90: number;
    attemptsW180: number;
    attemptsW365: number;
    earliestAcByProblem: Map<number, Date>;
  }

  const topicMap = new Map<string, TopicAccumulator>();

  for (const sub of submissions) {
    const pId = sub.problemId;
    const isAccepted = sub.status === "Accepted";
    const subTime = sub.submittedAt;

    globalAttemptedProblemIds.add(pId);
    problemDifficultyMap.set(pId, sub.problem.difficulty);

    const dayKey = subTime.toISOString().split("T")[0];
    activeDaysSet.add(dayKey);

    if (isAccepted) {
      globalSolvedProblemIds.add(pId);
      globalAcceptedCount++;
      problemMetaMap.set(pId, {
        id: pId,
        slug: sub.problem.slug,
        title: sub.problem.title,
        difficulty: sub.problem.difficulty,
        lastSubmittedAt: subTime.toISOString(),
      });
    }

    if (!earliestSubDate || subTime < earliestSubDate) {
      earliestSubDate = subTime;
    }
    if (!latestSubDate || subTime > latestSubDate) {
      latestSubDate = subTime;
    }

    // Process topic tags (fallback to "Uncategorized" if empty)
    const topics = sub.problem.topics.length > 0 ? sub.problem.topics : ["Uncategorized"];

    for (const topic of topics) {
      if (!topicMap.has(topic)) {
        topicMap.set(topic, {
          topic,
          attemptedProblemIds: new Set<number>(),
          solvedProblemIds: new Set<number>(),
          totalAttempts: 0,
          acceptedAttempts: 0,
          lastPracticed: null,
          solvedW30: new Set<number>(),
          solvedW90: new Set<number>(),
          solvedW180: new Set<number>(),
          solvedW365: new Set<number>(),
          attemptsW30: 0,
          attemptsW90: 0,
          attemptsW180: 0,
          attemptsW365: 0,
          earliestAcByProblem: new Map<number, Date>(),
        });
      }

      const acc = topicMap.get(topic)!;
      acc.totalAttempts++;
      acc.attemptedProblemIds.add(pId);

      if (!acc.lastPracticed || subTime > acc.lastPracticed) {
        acc.lastPracticed = subTime;
      }

      if (isAccepted) {
        acc.acceptedAttempts++;
        acc.solvedProblemIds.add(pId);

        if (!acc.earliestAcByProblem.has(pId)) {
          acc.earliestAcByProblem.set(pId, subTime);
        } else {
          const currentEarliest = acc.earliestAcByProblem.get(pId)!;
          if (subTime < currentEarliest) {
            acc.earliestAcByProblem.set(pId, subTime);
          }
        }

        if (subTime >= t30) acc.solvedW30.add(pId);
        if (subTime >= t90) acc.solvedW90.add(pId);
        if (subTime >= t180) acc.solvedW180.add(pId);
        if (subTime >= t365) acc.solvedW365.add(pId);
      }

      if (subTime >= t30) acc.attemptsW30++;
      if (subTime >= t90) acc.attemptsW90++;
      if (subTime >= t180) acc.attemptsW180++;
      if (subTime >= t365) acc.attemptsW365++;
    }
  }

  // 3. Compute topic-level analytics
  const analyticsList: TopicAnalytics[] = [];

  for (const acc of topicMap.values()) {
    const uniqueSolved = acc.solvedProblemIds.size;
    const uniqueAttempted = acc.attemptedProblemIds.size;
    const totalAttempts = acc.totalAttempts;
    const acceptedAttempts = acc.acceptedAttempts;
    const failedAttempts = totalAttempts - acceptedAttempts;

    // Difficulty breakdown of unique solved problems in this topic
    const difficulty = { easy: 0, medium: 0, hard: 0, unknown: 0 };
    for (const solvedId of acc.solvedProblemIds) {
      const diff = problemDifficultyMap.get(solvedId);
      if (diff === "Easy") difficulty.easy++;
      else if (diff === "Medium") difficulty.medium++;
      else if (diff === "Hard") difficulty.hard++;
      else difficulty.unknown++;
    }

    // Struggle ratio: total attempts per unique solved problem
    let struggleRatio = 0;
    if (uniqueSolved > 0) {
      struggleRatio = Math.round((totalAttempts / uniqueSolved) * 10) / 10;
    } else if (uniqueAttempted > 0) {
      struggleRatio = Math.round((totalAttempts / uniqueAttempted) * 10) / 10;
    }

    // Pass rate: percentage of submissions that passed
    const passRate = totalAttempts > 0
      ? Math.round((acceptedAttempts / totalAttempts) * 1000) / 10
      : null;

    // Days since last practice (incorporating verified revision records)
    const revInfo = revisionByTopic.get(acc.topic);
    let effectiveLastPracticed = acc.lastPracticed;

    if (revInfo && revInfo.lastRevisedAt) {
      const revDate = new Date(revInfo.lastRevisedAt);
      if (!effectiveLastPracticed || revDate > effectiveLastPracticed) {
        if (revInfo.lastOutcome === "INDEPENDENT") {
          // Solved independently resets retention decay completely to the revision timestamp
          effectiveLastPracticed = revDate;
        } else if (revInfo.lastOutcome === "WITH_HINTS") {
          // Solved with hints cuts elapsed retention decay in half
          if (effectiveLastPracticed) {
            const originalElapsed = nowMs - effectiveLastPracticed.getTime();
            effectiveLastPracticed = new Date(nowMs - Math.floor(originalElapsed * 0.4));
          } else {
            effectiveLastPracticed = revDate;
          }
        }
      }
    }

    const daysSinceLastPractice = effectiveLastPracticed
      ? Math.max(0, Math.floor((nowMs - effectiveLastPracticed.getTime()) / (1000 * 60 * 60 * 24)))
      : null;

    // Historical depth vs recent practice
    let historicalDepth = 0;
    let recentPractice = 0;
    for (const firstSolveDate of acc.earliestAcByProblem.values()) {
      if (firstSolveDate < t90) {
        historicalDepth++;
      } else {
        recentPractice++;
      }
    }

    // 4. Calculate Priority Score factors (0 to 100 each)
    // A. Decay Factor: Higher as days since last practice increases
    let decayFactor = 100;
    if (daysSinceLastPractice !== null) {
      decayFactor = Math.min(100, Math.round((daysSinceLastPractice / 90) * 100));
    }

    // B. Volume Deficit Factor: Higher for topics with very low solved count
    let volumeDeficitFactor = 5;
    if (uniqueSolved <= 1) {
      volumeDeficitFactor = 100;
    } else if (uniqueSolved <= 3) {
      volumeDeficitFactor = 80;
    } else if (uniqueSolved <= 6) {
      volumeDeficitFactor = 55;
    } else if (uniqueSolved <= 12) {
      volumeDeficitFactor = 30;
    } else if (uniqueSolved <= 20) {
      volumeDeficitFactor = 15;
    }

    // C. Friction Factor: Higher when attempt-to-solve ratio indicates repeated struggle
    let frictionFactor = 0;
    if (uniqueSolved === 0 && uniqueAttempted > 0) {
      frictionFactor = 100; // All attempts failed
    } else {
      frictionFactor = Math.min(100, Math.max(0, Math.round((struggleRatio - 1.0) * 40)));
    }

    // Boost friction if the latest revision was a struggle
    if (revInfo?.lastOutcome === "COULD_NOT_SOLVE") {
      frictionFactor = Math.min(100, frictionFactor + 35);
    }

    // 5. Categorize Revision Recommendations with transparent explanations
    let category: RecommendationCategory = "ACTIVE_MAINTAINED";
    let explanation = "";
    let recommendedAction = "";

    const daysText = daysSinceLastPractice !== null ? `${daysSinceLastPractice} days` : "never";

    if (revInfo?.lastOutcome === "COULD_NOT_SOLVE") {
      category = "HIGH_FRICTION";
      explanation = `Unresolved difficulty on recent reassessment. Algorithmic patterns and edge cases require immediate reinforcement.`;
      recommendedAction = `Review the optimal approach breakdown and re-implement the pattern from scratch.`;
    } else if (
      (uniqueSolved >= 5 || difficulty.medium + difficulty.hard >= 2) &&
      daysSinceLastPractice !== null &&
      daysSinceLastPractice >= 90
    ) {
      category = "CRITICAL_REVISION";
      explanation = `Demonstrated solid past mastery (${uniqueSolved} problems solved, including ${difficulty.medium + difficulty.hard} Medium/Hard), but 0 practice in the last ${daysText}. High concept decay risk.`;
      recommendedAction = `Solve 2-3 Medium problems to refresh key algorithmic patterns and data structures.`;
    } else if (uniqueSolved <= 3) {
      category = "INSUFFICIENT_EXPOSURE";
      explanation = `Low total problem volume (${uniqueSolved} problem${uniqueSolved === 1 ? "" : "s"} solved all-time). Concept exposure deficit.`;
      recommendedAction = `Practice 3-5 foundational Easy and Medium problems to build essential conceptual confidence.`;
    } else if (
      (struggleRatio >= 2.5 || (passRate !== null && passRate < 55) || frictionFactor >= 50) &&
      (daysSinceLastPractice !== null && daysSinceLastPractice >= 14)
    ) {
      category = "HIGH_FRICTION";
      explanation = `High struggle ratio (${struggleRatio} attempts/solve, ${passRate ?? 0}% pass rate). Concept required significant trial-and-error during previous attempts.`;
      recommendedAction = `Re-attempt similar problem variants to reinforce problem-solving intuition and execution fluency.`;
    } else {
      category = "ACTIVE_MAINTAINED";
      if (revInfo?.lastOutcome === "INDEPENDENT" && daysSinceLastPractice !== null && daysSinceLastPractice < 14) {
        explanation = `Reassessed and solved independently on LeetCode (${daysText} ago). Retention refreshed and actively maintained.`;
        recommendedAction = `Concept verified fresh. No urgent revision needed.`;
      } else {
        explanation = `Practiced recently (${daysText} ago, ${acc.solvedW30.size} solved in the last 30 days). Skills are actively maintained.`;
        recommendedAction = `Maintain your current practice cadence; no urgent revision needed.`;
      }
    }

    // Weighted Priority Score: 45% Decay + 35% Volume Deficit + 20% Friction
    // Mastered concepts facing critical decay receive an urgency boost
    let categoryBonus = 0;
    if (category === "CRITICAL_REVISION") {
      categoryBonus = 25;
    } else if (category === "HIGH_FRICTION") {
      categoryBonus = 12;
    }

    const priorityScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          0.45 * decayFactor +
          0.35 * volumeDeficitFactor +
          0.20 * frictionFactor +
          categoryBonus
        )
      )
    );

    const solvedProblems = Array.from(acc.solvedProblemIds)
      .map((id) => problemMetaMap.get(id)!)
      .filter(Boolean)
      .sort((a, b) => new Date(b.lastSubmittedAt).getTime() - new Date(a.lastSubmittedAt).getTime());

    analyticsList.push({
      topic: acc.topic,
      uniqueSolved,
      uniqueAttempted,
      totalAttempts,
      acceptedAttempts,
      failedAttempts,
      struggleRatio,
      passRate,
      difficulty,
      lastPracticed: acc.lastPracticed ? acc.lastPracticed.toISOString() : null,
      daysSinceLastPractice,
      windows: {
        last30Days: {
          solvedCount: acc.solvedW30.size,
          attemptCount: acc.attemptsW30,
        },
        last90Days: {
          solvedCount: acc.solvedW90.size,
          attemptCount: acc.attemptsW90,
        },
        last180Days: {
          solvedCount: acc.solvedW180.size,
          attemptCount: acc.attemptsW180,
        },
        last365Days: {
          solvedCount: acc.solvedW365.size,
          attemptCount: acc.attemptsW365,
        },
      },
      historicalDepth,
      recentPractice,
      decayFactor,
      volumeDeficitFactor,
      frictionFactor,
      priorityScore,
      category,
      explanation,
      recommendedAction,
      solvedProblems,
      reassessmentCount: revInfo?.count ?? 0,
      lastRevisedAt: revInfo?.lastRevisedAt ?? null,
      lastOutcome: revInfo?.lastOutcome ?? null,
    });
  }

  // Sort topics by priority score descending
  analyticsList.sort((a, b) => b.priorityScore - a.priorityScore);

  // 6. Overall Metrics (strictly deduplicated across topics)
  const globalDifficultySolved = { easy: 0, medium: 0, hard: 0, unknown: 0 };
  for (const solvedId of globalSolvedProblemIds) {
    const diff = problemDifficultyMap.get(solvedId);
    if (diff === "Easy") globalDifficultySolved.easy++;
    else if (diff === "Medium") globalDifficultySolved.medium++;
    else if (diff === "Hard") globalDifficultySolved.hard++;
    else globalDifficultySolved.unknown++;
  }

  const categoryCounts: Record<RecommendationCategory, number> = {
    CRITICAL_REVISION: 0,
    INSUFFICIENT_EXPOSURE: 0,
    HIGH_FRICTION: 0,
    ACTIVE_MAINTAINED: 0,
  };

  for (const item of analyticsList) {
    categoryCounts[item.category]++;
  }

  const overallPassRate = submissions.length > 0
    ? Math.round((globalAcceptedCount / submissions.length) * 1000) / 10
    : null;

  const historySpanDays = earliestSubDate && latestSubDate
    ? Math.round((latestSubDate.getTime() - earliestSubDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    username: user.username,
    totalSubmissions: submissions.length,
    totalUniqueProblemsAttempted: globalAttemptedProblemIds.size,
    totalUniqueProblemsSolved: globalSolvedProblemIds.size,
    overallPassRate,
    difficultySolved: globalDifficultySolved,
    timeSpan: {
      earliestSubmission: earliestSubDate ? earliestSubDate.toISOString() : null,
      latestSubmission: latestSubDate ? latestSubDate.toISOString() : null,
      totalActiveDays: activeDaysSet.size,
      historySpanDays,
    },
    categoryCounts,
    totalTopics: analyticsList.length,
    totalSupportedTopics: 88,
    totalRevisionsCompleted: revisionRecords.length,
    topRevisionCandidates: analyticsList.slice(0, 10),
    topics: analyticsList,
  };
}

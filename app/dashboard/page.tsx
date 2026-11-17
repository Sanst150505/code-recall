import Link from "next/link";
import { Header } from "@/components/Header";
import { MetricCard } from "@/components/MetricCard";
import { ActivityTimelineChart } from "@/components/Charts";
import { RevisionCard } from "@/components/RevisionCard";
import { ActiveUserSession } from "@/components/ActiveUserSession";
import { calculateHistoricalAnalytics } from "@/lib/analytics-service";
import { prisma } from "@/lib/prisma";

interface DashboardPageProps {
  searchParams: Promise<{ user?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedParams = await searchParams;
  const usernameParam = resolvedParams.user?.trim();

  // If no user is specified in the URL, render the clean extension guide hub
  if (!usernameParam) {
    return (
      <>
        <ActiveUserSession />
        <Header
          title="CodeRecall"
          description="Algorithmic retention tracking & spaced repetition for LeetCode."
          username=""
        />

        <main className="p-6 sm:p-8 space-y-8 max-w-4xl mx-auto w-full">
          {/* Welcome Hero */}
          <div className="p-8 rounded-2xl bg-slate-900 text-white border border-slate-800">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Track your LeetCode retention, cognitive decay & revision queue.
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed max-w-2xl">
              Sync your LeetCode account using the CodeRecall Chrome extension, or explore our live demo profile to inspect the retention heuristics immediately.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard?user=demo"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white text-slate-950 hover:bg-slate-100 transition inline-block"
              >
                Explore Live Demo Profile
              </Link>
            </div>
          </div>

          {/* How It Works Guide */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Sync with the CodeRecall Extension
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-white border border-slate-200">
                <span className="text-xs font-bold text-slate-500 block mb-2">Step 1</span>
                <h4 className="text-xs font-bold text-slate-900">Load Extension</h4>
                <p className="text-[11px] text-slate-600 mt-1">
                  In Chrome, open <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">chrome://extensions</code>, enable Developer mode, and load the unpacked <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">extension/</code> folder.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-slate-200">
                <span className="text-xs font-bold text-slate-500 block mb-2">Step 2</span>
                <h4 className="text-xs font-bold text-slate-900">Sign into LeetCode</h4>
                <p className="text-[11px] text-slate-600 mt-1">
                  Log into your account on <a href="https://leetcode.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline">leetcode.com</a>.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-slate-200">
                <span className="text-xs font-bold text-slate-500 block mb-2">Step 3</span>
                <h4 className="text-xs font-bold text-slate-900">1-Click Sync</h4>
                <p className="text-[11px] text-slate-600 mt-1">
                  Open the extension popup and click <strong>Sync Submissions</strong>. Your dashboard will open automatically.
                </p>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  // A specific user was requested
  const summary = await calculateHistoricalAnalytics(usernameParam);

  // If user has not synced yet
  if (summary.totalSubmissions === 0) {
    return (
      <>
        <ActiveUserSession currentUsername={usernameParam} />
        <Header
          title="Assessment"
          username={usernameParam}
          lastSyncedAt={null}
        />

        <main className="p-6 sm:p-8 max-w-4xl mx-auto w-full">
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              No Submissions Synced for &ldquo;{usernameParam}&rdquo;
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Open your CodeRecall Chrome Extension, make sure you are signed into LeetCode as <strong>{usernameParam}</strong>, and click <strong>Sync Submissions</strong>.
            </p>
            <div className="pt-2 flex justify-center">
              <Link
                href={`/dashboard/sync?user=${encodeURIComponent(usernameParam)}`}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition"
              >
                View Extension Setup Guide
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Aggregate monthly submissions for the compact activity timeline
  const userSubmissions = await prisma.submission.findMany({
    where: { user: { username: summary.username } },
    select: { submittedAt: true, status: true },
    orderBy: { submittedAt: "asc" },
  });

  const monthMap = new Map<string, { month: string; submissions: number; accepted: number }>();

  for (const s of userSubmissions) {
    const d = s.submittedAt;
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "short", year: "2-digit" });

    if (!monthMap.has(key)) {
      monthMap.set(key, { month: label, submissions: 0, accepted: 0 });
    }

    const m = monthMap.get(key)!;
    m.submissions++;
    if (s.status === "Accepted") {
      m.accepted++;
    }
  }

  const timelineData = Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map((entry) => entry[1]);

  const totalNeedsRevision =
    summary.categoryCounts.CRITICAL_REVISION +
    summary.categoryCounts.HIGH_FRICTION +
    summary.categoryCounts.INSUFFICIENT_EXPOSURE;

  const topCandidate = summary.topRevisionCandidates[0];
  const otherCandidates = summary.topRevisionCandidates.slice(1, 3);

  return (
    <>
      <ActiveUserSession currentUsername={summary.username} />
      <Header
        title="Home"
        username={summary.username}
        lastSyncedAt={summary.timeSpan.latestSubmission}
      />

      <main className="p-6 sm:p-8 space-y-8 max-w-6xl mx-auto w-full">
        {/* Synthetic Demo Banner */}
        {summary.username === "demo" && (
          <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-indigo-950">
              <strong className="font-semibold text-indigo-900 block sm:inline mr-2">
                Sample Profile Preview:
              </strong>
              <span>
                Simulated 9-month LeetCode journey. All retention decay, attempt friction, and spaced-repetition queues are computed live by the CodeRecall analytics engine.
              </span>
            </div>
            <Link
              href="/dashboard/sync"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shrink-0 self-start sm:self-auto"
            >
              Sync Your Own LeetCode
            </Link>
          </div>
        )}

        {/* Short Greeting & Action Cue */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {summary.username === "demo" ? "Practice Overview (Demo Persona)" : `Welcome back, ${summary.username}`}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              {totalNeedsRevision > 0
                ? `You have ${totalNeedsRevision} DSA topics flagged for spaced revision today.`
                : "All concepts are fresh and well-maintained. Continue your current cadence."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={
                usernameParam
                  ? `/dashboard/revision?user=${encodeURIComponent(usernameParam)}`
                  : "/dashboard/revision"
              }
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              Open Revision Queue ({totalNeedsRevision})
            </Link>
          </div>
        </div>

        {/* Important Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Problems Solved"
            value={summary.totalUniqueProblemsSolved}
            subtitle={`${summary.totalUniqueProblemsAttempted} attempted across ${summary.totalTopics} active topics`}
            badge={`${summary.difficultySolved.easy} Easy · ${summary.difficultySolved.medium} Med · ${summary.difficultySolved.hard} Hard`}
            badgeVariant="indigo"
            tooltip="Deduplicated count of unique problems solved across all ingested submissions"
          />

          <MetricCard
            title="Total Submissions"
            value={summary.totalSubmissions}
            subtitle={`${summary.timeSpan.totalActiveDays} active practice days`}
            badge={`${summary.timeSpan.historySpanDays}D span`}
            badgeVariant="emerald"
            tooltip="Total historical submission attempts synced from LeetCode"
          />

          <MetricCard
            title="Pass Rate"
            value={`${summary.overallPassRate ?? 0}%`}
            subtitle="Accepted vs total submissions"
            badge="Historical"
            badgeVariant="emerald"
            tooltip="Percentage of accepted solutions relative to total historical attempts"
          />

          <MetricCard
            title="Revision Needed"
            value={totalNeedsRevision}
            subtitle={`${summary.categoryCounts.CRITICAL_REVISION} decay · ${summary.categoryCounts.HIGH_FRICTION} friction · ${summary.categoryCounts.INSUFFICIENT_EXPOSURE} deficit`}
            badge="Action Queue"
            badgeVariant="amber"
            tooltip="Total topics flagged by spaced-repetition heuristics (Decay + Friction + Volume Deficit)"
          />
        </div>

        {/* Revision Recommendations Section */}
        {summary.topRevisionCandidates.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Revise Today</h3>
                <p className="text-xs text-slate-600">
                  High-priority topics prioritized by time decay, previous trial-and-error, and practice deficits.
                </p>
              </div>
              <Link
                href={
                  usernameParam
                    ? `/dashboard/revision?user=${encodeURIComponent(usernameParam)}`
                    : "/dashboard/revision"
                }
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View full queue ({totalNeedsRevision})
              </Link>
            </div>

            {/* Featured #1 Recommendation */}
            {topCandidate && (
              <div className="mb-4">
                <RevisionCard
                  item={topCandidate}
                  rank={1}
                  username={summary.username}
                  isFeatured={true}
                />
              </div>
            )}

            {/* Secondary Top Recommendations */}
            {otherCandidates.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {otherCandidates.map((item, idx) => (
                  <RevisionCard
                    key={item.topic}
                    item={item}
                    rank={idx + 2}
                    username={summary.username}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Compact Practice Activity Chart */}
        <section className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Practice Activity</h3>
              <p className="text-xs text-slate-600">Monthly submission history</p>
            </div>
            <span className="text-xs text-slate-600 font-medium">
              {timelineData.length} months
            </span>
          </div>
          <ActivityTimelineChart data={timelineData} />
        </section>
      </main>
    </>
  );
}

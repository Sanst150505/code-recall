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
    summary.categoryCounts.CRITICAL_REVISION + summary.categoryCounts.INSUFFICIENT_EXPOSURE;

  return (
    <>
      <ActiveUserSession currentUsername={summary.username} />
      <Header
        title="Home"
        username={summary.username}
        lastSyncedAt={summary.timeSpan.latestSubmission}
      />

      <main className="p-6 sm:p-8 space-y-8 max-w-6xl mx-auto w-full">
        {/* Short Greeting */}
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Welcome back, {summary.username}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Here is your practice summary and the topics that need revision today.
          </p>
        </div>

        {/* Important Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Problems Solved"
            value={summary.totalUniqueProblemsSolved}
            subtitle={`${summary.totalUniqueProblemsAttempted} attempted`}
            badge={`${summary.difficultySolved.easy}E · ${summary.difficultySolved.medium}M · ${summary.difficultySolved.hard}H`}
            badgeVariant="indigo"
          />

          <MetricCard
            title="Total Submissions"
            value={summary.totalSubmissions}
            subtitle={`${summary.timeSpan.totalActiveDays} active practice days`}
            badge={`${summary.timeSpan.historySpanDays}d span`}
            badgeVariant="emerald"
          />

          <MetricCard
            title="Pass Rate"
            value={`${summary.overallPassRate ?? 0}%`}
            subtitle="Accepted vs total submissions"
            badge="Historical"
            badgeVariant="emerald"
          />

          <MetricCard
            title="Revision Needed"
            value={totalNeedsRevision}
            subtitle={`${summary.categoryCounts.CRITICAL_REVISION} decaying · ${summary.categoryCounts.INSUFFICIENT_EXPOSURE} deficits`}
            badge="Action"
            badgeVariant="amber"
          />
        </div>

        {/* Revision Recommendation Cards */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Revise Today</h3>
              <p className="text-xs text-slate-600">
                Top concepts prioritized by days since last practice and struggle.
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
              View all recommendations
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {summary.topRevisionCandidates.slice(0, 3).map((item, idx) => (
              <RevisionCard
                key={item.topic}
                item={item}
                rank={idx + 1}
                username={summary.username}
              />
            ))}
          </div>
        </section>

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

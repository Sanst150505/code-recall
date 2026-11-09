import Link from "next/link";
import { Header } from "@/components/Header";
import { MetricCard } from "@/components/MetricCard";
import { ActivityTimelineChart } from "@/components/Charts";
import { RevisionCard } from "@/components/RevisionCard";
import { ActiveUserSession } from "@/components/ActiveUserSession";
import { calculateHistoricalAnalytics } from "@/lib/analytics-service";
import { prisma } from "@/lib/prisma";
import {
  CheckCircle2,
  Code2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  User,
  Users,
  Search,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { ChromeIcon } from "@/components/ChromeIcon";

interface DashboardPageProps {
  searchParams: Promise<{ user?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedParams = await searchParams;
  const usernameParam = resolvedParams.user?.trim();

  // If no user is specified in the URL, render the Welcome / Profile Selector hub
  if (!usernameParam) {
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        lastSyncedAt: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { lastSyncedAt: "desc" },
    });

    return (
      <>
        <ActiveUserSession />
        <Header
          title="CodeRecall"
          description="Algorithmic retention tracking & spaced repetition for LeetCode."
          username=""
        />

        <main className="p-6 sm:p-8 space-y-8 max-w-5xl mx-auto w-full">
          {/* Welcome Hero */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white relative overflow-hidden shadow-lg border border-indigo-900/40">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Multi-User DSA Assessment
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Track your LeetCode retention, cognitive decay & revision queue.
              </h2>
              <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                Connect your personal LeetCode account via the CodeRecall Chrome extension, or enter a username below to explore an assessment.
              </p>

              {/* Enter Username Form */}
              <form action="/dashboard" method="GET" className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="user"
                    placeholder="Enter LeetCode username..."
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  <span>View Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* How It Works Guide */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ChromeIcon className="w-4 h-4 text-indigo-600" />
              How to Sync Your Personal LeetCode Account
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center mb-3">
                  1
                </div>
                <h4 className="text-xs font-bold text-slate-900">Install Extension</h4>
                <p className="text-[11px] text-slate-600 mt-1">
                  Load the CodeRecall unpacked Chrome extension in <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">chrome://extensions</code>.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center mb-3">
                  2
                </div>
                <h4 className="text-xs font-bold text-slate-900">Log into LeetCode</h4>
                <p className="text-[11px] text-slate-600 mt-1">
                  Sign into your account on <a href="https://leetcode.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline">leetcode.com</a>. The extension auto-detects your session.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-xs flex items-center justify-center mb-3">
                  3
                </div>
                <h4 className="text-xs font-bold text-slate-900">1-Click Sync</h4>
                <p className="text-[11px] text-slate-600 mt-1">
                  Click <strong>Sync Submissions</strong> in the extension popup. It immediately opens your personal assessment!
                </p>
              </div>
            </div>
          </section>

          {/* Synced Profiles */}
          {allUsers.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Synced Profiles on this Deployment ({allUsers.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {allUsers.map((u) => (
                  <Link
                    key={u.username}
                    href={`/dashboard?user=${encodeURIComponent(u.username)}`}
                    className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-xs transition group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-800 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition">
                          {u.username}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {u._count.submissions} submissions
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}
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
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              No Submissions Synced for &ldquo;{usernameParam}&rdquo;
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              We couldn&apos;t find any submissions in the database for <strong>{usernameParam}</strong>.
              Open your CodeRecall Chrome Extension, make sure you are signed into LeetCode as <strong>{usernameParam}</strong>, and click <strong>Sync Submissions</strong>.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                &larr; Back to Profiles
              </Link>
              <Link
                href={`/dashboard/sync?user=${encodeURIComponent(usernameParam)}`}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition"
              >
                Go to Connection Settings
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
            icon={<CheckCircle2 className="w-5 h-5 text-indigo-600" />}
            iconBg="bg-indigo-50 border-indigo-100"
          />

          <MetricCard
            title="Total Submissions"
            value={summary.totalSubmissions}
            subtitle={`${summary.timeSpan.totalActiveDays} active practice days`}
            badge={`${summary.timeSpan.historySpanDays}d span`}
            badgeVariant="emerald"
            icon={<Code2 className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-50 border-emerald-100"
          />

          <MetricCard
            title="Pass Rate"
            value={`${summary.overallPassRate ?? 0}%`}
            subtitle="Accepted vs total submissions"
            badge="Historical"
            badgeVariant="emerald"
            icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-50 border-emerald-100"
          />

          <MetricCard
            title="Revision Needed"
            value={totalNeedsRevision}
            subtitle={`${summary.categoryCounts.CRITICAL_REVISION} decaying · ${summary.categoryCounts.INSUFFICIENT_EXPOSURE} deficits`}
            badge="Action"
            badgeVariant="amber"
            icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
            iconBg="bg-amber-50 border-amber-100"
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
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View all recommendations</span>
              <ArrowRight className="w-3.5 h-3.5" />
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

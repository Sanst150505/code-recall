import Link from "next/link";
import { Header } from "@/components/Header";
import { MetricCard } from "@/components/MetricCard";
import { ActivityTimelineChart } from "@/components/Charts";
import { RevisionCard } from "@/components/RevisionCard";
import { calculateHistoricalAnalytics } from "@/lib/analytics-service";
import { prisma } from "@/lib/prisma";
import {
  CheckCircle2,
  Code2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface DashboardPageProps {
  searchParams: Promise<{ user?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedParams = await searchParams;
  const usernameParam = resolvedParams.user?.trim();
  const summary = await calculateHistoricalAnalytics(usernameParam);

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

import Link from "next/link";
import { Header } from "@/components/Header";
import { TopicsTable } from "@/components/TopicsTable";
import {
  DifficultyDonutChart,
  TopTopicsBarChart,
} from "@/components/Charts";
import { calculateHistoricalAnalytics } from "@/lib/analytics-service";

interface TopicsPageProps {
  searchParams: Promise<{ user?: string }>;
}

export default async function TopicsPage({ searchParams }: TopicsPageProps) {
  const resolvedParams = await searchParams;
  const usernameParam = resolvedParams.user?.trim();
  const summary = await calculateHistoricalAnalytics(usernameParam);

  if (summary.totalSubmissions === 0) {
    return (
      <>
        <Header
          title="My Progress"
          description="Detailed competency matrix and difficulty breakdown across 88 topics."
          username={summary.username}
          lastSyncedAt={null}
        />
        <main className="p-6 sm:p-8 max-w-4xl mx-auto w-full">
          <div className="p-10 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              {usernameParam ? `No submissions found for "${usernameParam}"` : "No profile selected"}
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Please sync your LeetCode account using the CodeRecall Chrome extension.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Aggregate top 7 topics for the bar chart
  const topTopicsData = summary.topics
    .filter((t) => t.uniqueSolved > 0)
    .slice(0, 7)
    .map((t) => ({
      topic: t.topic,
      solved: t.uniqueSolved,
      attempts: t.totalAttempts,
    }));

  return (
    <>
      <Header
        title="My Progress"
        description="Detailed competency matrix and difficulty breakdown across practiced topics (from 88 supported DSA categories)."
        username={summary.username}
        lastSyncedAt={summary.timeSpan.latestSubmission}
      />

      <main className="p-6 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* Synthetic Demo Banner */}
        {summary.username === "demo" && (
          <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <strong className="font-semibold text-indigo-900 block sm:inline mr-2">
                Sample Profile Preview:
              </strong>
              <span>
                Demonstrating skill assessment across {summary.totalTopics} active DSA topics out of 88 supported LeetCode categories.
              </span>
            </div>
          </div>
        )}

        {/* Unified Competency & Health Strip */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                DSA Category Coverage
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                  {summary.totalTopics}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  of 88 supported categories practiced ({Math.round((summary.totalTopics / 88) * 100)}%)
                </span>
              </div>
            </div>

            {/* Status counts in a calm inline strip */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Maintained: <strong>{summary.categoryCounts.ACTIVE_MAINTAINED}</strong></span>
              </span>

              <span className="px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Critical Decay: <strong>{summary.categoryCounts.CRITICAL_REVISION}</strong></span>
              </span>

              <span className="px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>High Friction: <strong>{summary.categoryCounts.HIGH_FRICTION}</strong></span>
              </span>

              {summary.categoryCounts.INSUFFICIENT_EXPOSURE > 0 && (
                <span className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Low Exposure: <strong>{summary.categoryCounts.INSUFFICIENT_EXPOSURE}</strong></span>
                </span>
              )}
            </div>
          </div>

          {/* Visual Stacked Retention Health Bar */}
          {summary.totalTopics > 0 && (
            <div className="w-full">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  style={{
                    width: `${(summary.categoryCounts.ACTIVE_MAINTAINED / summary.totalTopics) * 100}%`,
                  }}
                  className="bg-emerald-500 h-full transition-all"
                  title={`Maintained: ${summary.categoryCounts.ACTIVE_MAINTAINED} topics`}
                />
                <div
                  style={{
                    width: `${(summary.categoryCounts.CRITICAL_REVISION / summary.totalTopics) * 100}%`,
                  }}
                  className="bg-rose-500 h-full transition-all"
                  title={`Critical Decay: ${summary.categoryCounts.CRITICAL_REVISION} topics`}
                />
                <div
                  style={{
                    width: `${(summary.categoryCounts.HIGH_FRICTION / summary.totalTopics) * 100}%`,
                  }}
                  className="bg-indigo-500 h-full transition-all"
                  title={`High Friction: ${summary.categoryCounts.HIGH_FRICTION} topics`}
                />
                <div
                  style={{
                    width: `${(summary.categoryCounts.INSUFFICIENT_EXPOSURE / summary.totalTopics) * 100}%`,
                  }}
                  className="bg-amber-400 h-full transition-all"
                  title={`Low Exposure: ${summary.categoryCounts.INSUFFICIENT_EXPOSURE} topics`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Charts: Difficulty Split + Top Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Difficulty Breakdown</h3>
              <p className="text-xs text-slate-600">Solved problems by difficulty</p>
            </div>
            <DifficultyDonutChart
              easy={summary.difficultySolved.easy}
              medium={summary.difficultySolved.medium}
              hard={summary.difficultySolved.hard}
            />
          </div>

          <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Highest Volume Topics</h3>
                <p className="text-xs text-slate-600">Solved problems vs total attempts</p>
              </div>
            </div>
            <TopTopicsBarChart data={topTopicsData} />
          </div>
        </div>

        {/* Interactive Filterable Topics Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900">All Topics</h3>
          <TopicsTable initialTopics={summary.topics} />
        </div>
      </main>
    </>
  );
}

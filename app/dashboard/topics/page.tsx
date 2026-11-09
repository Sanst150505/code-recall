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
              Please connect your LeetCode account with the CodeRecall Chrome extension or select a profile on the home dashboard.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition"
              >
                &larr; Choose or Connect Profile
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
        description="Detailed competency matrix and difficulty breakdown across 88 topics."
        username={summary.username}
        lastSyncedAt={summary.timeSpan.latestSubmission}
      />

      <main className="p-6 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* Quick Topic Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Total Topics</span>
            <p className="text-xl font-bold text-slate-900 mt-1">{summary.totalTopics}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200">
            <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">Decay Risk</span>
            <p className="text-xl font-bold text-rose-800 mt-1">{summary.categoryCounts.CRITICAL_REVISION}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200">
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Low Exposure</span>
            <p className="text-xl font-bold text-amber-800 mt-1">{summary.categoryCounts.INSUFFICIENT_EXPOSURE}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Maintained</span>
            <p className="text-xl font-bold text-emerald-800 mt-1">{summary.categoryCounts.ACTIVE_MAINTAINED}</p>
          </div>
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

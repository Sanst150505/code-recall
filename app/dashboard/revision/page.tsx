import Link from "next/link";
import { Header } from "@/components/Header";
import { RevisionQueueView } from "@/components/RevisionQueueView";
import { calculateHistoricalAnalytics } from "@/lib/analytics-service";

interface RevisionPageProps {
  searchParams: Promise<{ user?: string }>;
}

export default async function RevisionPage({ searchParams }: RevisionPageProps) {
  const resolvedParams = await searchParams;
  const usernameParam = resolvedParams.user?.trim();
  const summary = await calculateHistoricalAnalytics(usernameParam);

  if (summary.totalSubmissions === 0) {
    return (
      <>
        <Header
          title="Revise Today"
          description="Concepts organized by priority, recency, and past struggle."
          username={summary.username}
          lastSyncedAt={null}
        />
        <main className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
          <div className="p-6 sm:p-10 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
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

  // Group topics by their category
  const criticalTopics = summary.topics.filter((t) => t.category === "CRITICAL_REVISION");
  const deficitTopics = summary.topics.filter((t) => t.category === "INSUFFICIENT_EXPOSURE");
  const frictionTopics = summary.topics.filter((t) => t.category === "HIGH_FRICTION");
  const maintainedTopics = summary.topics.filter((t) => t.category === "ACTIVE_MAINTAINED");
  const totalActionNeeded = criticalTopics.length + deficitTopics.length + frictionTopics.length;

  return (
    <>
      <Header
        title="Revise Today"
        description="Spaced-repetition queue organized by concept decay, attempt friction, and exposure deficits."
        username={summary.username}
        lastSyncedAt={summary.lastSyncedAt ?? summary.timeSpan.latestSubmission}
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-6xl mx-auto w-full">
        {/* Action Overview Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Revision Queue
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Spaced-repetition priority schedule. Practice target problems on LeetCode and verify your solves.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-medium text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>
              <strong className="text-slate-900">{totalActionNeeded}</strong> topics flagged for revision
            </span>
          </div>
        </div>

        {/* Interactive Tabbed Queue Workbench */}
        <RevisionQueueView
          username={summary.username}
          criticalTopics={criticalTopics}
          frictionTopics={frictionTopics}
          deficitTopics={deficitTopics}
          maintainedTopics={maintainedTopics}
        />
      </main>
    </>
  );
}

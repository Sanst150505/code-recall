import Link from "next/link";
import { Header } from "@/components/Header";
import { RevisionCard } from "@/components/RevisionCard";
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
        lastSyncedAt={summary.timeSpan.latestSubmission}
      />

      <main className="p-6 sm:p-8 space-y-8 max-w-6xl mx-auto w-full">
        {/* Synthetic Demo Banner */}
        {summary.username === "demo" && (
          <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <strong className="font-semibold text-indigo-900 block sm:inline mr-2">
                Sample Profile Preview:
              </strong>
              <span>
                Demonstrating 5 critical decay topics (practiced 90+ days ago) and 1 high-friction graph topic.
              </span>
            </div>
            <span className="text-[11px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200 self-start sm:self-auto">
              {summary.totalRevisionsCompleted} Reassessments Recorded
            </span>
          </div>
        )}

        {/* Action Overview Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Revision Queue ({totalActionNeeded} Topics Actionable)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Select any topic, open associated LeetCode problems to practice, and mark your reassessment outcome.
            </p>
          </div>
        </div>

        {/* Quick Summary Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-slate-600 font-medium block">Critical Decay</span>
            <span className="text-xl font-bold text-rose-600 mt-0.5 block">{criticalTopics.length}</span>
            <span className="text-[10px] text-slate-600 mt-1 block">0 solves in 90+ Days</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-slate-600 font-medium block">High Friction</span>
            <span className="text-xl font-bold text-indigo-600 mt-0.5 block">{frictionTopics.length}</span>
            <span className="text-[10px] text-slate-600 mt-1 block">High trial-and-error</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-slate-600 font-medium block">Low Exposure</span>
            <span className="text-xl font-bold text-amber-600 mt-0.5 block">{deficitTopics.length}</span>
            <span className="text-[10px] text-slate-600 mt-1 block">&le; 3 problems solved</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-slate-600 font-medium block">Maintained</span>
            <span className="text-xl font-bold text-emerald-600 mt-0.5 block">{maintainedTopics.length}</span>
            <span className="text-[10px] text-slate-600 mt-1 block">Active within 30 Days</span>
          </div>
        </div>

        {/* Category 1: Critical Revision */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">
              Critical Revision
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
              {criticalTopics.length}
            </span>
            <span className="text-xs text-slate-600">· Solid past mastery, but 0 practice in 90+ Days</span>
          </div>

          {criticalTopics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {criticalTopics.map((item, idx) => (
                <RevisionCard
                  key={item.topic}
                  item={item}
                  rank={idx + 1}
                  username={summary.username}
                />
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/80 text-center text-xs text-slate-500">
              No topics at critical decay risk. All previously learned concepts are fresh.
            </div>
          )}
        </section>

        {/* Category 2: Insufficient Exposure */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">
              Low Exposure Deficits
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
              {deficitTopics.length}
            </span>
            <span className="text-xs text-slate-600">· Topics with 3 or fewer solved problems</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {deficitTopics.slice(0, 9).map((item, idx) => (
              <RevisionCard
                key={item.topic}
                item={item}
                rank={idx + 1}
                username={summary.username}
              />
            ))}
          </div>
        </section>

        {/* Category 3: High Friction */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">
              High Friction
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              {frictionTopics.length}
            </span>
            <span className="text-xs text-slate-600">· Higher trial-and-error during previous solves</span>
          </div>

          {frictionTopics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {frictionTopics.map((item, idx) => (
                <RevisionCard
                  key={item.topic}
                  item={item}
                  rank={idx + 1}
                  username={summary.username}
                />
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/80 text-center text-xs text-slate-500">
              No topics with high attempt friction detected.
            </div>
          )}
        </section>

        {/* Category 4: Active & Maintained */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">
              Actively Maintained
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              {maintainedTopics.length}
            </span>
            <span className="text-xs text-slate-600">· Practiced recently with solid pass rates</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {maintainedTopics.slice(0, 6).map((item, idx) => (
              <RevisionCard
                key={item.topic}
                item={item}
                rank={idx + 1}
                username={summary.username}
              />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

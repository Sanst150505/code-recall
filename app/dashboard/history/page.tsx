import { Suspense } from "react";
import { Header } from "@/components/Header";
import { SubmissionHistoryTable } from "@/components/SubmissionHistoryTable";
import { prisma } from "@/lib/prisma";

interface HistoryPageProps {
  searchParams: Promise<{ user?: string }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const resolvedParams = await searchParams;
  const username = resolvedParams.user?.trim() || "anonymous";

  const user =
    username !== "anonymous"
      ? await prisma.user.findUnique({
          where: { username },
          select: {
            lastSyncedAt: true,
            syncCheckpoint: { select: { lastSyncedAt: true } },
          },
        })
      : null;

  const lastSyncedAt =
    user?.lastSyncedAt?.toISOString() ??
    user?.syncCheckpoint?.lastSyncedAt?.toISOString() ??
    null;

  return (
    <>
      <Header
        title="History"
        description="All past submissions, runtimes, memory, and verdicts."
        username={username}
        lastSyncedAt={lastSyncedAt}
      />

      <main className="p-6 sm:p-8 max-w-6xl mx-auto w-full">
        <Suspense
          fallback={
            <div className="p-10 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
              Loading submissions...
            </div>
          }
        >
          <SubmissionHistoryTable />
        </Suspense>
      </main>
    </>
  );
}

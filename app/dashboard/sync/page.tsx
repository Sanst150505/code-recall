import { Header } from "@/components/Header";
import { SyncCenterView } from "@/components/SyncCenterView";
import { prisma } from "@/lib/prisma";

interface SyncPageProps {
  searchParams: Promise<{ user?: string }>;
}

export default async function SyncPage({ searchParams }: SyncPageProps) {
  const resolvedParams = await searchParams;
  const targetUser = resolvedParams.user?.trim();

  const user = targetUser
    ? await prisma.user.findUnique({
        where: { username: targetUser },
        include: { syncCheckpoint: true },
      })
    : null;

  const totalSubmissions = user ? await prisma.submission.count({ where: { userId: user.id } }) : 0;
  const totalProblems = await prisma.problem.count();
  const acceptedCount = user ? await prisma.submission.count({ where: { userId: user.id, status: "Accepted" } }) : 0;

  const initialData = {
    hasUser: Boolean(user),
    user: user
      ? {
          id: user.id,
          username: user.username,
          lastSyncedAt: user.lastSyncedAt?.toISOString() ?? null,
          createdAt: user.createdAt.toISOString(),
        }
      : undefined,
    stats: {
      totalSubmissions,
      totalProblems,
      acceptedCount,
      passRate: totalSubmissions > 0 ? Math.round((acceptedCount / totalSubmissions) * 1000) / 10 : null,
    },
    checkpoint: user?.syncCheckpoint
      ? {
          isInitialSyncComplete: user.syncCheckpoint.isInitialSyncComplete,
          lastPersistedOffset: user.syncCheckpoint.lastPersistedOffset,
          totalSyncedCount: user.syncCheckpoint.totalSyncedCount,
          newestSubmissionTime: user.syncCheckpoint.newestSubmissionTime?.toISOString() ?? null,
          oldestSubmissionTime: user.syncCheckpoint.oldestSubmissionTime?.toISOString() ?? null,
          newestSubmissionId: user.syncCheckpoint.newestSubmissionId,
          oldestSubmissionId: user.syncCheckpoint.oldestSubmissionId,
          lastSyncedAt: user.syncCheckpoint.lastSyncedAt?.toISOString() ?? null,
        }
      : null,
  };

  return (
    <>
      <Header
        title="Extension Sync"
        description="LeetCode submission sync status and checkpoints."
        username={user?.username || targetUser || ""}
        lastSyncedAt={user?.lastSyncedAt?.toISOString() ?? null}
      />

      <main className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
        <SyncCenterView initialData={initialData} />
      </main>
    </>
  );
}

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

  const allUsersRaw = await prisma.user.findMany({
    select: { id: true, username: true, lastSyncedAt: true },
    orderBy: { lastSyncedAt: "desc" },
  });

  const allUsers = allUsersRaw.map((u) => ({
    id: u.id,
    username: u.username,
    lastSyncedAt: u.lastSyncedAt?.toISOString() ?? null,
  }));

  const totalSubmissions = user ? await prisma.submission.count({ where: { userId: user.id } }) : 0;
  const totalProblems = await prisma.problem.count();
  const acceptedCount = user ? await prisma.submission.count({ where: { userId: user.id, status: "Accepted" } }) : 0;

  const initialData = {
    hasUser: Boolean(user),
    allUsers,
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
        title="Profile & Connections"
        description="LeetCode account link, sync checkpoints, and extension status."
        username={user?.username || targetUser || "anonymous"}
        lastSyncedAt={user?.lastSyncedAt?.toISOString() ?? null}
      />

      <main className="p-6 sm:p-8 max-w-6xl mx-auto w-full">
        <SyncCenterView initialData={initialData} />
      </main>
    </>
  );
}

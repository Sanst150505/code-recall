-- AlterTable
ALTER TABLE "Problem" ALTER COLUMN "solvedAt" DROP NOT NULL;

-- CreateTable
CREATE TABLE "SyncCheckpoint" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "isInitialSyncComplete" BOOLEAN NOT NULL DEFAULT false,
    "newestSubmissionId" TEXT,
    "newestSubmissionTime" TIMESTAMP(3),
    "oldestSubmissionId" TEXT,
    "oldestSubmissionTime" TIMESTAMP(3),
    "lastPersistedOffset" INTEGER NOT NULL DEFAULT 0,
    "totalSyncedCount" INTEGER NOT NULL DEFAULT 0,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SyncCheckpoint_userId_key" ON "SyncCheckpoint"("userId");

-- AddForeignKey
ALTER TABLE "SyncCheckpoint" ADD CONSTRAINT "SyncCheckpoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

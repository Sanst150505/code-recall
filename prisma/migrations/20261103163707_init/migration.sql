-- CreateTable
CREATE TABLE "Problem" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "solvedAt" TIMESTAMP(3) NOT NULL,
    "topics" TEXT[],

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

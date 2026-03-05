-- CreateTable
CREATE TABLE "answers" (
    "id" TEXT NOT NULL,
    "stageContentId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_stageContentId_fkey" FOREIGN KEY ("stageContentId") REFERENCES "stage_contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

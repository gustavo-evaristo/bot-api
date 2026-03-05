-- CreateTable
CREATE TABLE "stage_contents" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stage_contents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "stage_contents" ADD CONSTRAINT "stage_contents_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

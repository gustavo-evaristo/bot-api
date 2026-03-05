-- CreateTable
CREATE TABLE "stages" (
    "id" TEXT NOT NULL,
    "kanbanId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_kanbanId_fkey" FOREIGN KEY ("kanbanId") REFERENCES "kanbans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "flow_nodes" ADD COLUMN     "kanbanStageId" TEXT;

-- AlterTable
ALTER TABLE "flows" ADD COLUMN     "kanbanId" TEXT;

-- CreateTable
CREATE TABLE "kanbans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanbans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanban_stages" (
    "id" TEXT NOT NULL,
    "kanbanId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanban_stages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "flows" ADD CONSTRAINT "flows_kanbanId_fkey" FOREIGN KEY ("kanbanId") REFERENCES "kanbans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_nodes" ADD CONSTRAINT "flow_nodes_kanbanStageId_fkey" FOREIGN KEY ("kanbanStageId") REFERENCES "kanban_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanbans" ADD CONSTRAINT "kanbans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanban_stages" ADD CONSTRAINT "kanban_stages_kanbanId_fkey" FOREIGN KEY ("kanbanId") REFERENCES "kanbans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

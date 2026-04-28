-- AlterTable
ALTER TABLE "flow_nodes" ADD COLUMN     "postFillKanbanStageId" TEXT;

-- AddForeignKey
ALTER TABLE "flow_nodes" ADD CONSTRAINT "flow_nodes_postFillKanbanStageId_fkey" FOREIGN KEY ("postFillKanbanStageId") REFERENCES "kanban_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

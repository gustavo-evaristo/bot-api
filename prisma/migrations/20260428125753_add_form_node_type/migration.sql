-- AlterTable
ALTER TABLE "flow_nodes" ADD COLUMN     "formId" TEXT;

-- AddForeignKey
ALTER TABLE "flow_nodes" ADD CONSTRAINT "flow_nodes_formId_fkey" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

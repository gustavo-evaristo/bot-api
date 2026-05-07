-- AlterTable
ALTER TABLE "message_history"
  ADD COLUMN "whatsappMessageId" TEXT,
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'SENT',
  ADD COLUMN "statusUpdatedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "message_history_whatsappMessageId_key" ON "message_history"("whatsappMessageId");

-- CreateIndex
CREATE INDEX "message_history_whatsappMessageId_idx" ON "message_history"("whatsappMessageId");

-- CreateTable
CREATE TABLE "pending_outbound_message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "toPhoneNumber" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "lastError" TEXT,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "pending_outbound_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pending_outbound_message_status_nextAttemptAt_idx" ON "pending_outbound_message"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "pending_outbound_message_conversationId_idx" ON "pending_outbound_message"("conversationId");

-- AddForeignKey
ALTER TABLE "pending_outbound_message" ADD CONSTRAINT "pending_outbound_message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

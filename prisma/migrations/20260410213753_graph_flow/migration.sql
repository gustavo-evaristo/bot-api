/*
  Warnings:

  - You are about to drop the `answers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stage_contents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "answers" DROP CONSTRAINT "answers_stageContentId_fkey";

-- DropForeignKey
ALTER TABLE "stage_contents" DROP CONSTRAINT "stage_contents_stageId_fkey";

-- DropForeignKey
ALTER TABLE "stages" DROP CONSTRAINT "stages_kanbanId_fkey";

-- AlterTable
ALTER TABLE "kanbans" ADD COLUMN     "startNodeId" TEXT;

-- DropTable
DROP TABLE "answers";

-- DropTable
DROP TABLE "stage_contents";

-- DropTable
DROP TABLE "stages";

-- CreateTable
CREATE TABLE "flow_nodes" (
    "id" TEXT NOT NULL,
    "kanbanId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "defaultNextNodeId" TEXT,
    "x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flow_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "node_options" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "nextNodeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "node_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "kanbanId" TEXT NOT NULL,
    "leadPhoneNumber" TEXT NOT NULL,
    "leadName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_history" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_progress" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "currentNodeId" TEXT NOT NULL,
    "waitingForResponse" BOOLEAN NOT NULL DEFAULT false,
    "waitingForResponseSince" TIMESTAMP(3),
    "followUpSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_responses" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "nodeOptionId" TEXT,
    "responseText" TEXT NOT NULL,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "creds" TEXT,
    "keys" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instance_lock" (
    "lockKey" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instance_lock_pkey" PRIMARY KEY ("lockKey")
);

-- CreateIndex
CREATE UNIQUE INDEX "conversation_progress_conversationId_key" ON "conversation_progress"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_sessions_userId_key" ON "whatsapp_sessions"("userId");

-- AddForeignKey
ALTER TABLE "flow_nodes" ADD CONSTRAINT "flow_nodes_kanbanId_fkey" FOREIGN KEY ("kanbanId") REFERENCES "kanbans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flow_nodes" ADD CONSTRAINT "flow_nodes_defaultNextNodeId_fkey" FOREIGN KEY ("defaultNextNodeId") REFERENCES "flow_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_options" ADD CONSTRAINT "node_options_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "flow_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_options" ADD CONSTRAINT "node_options_nextNodeId_fkey" FOREIGN KEY ("nextNodeId") REFERENCES "flow_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_kanbanId_fkey" FOREIGN KEY ("kanbanId") REFERENCES "kanbans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_history" ADD CONSTRAINT "message_history_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_progress" ADD CONSTRAINT "conversation_progress_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_responses" ADD CONSTRAINT "lead_responses_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

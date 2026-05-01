-- AlterTable
ALTER TABLE "whatsapp_sessions" ADD COLUMN "connectionStatus" TEXT NOT NULL DEFAULT 'DISCONNECTED';
ALTER TABLE "whatsapp_sessions" ADD COLUMN "connectedPhone" TEXT;
ALTER TABLE "whatsapp_sessions" ADD COLUMN "lastSeenAt" TIMESTAMP(3);

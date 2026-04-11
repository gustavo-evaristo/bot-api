-- Rename table kanbans -> flows
ALTER TABLE "kanbans" RENAME TO "flows";

-- Remove columns no longer needed
ALTER TABLE "flows" DROP COLUMN IF EXISTS "description";
ALTER TABLE "flows" DROP COLUMN IF EXISTS "imageUrl";

-- Rename foreign key column in flow_nodes: kanbanId -> flowId
ALTER TABLE "flow_nodes" RENAME COLUMN "kanbanId" TO "flowId";

-- Rename foreign key column in conversations: kanbanId -> flowId
ALTER TABLE "conversations" RENAME COLUMN "kanbanId" TO "flowId";

-- Rename the sequence on users relation (if any index/constraint references kanbans)
-- Rename indexes/constraints that reference old column names
DO $$
BEGIN
  -- Rename FK constraint on flow_nodes if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'flow_nodes_kanbanId_fkey'
  ) THEN
    ALTER TABLE "flow_nodes" RENAME CONSTRAINT "flow_nodes_kanbanId_fkey" TO "flow_nodes_flowId_fkey";
  END IF;

  -- Rename FK constraint on conversations if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'conversations_kanbanId_fkey'
  ) THEN
    ALTER TABLE "conversations" RENAME CONSTRAINT "conversations_kanbanId_fkey" TO "conversations_flowId_fkey";
  END IF;

  -- Rename FK constraint on flows (was kanbans) if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'kanbans_userId_fkey'
  ) THEN
    ALTER TABLE "flows" RENAME CONSTRAINT "kanbans_userId_fkey" TO "flows_userId_fkey";
  END IF;
END $$;

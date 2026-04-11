-- Add optional description column to flows table
ALTER TABLE "flows" ADD COLUMN IF NOT EXISTS "description" TEXT;

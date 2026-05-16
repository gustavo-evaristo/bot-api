-- Remove a tabela instance_lock — era usada pelo LeaderElectionService.
-- Com o wa-worker rodando, a coordenacao entre instancias passou a usar
-- o lock granular por userId no Redis (wa:lock:session:*), tornando o
-- leader election em Postgres redundante.
--
-- Pre-requisitos antes de rodar:
--   1. WA_WORKER_ENABLED=true em producao ha pelo menos 24h
--   2. LeaderElectionService removido do codigo do bot-api
--   3. Sem queries esperando essa tabela (grep por instance_lock)
--
-- Execucao:
--   psql "$DATABASE_URL" -f drop-instance-lock.sql
--   OU pelo Supabase SQL Editor.

SELECT
  COUNT(*) AS active_locks,
  MAX("expiresAt") AS latest_expiry
FROM instance_lock
WHERE "expiresAt" > NOW();

-- Se "active_locks" for 0 (ou as locks ja expiraram ha muito), pode dropar:
DROP TABLE IF EXISTS instance_lock;

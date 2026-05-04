-- 1. Cria a tabela companies
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- 2. Adiciona colunas no users (companyId nullable por enquanto)
ALTER TABLE "users"
  ADD COLUMN "avatarUrl" TEXT,
  ADD COLUMN "role"      TEXT NOT NULL DEFAULT 'ADMIN',
  ADD COLUMN "companyId" TEXT;

-- 3. Backfill: cria uma company por usuário existente (cada um vira admin
--    da própria empresa). Em iterações futuras um usuário pode pertencer a
--    uma company já existente via convite.
DO $$
DECLARE u RECORD;
DECLARE new_company_id TEXT;
BEGIN
  FOR u IN SELECT id, name FROM "users" LOOP
    new_company_id := gen_random_uuid()::text;
    INSERT INTO "companies" ("id", "name", "isDeleted", "createdAt", "updatedAt")
      VALUES (
        new_company_id,
        COALESCE(NULLIF(TRIM(u.name), ''), 'Empresa') || ' — Workspace',
        false,
        NOW(),
        NOW()
      );
    UPDATE "users" SET "companyId" = new_company_id WHERE id = u.id;
  END LOOP;
END $$;

-- 4. Agora que todos têm companyId, força NOT NULL + adiciona FK
ALTER TABLE "users" ALTER COLUMN "companyId" SET NOT NULL;

ALTER TABLE "users"
  ADD CONSTRAINT "users_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "companies"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm run dev           # Start with hot-reload
pnpm run build         # Compile with nest build
pnpm run start:prod    # Run compiled build

# Code quality
pnpm run lint          # ESLint with auto-fix
pnpm run format        # Prettier format

# Tests
pnpm run test          # Run all Jest tests (*.spec.ts)
```

Swagger UI is available at `/api` when the server is running.

## Architecture

This project follows **Clean/Hexagonal Architecture** with two main layers:

### Domain Layer (`src/domain/`)

Framework-agnostic business logic. Never import NestJS here.

- `entities/` — Domain entities with business methods and value objects (`UUID`, `Password`)
- `repositories/` — Abstract repository interfaces (contracts only)
- `use-cases/` — One class per business operation; receive repository interfaces via constructor injection

### Infrastructure Layer (`src/infra/`)

NestJS-specific implementations.

- `database/repositories/` — Prisma implementations of domain repository interfaces
- `controllers/` — One controller per use case, thin wrappers that delegate to use cases
- `dtos/` — Request validation via `class-validator`
- `responses/` — Response shape DTOs
- `authentication/` — JWT passport strategy
- `whatsapp/` — WhatsApp Web integration (whatsapp-web.js + Puppeteer + Socket.io)
- `middlewares/` — Global exception filter (`CustomExceptionFilter`)

### Data Flow

`Controller → Use Case → Repository Interface → Prisma Repository → PostgreSQL (Supabase)`

### Dependency Injection

Repository interfaces from `domain/` are bound to Prisma implementations in `infra/database/database.module.ts`. Use cases are provided by their respective NestJS modules and injected into controllers.

## Database

**ORM**: Prisma 7.x with PostgreSQL (Supabase)

**Schema** (`prisma/schema.prisma`): `users → kanbans → stages → stage_contents → answers`

All entities use UUID primary keys. Soft deletes via `isDeleted`; soft deactivation via `isActive`.

After modifying the schema, run:

```bash
npx prisma migrate dev   # Apply and generate migration
npx prisma generate      # Regenerate Prisma client
```

## Domain Entities

- **User** — owns Kanbans; password is a `Password` value object (bcrypt, min 6 chars + special char required)
- **Kanban** — represents a bot flow; must have `phoneNumber` to be activated; supports soft delete and duplication
- **Stage** — ordered steps inside a Kanban
- **StageContent** — content items within a Stage (typed by `contentType`)
- **Answer** — possible answers for a StageContent, each with a `score`

## WhatsApp Integration

Uses `whatsapp-web.js` with Puppeteer for browser automation. On `/whatsapp/start`, a QR code is generated and emitted via Socket.io (`WhatsappGateway`) for the client to scan. Incoming messages are matched to an active Kanban by `phoneNumber` via `findByPhoneNumber()` in the Kanban repository.

## Environment Variables

```
PORT=3000
DATABASE_URL=          # PostgreSQL connection string
JWT_SECRET_KEY=        # JWT signing secret
```

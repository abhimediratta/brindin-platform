# Brindin Platform

Market intelligence and creative production platform purpose-built for Indian digital advertising agencies. Brindin helps agencies scale creative production across India's linguistically fragmented, tier-diverse market — extracting design systems from existing brand creatives, generating region-aware variants, and surfacing actionable market intelligence.

> **Status:** Work-in-progress. Phase 1 infrastructure complete (Sprint 1G). Backend API, Python thumbnail worker, Next.js frontend scaffold, and Docker Compose local dev environment are all functional.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | pnpm workspaces + Turborepo |
| Runtime | Node.js 20+, TypeScript (ES2022, NodeNext) |
| API | Hono (with Node.js adapter) |
| Frontend | Next.js 14 (App Router) |
| Database | PostgreSQL 16 + Drizzle ORM |
| Job Queues | BullMQ + Redis 7 |
| Object Storage | Cloudflare R2 / MinIO (local dev) |
| Python Workers | Python 3.11+, Pillow, BullMQ, FastAPI |
| Local Infra | Docker Compose (Postgres, Redis, MinIO) |
| Validation | Zod (shared schemas) |
| AI (planned) | Anthropic Claude, Sarvam AI |

## Monorepo Structure

```
brindin-platform/
├── packages/
│   ├── backend/       # Hono API server, DB, queues, storage    [active]
│   ├── shared/        # Zod schemas & TypeScript types           [active]
│   ├── frontend/      # Next.js 14 App Router                    [scaffold]
│   └── workers-py/    # Python workers (thumbnails, AI)          [active]
├── docs/
│   ├── prd.md         # Product Requirements Document
│   └── vision.md      # Product Vision
├── turbo.json
├── pnpm-workspace.yaml
└── .env.example
```

## Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 9.x (`corepack enable && corepack prepare pnpm@9.15.4 --activate`)
- **Python** >= 3.11 (for workers-py)
- **Docker** & **Docker Compose** (for local Postgres, Redis, MinIO)
- **Cloudflare R2** bucket (production) or MinIO via Docker Compose (local dev)

## Getting Started

```bash
# Clone & install
git clone <repo-url> && cd brindin-platform
pnpm install

# Start local infrastructure (Postgres, Redis, MinIO)
pnpm dev:infra

# Configure environment
cp .env.example .env
# For local dev, set MinIO values:
#   R2_ENDPOINT=http://localhost:9000
#   R2_ACCESS_KEY=minioadmin
#   R2_SECRET_KEY=minioadmin

# Push database schema
pnpm db:push

# Start backend (port 3001)
pnpm --filter @brindin/backend dev

# Start frontend (port 3000)
pnpm --filter @brindin/frontend dev

# Start Python worker (port 3002 health)
cd packages/workers-py
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m src.main
```

- Backend API: `http://localhost:3001`
- Frontend: `http://localhost:3000`
- MinIO Console: `http://localhost:9001` (minioadmin/minioadmin)

## Scripts

### Root

| Script | Description |
|--------|-------------|
| `pnpm dev` | Run all packages in dev mode (watch) |
| `pnpm dev:infra` | Start Docker Compose services (Postgres, Redis, MinIO) |
| `pnpm dev:stop` | Stop Docker Compose services |
| `pnpm db:push` | Push database schema to Postgres (dev shortcut) |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |

### Backend (`packages/backend`)

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start server with hot reload (`tsx watch`) |
| `pnpm build` | Compile TypeScript |
| `pnpm typecheck` | Type-check without emitting |
| `pnpm db:generate` | Generate Drizzle migration files |
| `pnpm db:migrate` | Run pending migrations |
| `pnpm db:push` | Push schema to DB (dev shortcut) |
| `pnpm db:studio` | Open Drizzle Studio (DB browser) |

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `R2_ENDPOINT` | Yes | Cloudflare R2 endpoint URL |
| `R2_ACCESS_KEY` | Yes | R2 access key ID |
| `R2_SECRET_KEY` | Yes | R2 secret access key |
| `R2_BUCKET` | Yes | R2 bucket name (default: `brindin-assets`) |
| `PORT` | No | Server port (default: `3001`) |
| `API_KEY` | No | API authentication key. If unset, auth is disabled (dev mode) |
| `ANTHROPIC_API_KEY` | No | Anthropic API key (Phase 2+) |
| `SARVAM_API_KEY` | No | Sarvam AI key (Phase 2+) |

## Database

### Schema Overview (14 tables)

The schema supports multi-tenant operation with organization-scoped data:

- **organizations** / **users** — Multi-tenancy and access control
- **brands** — Brand entities with category, geography, and metadata
- **brandCreatives** — Uploaded creative assets with perceptual hashes and analysis
- **designSystems** / **designSystemVersions** — Extracted design systems with versioning
- **regionalVariants** — Region/language-specific design system overrides
- **extractionJobs** / **generationJobs** — Async job tracking with progress
- **generatedVariants** — AI-generated creative outputs with compliance reports
- **intelligenceEntries** — Market intelligence data (geographic, cultural, category)
- **usageEvents** / **usageSummaries** — Usage metering for billing
- **campaignBriefs** — Strategic campaign briefs linking intelligence to generation

Schema source: `packages/backend/src/db/schema.ts`

### Migration Commands

```bash
cd packages/backend
pnpm db:generate   # Create migration from schema changes
pnpm db:migrate    # Apply migrations
pnpm db:push       # Push schema directly (dev only)
pnpm db:studio     # Visual DB browser at https://local.drizzle.studio
```

## API Endpoints (Sprint 1E)

All endpoints (except health) require authentication via `X-API-Key` header or `Authorization: Bearer <key>`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check (no auth) |
| `POST` | `/api/brands` | Create a brand |
| `GET` | `/api/brands` | List brands for current org |
| `GET` | `/api/brands/:id` | Get brand by ID |
| `POST` | `/api/brands/:id/creatives/upload` | Upload creative (multipart/form-data) |
| `GET` | `/api/brands/:id/creatives` | List creatives (paginated: `?limit=&offset=`) |
| `WS` | `/ws/jobs/:jobId` | Real-time job status updates |

**Accepted file types for upload:** `image/jpeg`, `image/png`, `image/webp`, `image/gif`

**Storage key pattern:** `orgs/{orgId}/brands/{brandId}/creatives/{fileId}/{filename}`

## Architecture Notes

### Authentication & Multi-Tenancy
- API key auth via middleware (`X-API-Key` or `Authorization: Bearer`)
- Organization ID derived from auth context and passed to all queries
- In dev mode (no `API_KEY` set), uses a static dev org ID

### Middleware Stack
Request flow: Error Handler → Logger → CORS → Auth → Route Handler

### Job Queues (BullMQ)
Three queues are pre-configured:
- **thumbnails** — Thumbnail generation after creative upload (active)
- **extraction** — Design system extraction from creatives (Phase 1F)
- **generation** — AI creative generation (Phase 2)

Workers process jobs asynchronously; WebSocket endpoint provides real-time status.

### Object Storage
Cloudflare R2 via S3-compatible API. Files are uploaded with org/brand-scoped keys. Download URLs are time-limited signed URLs (1 hour default).

### Shared Package
`@brindin/shared` exports Zod schemas and inferred TypeScript types for all 14 database entities, ensuring type safety between frontend, backend, and workers.

## Project Status

### Completed (Sprint 1G)
- Monorepo scaffolding (pnpm + Turborepo)
- Shared Zod schemas for all entities
- PostgreSQL schema (14 tables) with Drizzle ORM
- Hono API server with auth, CORS, error handling
- Brand CRUD + creative upload/list endpoints
- R2 storage integration with signed URLs
- BullMQ queue infrastructure + WebSocket job updates
- Usage event tracking
- Python thumbnail worker (BullMQ consumer, Pillow resize, S3 upload, Postgres update)
- Docker Compose local dev (PostgreSQL 16, Redis 7, MinIO with auto-bucket creation)
- Next.js 14 frontend scaffold (App Router, layout, home page)

### Planned
- **Phase 2** — Design system extraction pipeline (AI-powered)
- **Phase 3** — Extraction frontend & design system editor
- **Phase 4** — Creative generation pipeline & UI (Anthropic Claude, Sarvam AI)
- **Phase 5** — Festival module, compliance & polish

## Documentation

- [Product Vision](docs/vision.md) — Why Brindin exists and the market opportunity
- [Product Requirements](docs/prd.md) — Detailed problem statement and feature requirements

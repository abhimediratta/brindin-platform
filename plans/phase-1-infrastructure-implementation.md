# Plan: Implement Phase 1B–1G (Infrastructure & Data Layer)

## Context

Phase 1A (monorepo scaffolding) is complete — root configs, workspace setup, and empty package shells exist. No source code has been written yet. This plan covers building the remaining infrastructure: shared schemas, Hono API server, database, brand CRUD, Python worker scaffold, Docker Compose, and a minimal Next.js frontend.

## Current State

**Completed (1A):**
- Root: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.json`, `.env.example`, `.gitignore`
- `packages/backend`: `package.json` (only typescript + tsx deps), `tsconfig.json`
- `packages/shared`: `package.json`, `tsconfig.json`, stub `src/index.ts`
- `packages/frontend`: `package.json` (placeholder scripts), `tsconfig.json`
- `packages/workers-py`: empty directory

**Not started:** Everything in 1B through 1G — no source code, no database schema, no Docker Compose, no API routes.

---

## Implementation Order

Sequential: **1B → 1G → 1C → 1D → 1E → 1F**

Rationale: 1G (Docker Compose) moves earlier because Postgres/Redis/MinIO must be running before we can test the server, push the DB schema, or test uploads.

---

## Step 1B: `packages/shared` — Zod Schemas & Types

**Add dependency:** `zod` to `packages/shared`

**Create files:**
```
packages/shared/src/
  schemas/
    common.ts           — uuid, timestamp, slug primitives
    organization.ts
    user.ts
    brand.ts            — brandCreateSchema, brandSchema
    brand-creative.ts
    design-system.ts    — nested schemas for color palette, typography, layouts, etc.
    extraction-job.ts
    generation-job.ts
    generated-variant.ts
    intelligence.ts     — confidenceTier 1-4, sourceType enum
    usage.ts            — usage event + summary schemas
    campaign-brief.ts
  index.ts              — barrel re-export all schemas + types
```

Every schema file exports: a Zod schema + a `z.infer<>` TypeScript type. Schemas match the SQL reference in `plans/phase-1-curated-foundation.md:530-780`.

**Verify:** `pnpm --filter @brindin/shared build` compiles cleanly.

---

## Step 1G: Docker Compose & Frontend Scaffold (moved earlier)

**Create `docker-compose.yml`** at project root:
- `postgres:16-alpine` on port 5432
- `redis:7-alpine` on port 6379
- `minio/minio:latest` on ports 9000 (API) + 9001 (console)
- `minio-init` sidecar to auto-create `brindin-assets` bucket

**Next.js frontend scaffold** in `packages/frontend`:
- Add deps: `next@14`, `react`, `react-dom`, `@types/react`, `@types/react-dom`
- Rewrite `tsconfig.json` — remove `extends` from root (incompatible with Next.js bundler resolution), add Next.js-specific settings (jsx preserve, dom lib, bundler moduleResolution, path aliases)
- Create `next.config.js` with `transpilePackages: ['@brindin/shared']`
- Create minimal `src/app/layout.tsx` + `src/app/page.tsx`
- Update scripts: `dev` → `next dev --port 3000`, `build` → `next build`

**Root package.json updates:**
- Add `dev:infra` → `docker compose up -d`
- Add `dev:stop` → `docker compose down`
- Add `db:push` → `pnpm --filter @brindin/backend db:push`

**Verify:** `docker compose up -d` starts all 3 infra services. `http://localhost:9001` shows MinIO console with `brindin-assets` bucket.

---

## Step 1C: `packages/backend` — Hono API Server ✅ COMPLETED

All dependencies added, all source files created, typecheck passes.

**Files created:**
- `src/lib/env.ts` — Zod-validated env config (R2_*, DATABASE_URL, REDIS_URL, PORT, API_KEY)
- `src/lib/storage.ts` — R2 storage via S3Client (uploadFile, getSignedDownloadUrl, deleteFile)
- `src/lib/queue.ts` — BullMQ queues (thumbnails, extraction, generation) + createWorker factory
- `src/server/types.ts` — AppEnv type (orgId on context)
- `src/server/index.ts` — Hono app wiring middleware, routes, WS, serve()
- `src/server/ws.ts` — WebSocket upgrade route /ws/jobs/:jobId
- `src/server/middleware/cors.ts` — CORS with X-API-Key header
- `src/server/middleware/logger.ts` — Request logging
- `src/server/middleware/error-handler.ts` — Global error handler (HTTPException-aware)
- `src/server/middleware/auth.ts` — API key auth with dev mode fallback
- `src/server/routes/health.ts` — GET /api/health → { status: "ok", timestamp }

---

## Step 1D: Database Schema & Migrations (Drizzle)

**Create `packages/backend/drizzle.config.ts`** — schema path, out dir, pg dialect, DATABASE_URL credential.

**Create `packages/backend/src/db/schema.ts`** — all 14 tables via `pgTable()`:
- `organizations`, `users`, `brands`, `brand_creatives`
- `design_systems`, `design_system_versions`, `regional_variants`
- `extraction_jobs`, `generation_jobs`, `generated_variants`
- `intelligence_entries` (+ 4 indexes)
- `usage_events` (+ 3 indexes), `usage_summaries`
- `campaign_briefs`

Key Drizzle translation notes:
- `TEXT[]` → `text('col').array()`
- `JSONB` → `jsonb('col')`
- `NUMERIC` → `numeric('col')`
- `BIGINT` → `bigint('col', { mode: 'number' })`
- Composite uniques via table-level config (3rd arg to `pgTable`)
- All FK references use inline `.references(() => table.id)`

**Create `packages/backend/src/db/index.ts`** — `pg.Pool` + `drizzle(pool, { schema })` export.

**Add scripts** to backend `package.json`: `db:generate`, `db:migrate`, `db:push`, `db:studio`.

**Verify:** `pnpm --filter @brindin/backend db:push` applies schema to Postgres. `db:studio` shows all 14 tables.

---

## Step 1E: Brand Module & Creative Upload

**Create files:**
```
packages/backend/src/
  lib/
    usage.ts            — recordUsageEvent(orgId, brandId, eventType, quantity, unit, ...)
  modules/
    brand/
      routes.ts         — POST/GET /api/brands, GET /:id, POST /:id/creatives/upload, GET /:id/creatives
      service.ts        — createBrand, getBrands, getBrandById, uploadCreative, getCreatives
```

**Routes:**
- `POST /api/brands` — validate with `brandCreateSchema`, insert, return 201
- `GET /api/brands` — list brands for org (filtered by orgId from auth)
- `GET /api/brands/:id` — get single brand
- `POST /api/brands/:id/creatives/upload` — multipart parse, upload each file to S3 (`brands/{brandId}/creatives/{uuid}-{filename}`), insert `brand_creatives` row, record `storage_upload` usage event, dispatch thumbnail BullMQ job
- `GET /api/brands/:id/creatives` — list creatives for brand

**Register routes** in `server/index.ts`: `app.route('/api/brands', brandRoutes)`

**Auth:** Simple API key + hardcoded default org for dev. Auth middleware resolves orgId and sets it on Hono context.

**Verify:** Full curl flow — create brand → upload images → list creatives → check MinIO for files.

---

## Step 1F: `packages/workers-py` — Python Worker Scaffold

**Create files:**
```
packages/workers-py/
  requirements.txt      — Pillow, scikit-learn, imagehash, rembg, playwright, redis, fastapi, uvicorn, boto3, python-dotenv
  Dockerfile            — python:3.11-slim, install deps + Playwright Chromium
  src/
    __init__.py
    main.py             — Redis consumer (BRPOP on BullMQ queue keys) + health server thread
    config.py           — env vars from dotenv
    health.py           — FastAPI app with GET /health
    preprocessing/
      __init__.py
      thumbnails.py     — download from S3 via boto3, Pillow resize to 300px, upload thumbnail, publish completion
```

**BullMQ interop approach:** Use `bullmq` Python package if reliable, otherwise raw Redis BRPOP on `bull:thumbnails:wait` + `HGETALL bull:thumbnails:{jobId}` for job data.

**Verify:** Start worker, upload a creative via API, confirm thumbnail appears in MinIO.

---

## Config Changes to Existing Files

| File | Change |
|------|--------|
| `packages/shared/package.json` | Add `zod` to dependencies |
| `packages/backend/package.json` | Add ~10 production deps + 2 dev deps + db scripts |
| `packages/frontend/package.json` | Add next/react deps, update scripts |
| `packages/frontend/tsconfig.json` | Rewrite for Next.js (remove extends, add dom lib, bundler resolution) |
| `root package.json` | Add dev:infra, dev:stop, db:push convenience scripts |

## Verification (End-to-End)

1. `docker compose up -d` — Postgres, Redis, MinIO running
2. `pnpm --filter @brindin/backend db:push` — 14 tables created
3. `pnpm dev` — backend on :3001, frontend on :3000
4. `curl POST /api/brands` — creates a brand
5. `curl POST /api/brands/:id/creatives/upload` with images — files in MinIO
6. `GET /api/brands/:id/creatives` — lists uploaded creatives with URLs
7. Python worker processes thumbnail job — thumbnail appears in MinIO

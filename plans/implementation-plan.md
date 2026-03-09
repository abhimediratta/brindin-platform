# Brindin Platform - Implementation Plan

## Context

Building the Brindin creative production platform for Indian advertising markets from scratch. The codebase is entirely greenfield — only strategic docs exist (`docs/vision.md`, `docs/prd.md`, `plans/phase-1-curated-foundation.md`). No code, config, or infrastructure.

The phase-1 plan defines an 18-week, 7-sprint roadmap. This implementation plan breaks it into **5 executable phases** that can be built incrementally, each producing a working milestone.

---

## Phase 1: Project Scaffolding & Infrastructure (Sprint 1, Weeks 1-3)

**Goal:** Monorepo setup, database, storage, job queue, basic brand CRUD — everything needed before any business logic.

### 1A: Monorepo & Config Setup

**Status: COMPLETED**

- [x] Initialize git repo
- [x] `pnpm-workspace.yaml` with 4 packages: `backend`, `workers-py`, `frontend`, `shared`
- [x] Root `package.json` with workspace scripts
- [x] `turbo.json` for build orchestration
- [x] Root `tsconfig.json` (base config)
- [x] `.env.example` with all required env vars (Anthropic, Sarvam, R2/S3, Postgres, Redis)
- [x] `.gitignore`

### 1B: `packages/shared` — Shared Types & Schemas

**Status: COMPLETED**

- [x] Added `zod ^3.23.0` to `packages/shared/package.json`
- [x] `schemas/common.ts` — reusable primitives (uuid, timestamp, slug, dimensions, hexColor, url, jsonb)
- [x] `schemas/organization.ts` — organizationSchema + ORG_PLANS enum
- [x] `schemas/user.ts` — userSchema + USER_ROLES enum
- [x] `schemas/brand.ts` — brandSchema full/create/update triplet
- [x] `schemas/brand-creative.ts` — brandCreativeSchema
- [x] `schemas/design-system.ts` — 10 JSONB sub-schemas, designSystem/version/regionalVariant schemas, 4 enums
- [x] `schemas/extraction-job.ts` — extractionJobSchema + 7-status pipeline enum
- [x] `schemas/generation-job.ts` — generationJobSchema + 6-status pipeline enum
- [x] `schemas/generated-variant.ts` — generatedVariantSchema + copyContent + VARIANT_STATUSES/COPY_APPROACHES enums
- [x] `schemas/intelligence.ts` — intelligenceEntrySchema + DIMENSIONS/ENTRY_TYPES/CONFIDENCE_TIERS enums
- [x] `schemas/usage.ts` — usageEventSchema + usageSummarySchema + EVENT_TYPES/UNITS enums
- [x] `schemas/campaign-brief.ts` — campaignBriefSchema + timePeriod/evidenceCitation sub-schemas
- [x] `schemas/index.ts` barrel re-export + `src/index.ts` updated
- [x] Build verified — all `.js` + `.d.ts` files generated in `dist/`

### 1C: `packages/backend` — Hono API Server

**Status: COMPLETED**

- [x] `package.json` with deps: `hono`, `drizzle-orm`, `drizzle-kit`, `bullmq`, `@aws-sdk/client-s3`, `zod`, `pg`
- [x] Hono server entry point (`src/server/index.ts`)
- [x] Zod-validated env config (`src/lib/env.ts`)
- [x] Middleware: CORS, error handler, request logging, API key auth
- [x] Health check route (`GET /api/health`)
- [x] R2 storage abstraction (`src/lib/storage.ts`): upload, download, presigned URLs
- [x] BullMQ queue setup (`src/lib/queue.ts`): queue instances + createWorker factory
- [x] WebSocket setup for job progress (`src/server/ws.ts`)
- [x] Typecheck passes with zero errors

### 1D: Database Schema & Migrations (Drizzle) ✅
- [x] Drizzle config (`drizzle.config.ts`)
- [x] All 14 tables via Drizzle schema (`src/db/schema.ts`):
  - `organizations`, `users`, `brands`, `brand_creatives`
  - `design_systems`, `design_system_versions`, `regional_variants`
  - `extraction_jobs`, `generation_jobs`, `generated_variants`
  - `intelligence_entries`, `usage_events`, `usage_summaries`, `campaign_briefs`
- [x] Generate initial migration (`drizzle-kit generate` — 14 tables, 19 FKs, 7 indexes)
- [x] DB connection helper (`src/db/index.ts`)
- [x] Added `db:generate`, `db:migrate`, `db:push`, `db:studio` scripts
- [x] Typecheck passes with zero errors

### 1E: Brand Module & Creative Upload

**Status: COMPLETED**

- [x] Brand CRUD routes: `POST/GET /api/brands`, `GET /api/brands/:id`
- [x] Creative upload: `POST /api/brands/:id/creatives/upload` (multipart -> S3, create DB record)
- [x] Creative list: `GET /api/brands/:id/creatives`
- [x] Usage recording utility (`src/lib/usage.ts`): `recordUsageEvent()` helper
- [x] Instrument upload with `storage_upload` usage event

### 1F: `packages/workers-py` — Python Worker Scaffold
- `requirements.txt`: Pillow, scikit-learn, imagehash, rembg, playwright, redis, bullmq (or redis BRPOP)
- `Dockerfile`
- `src/main.py`: Redis consumer / BullMQ listener
- `src/preprocessing/thumbnails.py`: receive job, download from S3, resize via Pillow, upload thumbnail
- Health endpoint via FastAPI

### 1G: Docker Compose & Local Dev
- `docker-compose.yml`: PostgreSQL 16, Redis 7, MinIO (S3-compatible local dev)
- `packages/frontend`: Next.js 14 App Router scaffold (bare minimum — layout, home page, tailwind, radix)
- README with setup instructions

**Milestone:** `docker compose up` starts all services. Create brand via API, upload 50 images, thumbnails auto-generated in S3.

---

## Phase 2: Design System Extraction Pipeline (Sprint 2, Weeks 4-6)

**Goal:** Full 4-stage extraction pipeline working end-to-end via API.

### 2A: Stage 1 — Preprocessing Worker (Python)
- `src/preprocessing/validator.py`: format validation (JPEG/PNG/WebP), reject >25MB, exclude <200x200
- `src/preprocessing/phash.py`: perceptual hashing via `imagehash`, duplicate detection (hamming distance <5)
- `src/preprocessing/thumbnails.py`: 300px wide thumbnails via Pillow
- Store results in Redis for pipeline resumability
- Update `brand_creatives` rows with phash, dimensions, exclusion status

### 2B: Stage 2 — Individual Analysis (Parallel: Python + Node)
- **Python worker** — `src/color/extractor.py`:
  - Resize to 200x200
  - k-means (scikit-learn) in Lab color space, extract top 8 colors
  - Calculate pixel percentages, identify background color from border pixels
  - Convert to HSL, Lab, Hex
  - Store in `brand_creatives.color_analysis` JSONB
- **Node worker** — `src/workers/claude-vision.ts`:
  - Claude Haiku 4.5 batched analysis (3-5 images per API call)
  - Prompt from plan: layout, typography, image treatment, copy patterns, logo, platform estimate
  - Prompt caching enabled (same analysis prompt reused)
  - Retry logic with exponential backoff
  - Store in `brand_creatives.analysis` JSONB
- **Node worker** — `src/workers/text-extraction.ts`:
  - Claude Vision OCR + language identification

### 2C: Stage 3 — Aggregation Engine (Node)
- `src/modules/design-system/aggregation.ts`:
  - Color palette clustering: DBSCAN in Lab space, centroid, frequency, semantic roles
  - Typography aggregation: group by type, dominant families, size hierarchy, density
  - Layout frequency analysis: normalize to canonical types, frequency counts
  - Copy pattern analysis: tone, language mix, CTA patterns
  - Inconsistency detection: color drift, layout/typography/tone inconsistencies

### 2D: Stage 4 — Synthesis (Node)
- `src/workers/synthesis.ts`:
  - Single Claude Sonnet 4.6 call with all aggregated data
  - Output: structured DesignSystem JSON matching Zod schema
  - Per-dimension confidence scoring (strong/moderate/emerging)
  - Onboarding guide (markdown)
  - Inconsistency report with creative references

### 2E: Pipeline Orchestration
- `src/modules/design-system/orchestrator.ts`:
  - Multi-stage job orchestration: preprocessing -> (color + vision in parallel) -> aggregation -> synthesis
  - Progress tracking: each stage updates Redis, WebSocket broadcasts
- API routes:
  - `POST /api/brands/:id/design-system/extract` — trigger extraction
  - `GET /api/brands/:id/design-system` — get current design system
  - `WS /ws/jobs/:jobId` — real-time progress
- Store results: DesignSystem row in Postgres, per-creative analysis in `brand_creatives`
- Instrument: `extraction` event, `ai_api_call` events with token counts

**Milestone:** `POST /api/brands/:id/design-system/extract` returns structured design system in <10 min for 50 images.

---

## Phase 3: Extraction Frontend & Design System Editor (Sprint 3, Weeks 7-9)

**Goal:** Full browser-based extract-review-edit-approve workflow.

### 3A: Dashboard Shell
- Next.js app layout: sidebar nav, brand list, brand detail
- API client (`src/lib/api.ts`): typed fetch wrapper
- TanStack Query setup for data fetching
- Zustand stores for UI state

### 3B: Brand Management UI
- Brand list page with create brand dialog
- Brand detail page with tabs: Creatives, Design System, Variants

### 3C: Creative Upload & Gallery
- Drag-and-drop upload zone (multipart upload to API)
- Upload progress bars
- Grid view of uploaded creatives with thumbnails
- Exclusion indicators (duplicates, quality issues)

### 3D: Extraction UI
- Extraction trigger button
- Real-time progress bar via WebSocket
- Stage indicators (preprocessing -> analyzing -> aggregating -> synthesizing)

### 3E: Design System Viewer & Editor
- **Viewer:** Color swatches, typography samples, layout frequency chart, copy pattern summary, confidence badges
- **Editor:**
  - Color palette: add/remove/edit colors, assign roles (primary/secondary/accent/bg/text)
  - Typography: edit font families, size hierarchy, density
  - Layout rules: approve/reject/reorder layout structures
  - Copy guidelines: tone, CTA conventions, language preferences
  - Logo rules: placement, sizing
- Version history: snapshot on save, view/restore previous versions
- Approval workflow: draft -> review -> approved status transitions

### 3F: Regional Variants
- Create variant for region + language + tier
- Edit override fields (color, typography, copy overrides, cultural notes)

### 3G: Design System API Completion
- `PATCH /api/brands/:id/design-system` — manual edits
- `POST /api/brands/:id/design-system/versions` — snapshot version
- `GET /api/brands/:id/design-system/versions` — list versions
- `POST /api/brands/:id/design-system/variants` — create regional variant
- `PATCH /api/brands/:id/design-system/variants/:vid` — update variant

**Milestone:** Full extract-review-edit-approve flow in browser. Regional variants for Hindi/English.

---

## Phase 4: Creative Generation Pipeline & UI (Sprints 4-5, Weeks 10-15)

**Goal:** Template-based creative generation with intelligence integration.

### 4A: HTML/CSS Template System
- Template definition schema (JSON metadata + HTML/CSS per template)
- Build 10-15 templates across categories:
  - product-hero (2-3), lifestyle (2), testimonial (2), offer-led (2-3), social-proof (1-2), split-layout (1-2), text-overlay (1-2)
- CSS variable system for brand customization (`--brand-primary`, `--brand-secondary`, `--font-heading`, etc.)
- Slot system: image, text, logo, shape, badge with roles

### 4B: Background Removal Worker (Python)
- `src/background/remover.py`: rembg processing
- Quality detection for processed images

### 4C: Playwright Rendering Worker (Python)
- `src/renderer/renderer.py`:
  - Install Chromium via Playwright
  - Load HTML with injected CSS variables, data URIs, text content
  - Screenshot at 2x device pixel ratio
  - Optimize PNG via Pillow
  - Upload to S3/R2
- Devanagari font loading: Noto Sans Devanagari, Mukta, Poppins, Tiro Devanagari Hindi

### 4D: Copy Generation & Translation (Node)
- `src/workers/copy-generation.ts`:
  - Claude generates copy variants (2-3 approaches per template: offer-led, benefit-led, question hook, social proof)
  - Respects design system copy guidelines (tone, language, CTA conventions)
- `src/workers/sarvam-translation.ts`:
  - Sarvam AI translation for Hindi/regional versions
  - Transliteration for brand names across scripts

### 4E: Design System Constraint Engine (Node)
- `src/modules/creative-gen/constraint-engine.ts`:
  - Map brand colors/fonts/rules to CSS variables
  - Template selection based on brand's dominant layout patterns
  - Logo placement per design system rules

### 4F: Variant Selection & Generation Orchestration
- `src/modules/creative-gen/variant-selector.ts`:
  - Ensure diversity: layout x copy approach x visual emphasis x color scheme
  - 4-8 variants covering at least 3 distinct creative approaches
- `src/modules/creative-gen/orchestrator.ts`:
  - Job orchestration: copy gen + image preprocessing (parallel) -> rendering -> upload
  - Rationale generation per variant
- API routes:
  - `POST /api/generate` — trigger generation
  - `GET /api/generate/:jobId/status` — poll status
  - `GET /api/generate/:jobId/variants` — get variants
- Instrument: `generation` event, `ai_api_call` events

### 4G: Generation Frontend
- Brand + design system selector (auto-loaded)
- Product image upload
- Platform selector (Instagram feed/story, Facebook, Google Display) + dimensions
- Target region + language selector
- Additional instructions text field
- Generate button + WebSocket progress
- Variant gallery: grid with expandable rationale
- Variant actions: select, reject, regenerate, download

### 4H: Market Intelligence Module
- Intelligence CRUD API (`src/modules/intelligence/`)
- API endpoints:
  - `GET /api/intelligence/geographic/:state`
  - `GET /api/intelligence/festival/:festival`
  - `GET /api/intelligence/category/:vertical`
- Admin seed scripts for importing compiled data
- Confidence tier badges on all intelligence data
- Integration into generation pipeline:
  - When target region selected, fetch intelligence
  - Auto-adjust copy tone, language mix, price framing
  - Include intelligence citations in variant rationale

**Milestone:** `POST /api/generate` returns 4-8 PNG variants with rationale in <3 min. Intelligence affects output.

---

## Phase 5: Festival Module, Compliance & Polish (Sprints 6-7, Weeks 16-18)

**Goal:** Festival-specific generation, compliance checker, production readiness.

### 5A: Festival Intelligence
- Festival intelligence API endpoints
- Data structure per plan: cultural significance, emotional tone, approved/avoided colors & motifs, sensitivity rules
- Festival-specific HTML/CSS templates (festival color palettes, motif overlays)

### 5B: Festival Generation Workflow
- Brand + festival + regions -> region-adapted festival variants
- Cultural sensitivity checks as hard blockers
- Festival date computation from Hindu lunar calendar

### 5C: Brand Compliance Checker
- `POST /api/evaluate` endpoint
- Upload any creative, check against design system:
  - Color compliance
  - Typography check
  - Logo placement verification
  - Copy tone analysis
  - Cultural sensitivity checks (hard blockers)
- Structured evaluation output: pass/fail per rule
- Basic compliance UI

### 5D: Campaign Brief Generator
- Claude-powered, informed by intelligence + design system
- Structured brief output with evidence citations

### 5E: Usage Metering & Dashboard
- Cron job to roll up `usage_events` into `usage_summaries` monthly
- Basic usage dashboard: per-org and per-brand consumption

### 5F: Polish & Validation
- End-to-end testing with 5-10 real brand sets
- Performance optimization (extraction <10 min, generation <3 min)
- Edge cases: <20 creatives, inconsistent brands, missing images, large files
- Frontend polish: loading states, error states, empty states, responsive layout
- Devanagari validation across all templates
- Error handling: graceful failures, retry logic, user-facing messages
- Basic monitoring: Sentry for errors, health checks

**Milestone:** Phase 1 exit criteria met. Ready for Phase 2 (early agency partners).

---

## Key Files to Create (Summary)

```
brindin-platform/
  package.json
  pnpm-workspace.yaml
  turbo.json
  docker-compose.yml
  .env.example
  .gitignore

  packages/
    shared/
      package.json, tsconfig.json
      src/schemas/    (brand, design-system, creative, intelligence, jobs)
      src/types/

    backend/
      package.json, tsconfig.json, drizzle.config.ts
      src/
        server/index.ts, ws.ts
        db/schema.ts, index.ts
        lib/storage.ts, queue.ts, usage.ts
        modules/
          brand/routes.ts, service.ts
          design-system/routes.ts, orchestrator.ts, aggregation.ts
          creative-gen/routes.ts, orchestrator.ts, constraint-engine.ts, variant-selector.ts
          intelligence/routes.ts, service.ts, seed.ts
          evaluation/routes.ts, checker.ts
        workers/
          claude-vision.ts, synthesis.ts, copy-generation.ts
          text-extraction.ts, sarvam-translation.ts
      drizzle/    (migration files)

    workers-py/
      Dockerfile, requirements.txt
      src/
        main.py
        preprocessing/validator.py, phash.py, thumbnails.py
        color/extractor.py
        background/remover.py
        renderer/renderer.py

    frontend/
      package.json, next.config.js, tailwind.config.ts
      src/
        app/layout.tsx, page.tsx
        app/brands/page.tsx, [id]/page.tsx
        app/generate/page.tsx
        components/   (upload, design-system viewer/editor, variant gallery, etc.)
        lib/api.ts, hooks/, stores/
```

## Verification Plan

After each phase:

1. **Phase 1:** `docker compose up` -> create brand via curl -> upload images -> verify thumbnails in MinIO
2. **Phase 2:** Trigger extraction on 50 test creatives -> verify structured design system JSON in <10 min
3. **Phase 3:** Full browser flow: create brand -> upload -> extract -> edit design system -> approve -> create regional variant
4. **Phase 4:** Generate 4-8 variants from approved design system -> verify PNG output with rationale -> verify intelligence affects copy/tone
5. **Phase 5:** Generate festival variants -> run compliance check -> verify usage dashboard

## Tech Stack Reference

| Layer | Choice |
|-------|--------|
| API server | Hono (Node.js/TS) |
| ORM | Drizzle |
| Job queue | BullMQ + Redis |
| Image processing | Pillow + scikit-learn (Python) |
| Background removal | rembg (Python) |
| Creative rendering | Playwright headless Chromium (Python) |
| Frontend | Next.js 14 + Zustand + TanStack Query + Radix + Tailwind |
| Database | PostgreSQL 16 |
| Cache/Queue | Redis 7 |
| Object storage | Cloudflare R2 / MinIO (local) |
| AI - Analysis/Synthesis | Claude Haiku 4.5 + Sonnet 4.6 |
| AI - Translation | Sarvam AI |

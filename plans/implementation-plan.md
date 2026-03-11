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
- [x] `.env.example` with all required env vars (`ANTHROPIC_API_KEY`, `GOOGLE_GENAI_API_KEY`, `SARVAM_API_KEY`, R2/S3, Postgres, Redis)
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

**Status: COMPLETED**

- [x] `requirements.txt`: Pillow, scikit-learn, imagehash, rembg, playwright, bullmq, boto3, psycopg2, FastAPI, uvicorn
- [x] `Dockerfile` (python:3.11-slim with Pillow system deps + Playwright Chromium)
- [x] `.gitignore` for .venv, __pycache__, *.pyc
- [x] `src/main.py`: BullMQ Worker on `thumbnails` queue + FastAPI health server on :3002
- [x] `src/config.py`: env vars from root `.env` via python-dotenv
- [x] `src/health.py`: `GET /health` endpoint
- [x] `src/db.py`: `update_creative_thumbnail()` via psycopg2
- [x] `src/preprocessing/thumbnails.py`: S3 download → Pillow resize 300px → WebP → S3 upload
- [x] Thumbnail key pattern: `{dir}/thumb.webp` (fixed name within creative UUID directory)

### 1G: Docker Compose & Local Dev

**Status: COMPLETED**

- [x] `docker-compose.yml`: PostgreSQL 16, Redis 7, MinIO (S3-compatible), minio-init sidecar
- [x] `.env.example` updated with MinIO local dev values
- [x] Root `package.json` scripts: `dev:infra`, `dev:stop`, `db:push`
- [x] `packages/frontend`: Next.js 14 App Router scaffold (layout, page, globals.css)
- [x] Frontend `tsconfig.json` rewritten for Next.js bundler mode
- [x] `next.config.js` with `transpilePackages: ['@brindin/shared']`

**Milestone:** `docker compose up` starts all services. Create brand via API, upload images, thumbnails auto-generated in S3.

---

## Phase 2: Design System Extraction Pipeline (Sprint 2, Weeks 4-6) ✅ COMPLETED

**Goal:** Full 4-stage extraction pipeline working end-to-end via API.

### 2A: Stage 1 — Preprocessing Worker (Python)

**Status: COMPLETED**

- [x] `src/preprocessing/validator.py`: format validation (JPEG/PNG/WebP), reject >25MB, exclude <200x200
- [x] `src/preprocessing/phash.py`: perceptual hashing via `imagehash`, duplicate detection (hamming distance <5)
- [x] `src/preprocessing/thumbnails.py`: 300px wide thumbnails via Pillow
- [x] Store results in Redis for pipeline resumability
- [x] Update `brand_creatives` rows with phash, dimensions, exclusion status

### 2B: Stage 2 — Individual Analysis (Parallel: Python + Node)

**Status: COMPLETED**

- [x] **Python worker** — `src/color/extractor.py`:
  - Resize to 200x200
  - k-means (scikit-learn) in Lab color space, extract top 8 colors
  - Calculate pixel percentages, identify background color from border pixels
  - Convert to HSL, Lab, Hex
  - Store in `brand_creatives.color_analysis` JSONB
- [x] **Python worker** — `src/color/processor.py`: BullMQ job handler for color extraction
- [x] **Shared progress utility** — `src/progress.py`: extracted `signal_stage_progress` from preprocessing
- [x] **DB helper** — `update_creative_color_analysis` added to `src/db.py`
- [x] **Color worker registered** in `src/main.py` on queue `color-extraction`
- [x] **Node worker** — `src/workers/claude-vision.ts`:
  - Claude Haiku 4.5 batched analysis (3-5 images per API call)
  - Prompt from plan: layout, typography, image treatment, copy patterns, logo
  - Prompt caching enabled (system prompt with cache_control ephemeral)
  - Rate limiter: 10 jobs/min, concurrency 3
  - Store in `brand_creatives.analysis` JSONB
  - Usage event recording (model, input/output tokens)
- [x] **Vision worker registered** in `src/workers/start.ts`
- **Node worker** — `src/workers/text-extraction.ts`:
  - Claude Vision OCR + language identification (deferred to later phase)

### 2C: Stage 3 — Aggregation Engine (Node)

**Status: COMPLETED**

- [x] `src/modules/design-system/aggregation.ts`:
  - Color palette clustering: greedy CIE76 deltaE (<15) in Lab space, centroid, frequency, semantic roles
  - Typography aggregation: group by type (serif/sans/display), dominant families, frequency
  - Layout frequency analysis: normalize to canonical types, frequency counts
  - Copy pattern analysis: tone, CTA patterns, structure patterns
  - Inconsistency detection: color drift, layout/typography/tone/image inconsistencies

### 2D: Stage 4 — Synthesis (Node)

**Status: COMPLETED**

- [x] `src/modules/design-system/synthesis.ts`:
  - Single Claude Sonnet 4.6 call with all aggregated data
  - Output: structured DesignSystem JSON matching Zod schema
  - Per-dimension confidence scoring (strong/moderate/emerging)
  - Onboarding guide + inconsistency report with recommendations
  - Token budget guards: 5k output cap, 60k input guard, retry budget check, truncation detection
  - Fallback to deterministic output if AI fails
- [x] `src/lib/usage.ts`: `calculateCostMicrodollars()` with per-model pricing (Haiku + Sonnet)
- [x] Cost tracking wired into vision-analysis worker and synthesis — `costMicrodollars` stored in DB + metadata

### 2E: Pipeline Orchestration

**Status: COMPLETED**

- [x] `src/modules/design-system/extraction.service.ts`: DB operations for extraction jobs, creatives, design systems
- [x] `src/modules/design-system/orchestrator.ts`:
  - Multi-stage job orchestration: preprocessing -> (color + vision in parallel) -> aggregation -> synthesis
  - Progress tracking: each stage updates Redis, WebSocket broadcasts
- [x] `src/workers/extraction-orchestrator.ts`: BullMQ worker on extraction queue (concurrency 2)
- [x] API routes (`src/server/routes/extraction.ts`):
  - `POST /api/brands/:id/design-system/extract` — trigger extraction (409 if active job)
  - `GET /api/brands/:id/design-system` — get current design system
  - `GET /api/brands/:id/extraction-jobs/:jobId` — get job status
  - `WS /ws/jobs/:jobId` — real-time progress
- [x] Store results: DesignSystem row in Postgres, per-creative analysis in `brand_creatives`
- [x] Instrument: `extraction` event, `ai-inference` events with token counts + cost

**Milestone:** `POST /api/brands/:id/design-system/extract` returns structured design system in <10 min for 50 images.

---

## Phase 2F: Multi-Provider AI Layer

**Status: COMPLETED**

**Goal:** Refactor the extraction pipeline to support multiple AI providers (Gemini 2.5 Pro, Claude, Sarvam AI) with task-based routing and fallback chains, before frontend work begins.

### 2F-1: AI Abstraction Layer

- [x] New module `packages/backend/src/lib/ai/` with:
  - `types.ts` — Provider-agnostic types: `AIProvider`, `AITask`, `VisionRequest`/`VisionResponse`, `SynthesisRequest`/`SynthesisResponse`, `TranslationRequest`/`TranslationResponse`
  - `router.ts` — Task-based routing: maps each `AITask` to a primary provider + fallback chain, handles retries and provider failover
  - `pricing.ts` — Unified cost calculation for Claude, Gemini, and Sarvam (replaces `MODEL_PRICING` in `usage.ts`)
  - `providers/claude.ts` — Anthropic SDK wrapper (extracted from existing `claude-vision.ts` and `synthesis.ts`)
  - `providers/gemini.ts` — `@google/generative-ai` SDK wrapper for Gemini 2.5 Pro
  - `providers/sarvam.ts` — REST client (plain `fetch`) for Sarvam AI endpoints
  - `index.ts` — Barrel export

### 2F-2: Gemini Vision Integration

- [x] Refactor `claude-vision.ts` → `vision-analysis.ts` to use the AI router
- [x] **Primary:** Gemini 2.5 Pro for batched image analysis (layout, typography, image treatment, copy patterns, logo detection)
- [x] **Fallback:** Claude Haiku 4.5 if Gemini fails or rate-limits
- [x] Maintain existing output schema — no downstream changes to aggregation/synthesis
- [x] Usage event recording for both providers (model, input/output tokens, cost)

### 2F-3: Gemini Synthesis Fallback

- [x] Refactor `synthesis.ts` to use the AI router
- [x] **Primary:** Claude Sonnet 4.6 for design system synthesis (unchanged)
- [x] **Fallback:** Gemini 2.5 Pro if Claude fails or exceeds budget
- [x] Same token budget guards and structured output validation for both providers

### 2F-4: Sarvam AI Client + Translation Queue

- [x] New BullMQ queue `translation` for async translation jobs
- [x] `providers/sarvam.ts` — Translation + transliteration endpoints
- [x] Translation worker: picks jobs from queue, calls Sarvam, stores results
- [x] Rate limiting (5 req/60s) for Sarvam API

### 2F-5: Regional Variant Pipeline

- [x] Wire `regional_variants` table with Sarvam-powered translation/transliteration
- [x] Auto-translate design system copy guidelines for regional variants
- [x] Transliterate brand names across scripts (Latin ↔ Devanagari, etc.)
- [x] Store translated/transliterated content in `regional_variants` override fields
- [x] API routes: `POST/GET /api/brands/:id/design-system/variants`

**Milestone:** Extraction pipeline runs with Gemini 2.5 Pro as primary vision model, Claude as fallback. Translation queue operational for regional variants.

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
  - Gemini 2.5 Pro generates alternative copy variants (different "voice" for diversity — run in parallel with Claude)
  - Respects design system copy guidelines (tone, language, CTA conventions)
- `src/workers/brand-compliance.ts`:
  - Gemini 2.5 Pro for brand compliance checking (cheap structured verification against design system rules)
  - Validates generated copy against brand tone, CTA conventions, and cultural guidelines
- `src/workers/sarvam-translation.ts`:
  - Sarvam AI translation for Hindi/regional versions (via translation queue from Phase 2F)
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
        lib/ai/
          index.ts, types.ts, router.ts, pricing.ts
          providers/claude.ts, gemini.ts, sarvam.ts
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
| AI - Vision Analysis | Gemini 2.5 Pro (primary) + Claude Haiku 4.5 (fallback) |
| AI - Synthesis | Claude Sonnet 4.6 (primary) + Gemini 2.5 Pro (fallback) |
| AI - Copy Generation | Claude Sonnet 4.6 + Gemini 2.5 Pro (parallel, for voice diversity) |
| AI - Translation | Sarvam AI |

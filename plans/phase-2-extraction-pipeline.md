# Phase 2: Design System Extraction Pipeline — Overview

## Context

Phase 1 is complete: monorepo scaffolded, DB schema with 14 tables, Hono API server, brand CRUD + creative upload, Python thumbnail worker, Docker Compose infrastructure. Phase 2 builds the core value-delivery feature: a 4-stage extraction pipeline that processes a brand's uploaded creatives and produces a structured DesignSystem.

Pipeline: **Preprocessing → Individual Analysis (parallel) → Aggregation → Synthesis**

## Architecture Decisions

- **Orchestration**: Single master job on `extraction` queue drives all 4 stages. Stages 1-2 dispatch child jobs and wait via Redis counters + pub/sub. Stages 3-4 run inline.
- **Node workers**: Separate process (`src/workers/start.ts`) from Hono server, shares same DB/queue/storage modules. Script: `dev:workers`.
- **Python workers**: `main.py` registers 3 workers in same asyncio loop: `thumbnails` (existing), `preprocessing`, `color-extraction`.
- **Progress broadcasting**: Redis pub/sub channels (`extraction:progress:{jobId}`) bridged to WebSocket by Hono server. Requires `ioredis`.
- **Text extraction**: Merged into Claude Vision prompt — one call handles layout + OCR + copy analysis.
- **Error handling**: Per-image failures → exclude + continue. >50% failures → fail job. Claude API: 3x retry with exponential backoff.

## Sub-Phase Files (implement in order)

| Sub-Phase | File | What It Builds |
|-----------|------|----------------|
| 2A | `phase-2a-infrastructure.md` | ✅ Redis pub/sub, new queues, Node worker entry point, WebSocket enhancement |
| 2B | `phase-2b-preprocessing.md` | ✅ Python image validator, phash dedup, preprocessing queue worker |
| 2C | `phase-2c-analysis.md` | ✅ Python color extraction + Node Claude Vision analysis workers |
| 2D | `phase-2d-aggregation-synthesis.md` | ✅ Aggregation engine + Claude Sonnet synthesis |
| 2E | `phase-2e-orchestration.md` | ✅ Pipeline orchestrator, extraction service, API routes, wiring |

Each sub-phase file is self-contained with its own context, file list, and verification steps.

## Data Flow (end-to-end)

```
POST /api/brands/:id/design-system/extract
  │
  ▼
[extraction_jobs row created, status=queued]
  │
  ▼
extractionQueue.add('run-extraction', { jobId, brandId, orgId })
  │
  ▼
extraction-orchestrator worker picks up job
  │
  ├─ Stage 1: PREPROCESSING (Python)
  │   preprocessingQueue → validates, phash, dedup → brand_creatives updated
  │
  ├─ Stage 2: ANALYSIS (Parallel)
  │   ┌─ colorExtractionQueue → Python k-means → brand_creatives.color_analysis
  │   └─ visionAnalysisQueue → Claude Haiku 4.5 → brand_creatives.analysis
  │
  ├─ Stage 3: AGGREGATION (Node, inline)
  │   Cluster colors, aggregate typography/layout/copy, detect inconsistencies
  │
  └─ Stage 4: SYNTHESIS (Node, inline)
      Claude Sonnet 4.6 → DesignSystem JSON → design_systems table
```

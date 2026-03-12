# Brindin Platform — Project Overview

Last updated: 2026-03-12

## What is Brindin?

Brindin is a market intelligence and creative production platform built for Indian digital advertising agencies and D2C brands. It enables agencies to scale creative output 3x without proportionally increasing headcount — through codified brand design systems, embedded market intelligence, and AI-assisted creative generation.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | pnpm workspaces + Turborepo |
| Runtime | Node.js 20+, TypeScript (ES2022) |
| API Server | Hono 4.6 (Node adapter) |
| Frontend | Next.js 14 (App Router) |
| Database | PostgreSQL 16 + Drizzle ORM |
| Job Queues | BullMQ + Redis 7 |
| Object Storage | Cloudflare R2 / MinIO (local) |
| Python Workers | Python 3.11+, Pillow, scikit-learn, FastAPI |
| Validation | Zod (shared schemas across all packages) |
| AI Providers | Anthropic Claude, Google Gemini 2.5 Pro, Sarvam AI |
| Infrastructure | Docker Compose (Postgres, Redis, MinIO) |

## Monorepo Structure

```
brindin-platform/
├── packages/
│   ├── shared/       # Zod schemas & TypeScript types
│   ├── backend/      # Hono API server, DB, job queues, AI layer
│   ├── frontend/     # Next.js 14 (scaffold, not yet built out)
│   └── workers-py/   # Python async workers (image processing, color extraction)
├── docs/             # Vision, PRD, and this overview
├── plans/            # Phase-by-phase implementation plans
└── docker-compose.yml
```

## Completed Phases

### Phase 1: Project Scaffolding & Infrastructure

- **1A** Monorepo setup (pnpm workspaces + Turborepo)
- **1B** Shared Zod schemas (14 schemas covering all entities)
- **1C** Hono API server with middleware, auth, and WebSocket support
- **1D** Database schema (14 tables — orgs, brands, creatives, design systems, jobs, usage metering)
- **1E** Brand module with creative upload (multipart → S3, signed URLs)
- **1F** Python worker scaffold (thumbnail generation, BullMQ integration)
- **1G** Docker Compose infrastructure (Postgres, Redis, MinIO)

### Phase 2: Design System Extraction Pipeline

- **2A** Infrastructure layer (Redis pub/sub, WebSocket bridge, BullMQ queues)
- **2B** Preprocessing worker — format validation, perceptual hashing, deduplication
- **2C** Parallel analysis workers — k-means color extraction (Python) + Claude/Gemini vision analysis (Node)
- **2D** Aggregation & synthesis — clusters extracted data into a coherent design system via AI
- **2E** Pipeline orchestration — 4-stage pipeline with real-time progress via WebSocket
- **2F** Multi-provider AI layer — Gemini 2.5 Pro (vision), Claude Sonnet (synthesis), Sarvam AI (translation), with automatic failover
- **2G** Regional Creative DNA — cultural context profiles for 8 Indian regions (in progress, seed data pending migration)

## Key Capabilities

- **Brand management** — Multi-tenant, org-scoped brand CRUD with asset management
- **Creative asset pipeline** — Upload, validate, thumbnail, deduplicate via perceptual hashing
- **AI-powered design system extraction** — Analyzes brand creatives to produce structured design systems (color palette, typography, layout patterns, copy tone, logo rules) with confidence scoring
- **Multi-provider AI routing** — Provider-agnostic layer with automatic failover and cost tracking
- **Regional variants** — Translation and transliteration via Sarvam AI for India's linguistic diversity
- **Real-time job tracking** — WebSocket-based progress updates for long-running pipelines
- **Usage metering** — Event-based cost tracking across all AI providers

## Database (14 Tables)

Organizations & users, brands & creatives, design systems & versions, regional variants & profiles, extraction & generation jobs, intelligence entries, usage events & summaries, campaign briefs.

## What's Next

### Phase 3: Extraction Frontend & Design System Editor
Dashboard shell, brand management UI, creative gallery, extraction progress UI, design system viewer/editor, regional variants UI.

### Phase 4: Creative Generation Pipeline
HTML/CSS template system, background removal, Playwright rendering, copy generation + translation, brand constraint engine.

### Phase 5: Festival Module & Polish
Festival-specific intelligence, brand compliance checker, campaign brief generator, usage dashboard, end-to-end testing.

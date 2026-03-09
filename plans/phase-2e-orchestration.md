# Phase 2E: Pipeline Orchestration, Service Layer & API Routes ✅

> **Status: COMPLETED** — All 6 files implemented, type-check passes.

## Context

Phases 2A-2D built all the pipeline components: infrastructure (2A), preprocessing worker (2B), color + vision analysis workers (2C), aggregation + synthesis engines (2D). Phase 2E wires everything together: the orchestrator that coordinates the 4-stage pipeline, the service layer for DB operations, the API routes to trigger and monitor extraction, and the worker registration.

This is the final sub-phase. After completing it, the full extraction pipeline works end-to-end.

## What Exists (key files to read first)

- `packages/backend/src/lib/queue.ts` — Queues: `extractionQueue`, `preprocessingQueue`, `colorExtractionQueue`, `visionAnalysisQueue`. Factory: `createWorker()`.
- `packages/backend/src/lib/redis-pubsub.ts` — (from 2A) `publishProgress()`, `initStageCounter()`, `waitForStageCompletion()`, `signalStageProgress()`, `cleanupPipelineKeys()`
- `packages/backend/src/modules/design-system/aggregation.ts` — (from 2D) `aggregateAnalyses(creatives)`
- `packages/backend/src/modules/design-system/synthesis.ts` — (from 2D) `synthesizeDesignSystem(input)`
- `packages/backend/src/workers/claude-vision.ts` — (from 2C) vision analysis worker on `vision-analysis` queue
- `packages/backend/src/workers/start.ts` — (from 2A) Node worker entry point, currently imports vision worker
- `packages/backend/src/db/schema.ts` — Key tables:
  - `extractionJobs`: id, brandId, status (text, default 'queued'), totalImages, processedImages, excludedImages, stage (text), progress (int), errorMessage, startedAt, completedAt
  - `designSystems`: id, brandId (unique), version, status, colorPalette, typography, layoutStructures, imageTreatment, copyPatterns, logoUsage (all NOT NULL jsonb), inconsistencyReport, onboardingGuide, confidenceScores, extractionMetadata
  - `brandCreatives`: id, brandId, fileUrl, fileType, fileSizeBytes, isExcluded, colorAnalysis, analysis
- `packages/backend/src/services/brand.service.ts` — `getBrandById(orgId, brandId)`, `listCreatives(brandId, { limit, offset })`
- `packages/backend/src/lib/usage.ts` — `recordUsageEvent({ orgId, brandId, eventType, ... })`
- `packages/backend/src/server/index.ts` — Hono app, registers routes via `app.route('/api', ...)`
- `packages/backend/src/server/types.ts` — `AppEnv` with `Variables: { orgId: string }`
- `packages/backend/src/server/routes/brands.ts` — existing brand routes pattern to follow

## What to Build

### 1. Extraction Service Layer

**New file: `packages/backend/src/modules/design-system/extraction.service.ts`**

All DB operations for the extraction pipeline. Follows the same pattern as `brand.service.ts`.

```typescript
import { db } from '../../db/index.js';
import { extractionJobs, designSystems, brandCreatives, brands } from '../../db/schema.js';
import { eq, and, isNotNull } from 'drizzle-orm';

// ── Extraction Job Operations ──

export async function createExtractionJob(brandId: string) {
  const [job] = await db.insert(extractionJobs).values({
    brandId,
    status: 'queued',
  }).returning();
  return job;
}

export async function getExtractionJob(jobId: string) {
  const [job] = await db.select().from(extractionJobs).where(eq(extractionJobs.id, jobId));
  return job ?? null;
}

export async function getActiveExtractionJob(brandId: string) {
  // Check for any running extraction (status not in ['completed', 'failed'])
  const [job] = await db.select().from(extractionJobs).where(
    and(
      eq(extractionJobs.brandId, brandId),
      // Status is queued, preprocessing, analyzing, aggregating, or synthesizing
    )
  );
  return job ?? null;
}

export async function updateExtractionJob(jobId: string, updates: {
  status?: string;
  stage?: string;
  progress?: number;
  processedImages?: number;
  excludedImages?: number;
  totalImages?: number;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
}) {
  await db.update(extractionJobs).set(updates).where(eq(extractionJobs.id, jobId));
}

// ── Creative Queries ──

export async function getCreativesForBrand(brandId: string) {
  return db.select().from(brandCreatives).where(eq(brandCreatives.brandId, brandId));
}

export async function getNonExcludedCreatives(brandId: string) {
  return db.select().from(brandCreatives).where(
    and(eq(brandCreatives.brandId, brandId), eq(brandCreatives.isExcluded, false))
  );
}

export async function getAnalyzedCreatives(brandId: string) {
  // Non-excluded creatives that have both colorAnalysis and analysis populated
  return db.select().from(brandCreatives).where(
    and(
      eq(brandCreatives.brandId, brandId),
      eq(brandCreatives.isExcluded, false),
      isNotNull(brandCreatives.colorAnalysis),
      isNotNull(brandCreatives.analysis),
    )
  );
}

// ── Design System Operations ──

export async function getDesignSystemByBrand(brandId: string) {
  const [ds] = await db.select().from(designSystems).where(eq(designSystems.brandId, brandId));
  return ds ?? null;
}

export async function upsertDesignSystem(brandId: string, data: {
  colorPalette: object;
  typography: object;
  layoutStructures: object;
  imageTreatment: object;
  copyPatterns: object;
  logoUsage: object;
  inconsistencyReport?: object;
  onboardingGuide?: string;
  confidenceScores?: object;
  extractionMetadata?: object;
}) {
  const existing = await getDesignSystemByBrand(brandId);
  if (existing) {
    await db.update(designSystems).set({
      ...data,
      version: existing.version! + 1,
      status: 'draft',
      updatedAt: new Date(),
    }).where(eq(designSystems.brandId, brandId));
  } else {
    await db.insert(designSystems).values({
      brandId,
      version: 1,
      status: 'draft',
      ...data,
    });
  }
}

// ── Brand Query (with category) ──

export async function getBrand(brandId: string) {
  const [brand] = await db.select().from(brands).where(eq(brands.id, brandId));
  return brand ?? null;
}
```

### 2. Pipeline Orchestrator

**New file: `packages/backend/src/modules/design-system/orchestrator.ts`**

The central coordinator. Called by the BullMQ extraction worker. Manages all 4 stages sequentially.

```typescript
import { preprocessingQueue, colorExtractionQueue, visionAnalysisQueue } from '../../lib/queue.js';
import { publishProgress, initStageCounter, waitForStageCompletion, cleanupPipelineKeys } from '../../lib/redis-pubsub.js';
import { recordUsageEvent } from '../../lib/usage.js';
import { aggregateAnalyses } from './aggregation.js';
import { synthesizeDesignSystem } from './synthesis.js';
import * as service from './extraction.service.js';

export async function runExtractionPipeline(
  jobId: string,
  brandId: string,
  orgId: string,
): Promise<void> {
  try {
    // Mark started
    await service.updateExtractionJob(jobId, {
      status: 'preprocessing',
      stage: 'preprocessing',
      progress: 0,
      startedAt: new Date(),
    });

    // ━━━━ STAGE 1: PREPROCESSING ━━━━
    await publishProgress(jobId, { stage: 'preprocessing', progress: 0, message: 'Starting preprocessing...' });

    const allCreatives = await service.getCreativesForBrand(brandId);
    await service.updateExtractionJob(jobId, { totalImages: allCreatives.length });

    if (allCreatives.length === 0) {
      throw new Error('No creatives found for this brand. Upload images first.');
    }

    // Dispatch preprocessing jobs
    await initStageCounter(jobId, 'preprocessing', allCreatives.length);

    for (const creative of allCreatives) {
      await preprocessingQueue.add('preprocess', {
        creativeId: creative.id,
        brandId,
        s3Key: creative.fileUrl,
        fileType: creative.fileType,
        fileSizeBytes: creative.fileSizeBytes ?? 0,
        jobId,
      });
    }

    // Wait for all preprocessing to complete
    await waitForStageCompletion(jobId, 'preprocessing');

    // Check results
    const validCreatives = await service.getNonExcludedCreatives(brandId);
    const excludedCount = allCreatives.length - validCreatives.length;

    await service.updateExtractionJob(jobId, {
      processedImages: allCreatives.length,
      excludedImages: excludedCount,
      progress: 100,
    });

    if (validCreatives.length === 0) {
      throw new Error('All creatives were excluded during preprocessing. No valid images to analyze.');
    }

    // Minimum viable creative count
    if (validCreatives.length < 3) {
      throw new Error(`Only ${validCreatives.length} valid creatives. Need at least 3 for meaningful analysis.`);
    }

    // ━━━━ STAGE 2: INDIVIDUAL ANALYSIS (parallel) ━━━━
    await service.updateExtractionJob(jobId, {
      status: 'analyzing',
      stage: 'analyzing',
      progress: 0,
    });
    await publishProgress(jobId, { stage: 'analyzing', progress: 0, message: 'Analyzing creatives...' });

    // Color extraction (one job per creative)
    await initStageCounter(jobId, 'color-extraction', validCreatives.length);
    for (const creative of validCreatives) {
      await colorExtractionQueue.add('extract-color', {
        creativeId: creative.id,
        s3Key: creative.fileUrl,
        jobId,
      });
    }

    // Vision analysis (batched, 3-5 per job)
    const BATCH_SIZE = 4;
    const visionBatches = [];
    for (let i = 0; i < validCreatives.length; i += BATCH_SIZE) {
      const batch = validCreatives.slice(i, i + BATCH_SIZE);
      visionBatches.push(batch);
    }

    await initStageCounter(jobId, 'vision-analysis', validCreatives.length);
    // Note: counter is per-creative (signaled per creative in the batch), not per-batch

    for (const batch of visionBatches) {
      await visionAnalysisQueue.add('analyze-vision', {
        creativeIds: batch.map(c => c.id),
        s3Keys: batch.map(c => c.fileUrl),
        jobId,
        brandId,
        orgId,
      });
    }

    // Wait for BOTH to complete
    await Promise.all([
      waitForStageCompletion(jobId, 'color-extraction'),
      waitForStageCompletion(jobId, 'vision-analysis'),
    ]);

    // Check analysis success rate
    const analyzedCreatives = await service.getAnalyzedCreatives(brandId);
    const analysisFailures = validCreatives.length - analyzedCreatives.length;

    if (analysisFailures > validCreatives.length * 0.5) {
      throw new Error(`Too many analysis failures: ${analysisFailures}/${validCreatives.length}. Pipeline aborted.`);
    }

    await service.updateExtractionJob(jobId, { progress: 100 });

    // ━━━━ STAGE 3: AGGREGATION ━━━━
    await service.updateExtractionJob(jobId, {
      status: 'aggregating',
      stage: 'aggregating',
      progress: 0,
    });
    await publishProgress(jobId, { stage: 'aggregating', progress: 0, message: 'Aggregating patterns...' });

    const aggregatedResult = await aggregateAnalyses(analyzedCreatives as any);

    await service.updateExtractionJob(jobId, { progress: 100 });
    await publishProgress(jobId, { stage: 'aggregating', progress: 100 });

    // ━━━━ STAGE 4: SYNTHESIS ━━━━
    await service.updateExtractionJob(jobId, {
      status: 'synthesizing',
      stage: 'synthesizing',
      progress: 0,
    });
    await publishProgress(jobId, { stage: 'synthesizing', progress: 0, message: 'Synthesizing design system...' });

    const brand = await service.getBrand(brandId);

    const designSystemOutput = await synthesizeDesignSystem({
      brandName: brand!.name,
      brandCategory: brand!.categoryVertical,
      aggregatedResult,
      sampleCreativeCount: analyzedCreatives.length,
      excludedCount,
    });

    // Upsert design system
    await service.upsertDesignSystem(brandId, designSystemOutput);

    // ━━━━ COMPLETE ━━━━
    await service.updateExtractionJob(jobId, {
      status: 'completed',
      stage: 'completed',
      progress: 100,
      completedAt: new Date(),
    });
    await publishProgress(jobId, { stage: 'completed', progress: 100, message: 'Design system extraction complete!' });

    // Record usage events
    await recordUsageEvent({
      orgId,
      brandId,
      eventType: 'extraction',
      quantity: 1,
      unit: 'api_call',
      metadata: {
        totalImages: allCreatives.length,
        analyzedImages: analyzedCreatives.length,
        excludedImages: excludedCount,
      },
    });

    // Cleanup Redis pipeline keys
    await cleanupPipelineKeys(jobId);

  } catch (error: any) {
    await service.updateExtractionJob(jobId, {
      status: 'failed',
      errorMessage: error.message ?? 'Unknown error',
    });
    await publishProgress(jobId, {
      stage: 'failed',
      progress: 0,
      message: error.message ?? 'Pipeline failed',
    });
    throw error;
  }
}
```

### 3. Extraction Orchestrator Worker

**New file: `packages/backend/src/workers/extraction-orchestrator.ts`**

```typescript
import { createWorker } from '../lib/queue.js';
import { runExtractionPipeline } from '../modules/design-system/orchestrator.js';

interface ExtractionJobData {
  jobId: string;
  brandId: string;
  orgId: string;
}

export const extractionOrchestratorWorker = createWorker<ExtractionJobData>(
  'extraction',
  async (job) => {
    const { jobId, brandId, orgId } = job.data;
    console.log(`[Extraction] Starting pipeline for job ${jobId}, brand ${brandId}`);
    await runExtractionPipeline(jobId, brandId, orgId);
    console.log(`[Extraction] Pipeline complete for job ${jobId}`);
  },
  {
    concurrency: 2,  // Allow 2 concurrent extractions
  },
);
```

### 4. API Routes

**New file: `packages/backend/src/server/routes/extraction.ts`**

```typescript
import { Hono } from 'hono';
import type { AppEnv } from '../types.js';
import { getBrandById } from '../../services/brand.service.js';
import * as extractionService from '../../modules/design-system/extraction.service.js';
import { extractionQueue } from '../../lib/queue.js';

const extraction = new Hono<AppEnv>();

// ── Trigger extraction ──
// POST /api/brands/:id/design-system/extract
extraction.post('/brands/:id/design-system/extract', async (c) => {
  const orgId = c.get('orgId');
  const brandId = c.req.param('id');

  // Validate brand exists and belongs to org
  const brand = await getBrandById(orgId, brandId);
  if (!brand) return c.json({ error: 'Brand not found' }, 404);

  // Check no active extraction is already running
  const activeJob = await extractionService.getActiveExtractionJob(brandId);
  if (activeJob) {
    return c.json({
      error: 'An extraction is already in progress',
      activeJobId: activeJob.id,
      status: activeJob.status,
    }, 409);
  }

  // Create extraction job
  const job = await extractionService.createExtractionJob(brandId);

  // Enqueue to extraction queue
  await extractionQueue.add('run-extraction', {
    jobId: job.id,
    brandId,
    orgId,
  });

  return c.json({ job }, 202);
});

// ── Get design system ──
// GET /api/brands/:id/design-system
extraction.get('/brands/:id/design-system', async (c) => {
  const orgId = c.get('orgId');
  const brandId = c.req.param('id');

  const brand = await getBrandById(orgId, brandId);
  if (!brand) return c.json({ error: 'Brand not found' }, 404);

  const designSystem = await extractionService.getDesignSystemByBrand(brandId);
  if (!designSystem) return c.json({ error: 'No design system found. Trigger extraction first.' }, 404);

  return c.json({ designSystem });
});

// ── Get extraction job status ──
// GET /api/brands/:id/extraction-jobs/:jobId
extraction.get('/brands/:id/extraction-jobs/:jobId', async (c) => {
  const jobId = c.req.param('jobId');

  const job = await extractionService.getExtractionJob(jobId);
  if (!job) return c.json({ error: 'Extraction job not found' }, 404);

  return c.json({ job });
});

export default extraction;
```

### 5. Register Routes & Workers

**Modify: `packages/backend/src/server/index.ts`**

Add extraction routes:
```typescript
import extractionRoutes from './routes/extraction.js';
// After existing route registrations:
app.route('/api', extractionRoutes);
```

**Modify: `packages/backend/src/workers/start.ts`**

Import and register the orchestrator worker:
```typescript
import { extractionOrchestratorWorker } from './extraction-orchestrator.js';
import { visionWorker } from './claude-vision.js';

console.log('Node workers started:');
console.log('  - extraction orchestrator (queue: extraction)');
console.log('  - vision analysis (queue: vision-analysis)');

// In shutdown handler:
await Promise.all([
  extractionOrchestratorWorker.close(),
  visionWorker.close(),
]);
```

## Files Summary

| Action | File | What Changes |
|--------|------|-------------|
| New | `backend/src/modules/design-system/extraction.service.ts` | DB operations for extraction pipeline |
| New | `backend/src/modules/design-system/orchestrator.ts` | 4-stage pipeline coordinator |
| New | `backend/src/workers/extraction-orchestrator.ts` | BullMQ worker on extraction queue |
| New | `backend/src/server/routes/extraction.ts` | API routes (trigger, get DS, get job status) |
| Modify | `backend/src/server/index.ts` | Register extraction routes |
| Modify | `backend/src/workers/start.ts` | Import orchestrator + vision workers |

## Verification (Full End-to-End)

```bash
# 1. Start infrastructure
docker compose up -d

# 2. Push DB schema
pnpm --filter backend db:push

# 3. Start API server
pnpm --filter backend dev &

# 4. Start Node workers (orchestrator + vision)
pnpm --filter backend dev:workers &

# 5. Start Python workers (thumbnails + preprocessing + color-extraction)
cd packages/workers-py && python -m src.main &

# 6. Create a brand
curl -X POST http://localhost:3001/api/brands \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Brand","slug":"test-brand","categoryVertical":"beauty"}'

# 7. Upload 10-20 test images (real ad creatives)
# Use multipart upload to POST /api/brands/{brandId}/creatives/upload

# 8. Trigger extraction
curl -X POST http://localhost:3001/api/brands/{brandId}/design-system/extract

# Response: { "job": { "id": "...", "status": "queued" } }

# 9. Monitor progress via WebSocket
# Connect to ws://localhost:3001/ws/jobs/{jobId}
# Should see: preprocessing → analyzing → aggregating → synthesizing → completed

# 10. Poll job status
curl http://localhost:3001/api/brands/{brandId}/extraction-jobs/{jobId}

# 11. Get completed design system
curl http://localhost:3001/api/brands/{brandId}/design-system
```

### Expected Output Verification

The design system response should have:
- `colorPalette.colors` — 5-8 colors with hex, role, frequency, confidence
- `typography.fonts` — heading + body fonts identified
- `layoutStructures.layouts` — frequency-sorted layout types
- `imageTreatment` — dominant style, color grading, product prominence
- `copyPatterns` — tone, CTA conventions, language preferences
- `logoUsage` — preferred position, size, treatment
- `inconsistencyReport` — any detected inconsistencies with descriptions
- `onboardingGuide` — readable markdown, 300-500 words
- `confidenceScores` — per-dimension scoring
- `version` = 1, `status` = 'draft'

### Error Scenarios to Test
- Trigger extraction with no creatives uploaded → should fail with descriptive error
- Upload only 2 valid images → should fail after preprocessing ("need at least 3")
- Trigger extraction while one is running → should return 409
- Upload images with duplicates → should exclude duplicates, continue with unique ones

// Phase 2F — Vision Analysis Worker (refactored from claude-vision.ts)
// Uses multi-provider AI router instead of direct Anthropic SDK calls

import { eq } from 'drizzle-orm';

import { db } from '../db/index.js';
import { brandCreatives } from '../db/schema.js';
import { createWorker } from '../lib/queue.js';
import { signalStageProgress } from '../lib/redis-pubsub.js';
import { getSignedDownloadUrl } from '../lib/storage.js';
import { calculateCostMicrodollars, recordUsageEvent } from '../lib/usage.js';
import { getAIRouter } from '../lib/ai/index.js';

interface VisionJobData {
  creativeIds: string[];
  s3Keys: string[];
  jobId: string;
  brandId: string;
  orgId: string;
}

const SYSTEM_PROMPT = `You are a design system analyst. You analyze brand creative images and extract structured information about layout, typography, copy text, and image treatment.

For each image, produce a JSON object with these fields:
- layoutType: string describing the layout structure (e.g. "single-column-hero", "grid-2x2", "full-bleed", "split-left-right")
- layoutDescription: brief description of how elements are arranged
- typography: { headlineFont: string | null, bodyFont: string | null, fontSizes: string[], fontWeights: string[], textAlignment: string }
- copy: { headline: string | null, subheadline: string | null, bodyText: string | null, ctaText: string | null, tone: string }
- imageTreatment: { style: string, hasOverlay: boolean, overlayType: string | null, filterEffect: string | null, cropStyle: string }
- logoPresent: boolean
- logoPosition: string | null

Return a JSON array with one object per image, in the same order as the images provided.`;

// Simple in-memory rate limiter: 10 jobs per 60s window
const rateState = { tokens: 10, lastRefill: Date.now() };
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - rateState.lastRefill;
  if (elapsed >= RATE_WINDOW_MS) {
    rateState.tokens = RATE_LIMIT;
    rateState.lastRefill = now;
  }
  if (rateState.tokens <= 0) {
    const waitMs = RATE_WINDOW_MS - elapsed;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    rateState.tokens = RATE_LIMIT;
    rateState.lastRefill = Date.now();
  }
  rateState.tokens--;
}

async function fetchImageAsBase64(s3Key: string): Promise<{ base64: string; mediaType: string }> {
  const url = await getSignedDownloadUrl(s3Key);
  const response = await fetch(url);
  const buffer = Buffer.from(await response.arrayBuffer());
  const base64 = buffer.toString('base64');

  const ext = s3Key.split('.').pop()?.toLowerCase() ?? '';
  const mediaTypeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  };
  const mediaType = mediaTypeMap[ext] ?? 'image/jpeg';

  return { base64, mediaType };
}

async function processVisionBatch(job: { data: VisionJobData }): Promise<{ processedCount: number }> {
  const { creativeIds, s3Keys, jobId, brandId, orgId } = job.data;

  await waitForRateLimit();

  const images = await Promise.all(
    s3Keys.map((key) => fetchImageAsBase64(key)),
  );

  const router = getAIRouter();
  const result = await router.analyzeVision({
    images,
    creativeIds,
    systemPrompt: SYSTEM_PROMPT,
  });

  // Update each creative's analysis in the database
  for (let i = 0; i < creativeIds.length; i++) {
    if (result.analyses[i]) {
      await db
        .update(brandCreatives)
        .set({ analysis: result.analyses[i] })
        .where(eq(brandCreatives.id, creativeIds[i]));

      await signalStageProgress(jobId, 'vision-analysis');
    }
  }

  // Record usage event with cost from provider response
  const costMicrodollars = calculateCostMicrodollars(
    result.model,
    result.usage.inputTokens,
    result.usage.outputTokens,
  );
  await recordUsageEvent({
    orgId,
    brandId,
    eventType: 'ai-inference',
    eventSubtype: 'vision-analysis',
    quantity: creativeIds.length,
    unit: 'images',
    costMicrodollars,
    metadata: {
      model: result.model,
      provider: result.provider,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      costMicrodollars,
    },
  });

  return { processedCount: creativeIds.length };
}

export const visionWorker = createWorker<VisionJobData>(
  'vision-analysis',
  processVisionBatch,
  { concurrency: 3 },
);

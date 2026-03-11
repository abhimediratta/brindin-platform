// Phase 2F — Translation Worker
// BullMQ worker that translates design system copy fields via Sarvam AI

import { eq } from 'drizzle-orm';

import { db } from '../db/index.js';
import { regionalVariants } from '../db/schema.js';
import { createWorker } from '../lib/queue.js';
import { getAIRouter } from '../lib/ai/index.js';
import { recordUsageEvent } from '../lib/usage.js';

export interface TranslationJobData {
  designSystemId: string;
  variantId: string;
  regionCode: string;
  language: string;
  fields: { key: string; text: string }[];
  orgId: string;
  brandId: string;
}

// Sarvam has lower rate limits: 5 requests per 60s
const rateState = { tokens: 5, lastRefill: Date.now() };
const RATE_LIMIT = 5;
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

async function processTranslation(job: { data: TranslationJobData }): Promise<{ translatedCount: number }> {
  const { variantId, language, fields, orgId, brandId } = job.data;

  const router = getAIRouter();
  const copyOverrides: Record<string, string> = {};
  let translatedCount = 0;

  for (const field of fields) {
    await waitForRateLimit();

    try {
      const result = await router.translate({
        text: field.text,
        sourceLanguage: 'en',
        targetLanguage: language,
        context: 'brand design system copy for marketing creatives',
      });

      copyOverrides[field.key] = result.translatedText;
      translatedCount++;
    } catch (error) {
      console.warn(`[translation] Failed to translate field "${field.key}": ${error instanceof Error ? error.message : error}`);
    }
  }

  // Update the regional variant with translated copy
  await db
    .update(regionalVariants)
    .set({
      copyOverrides,
      updatedAt: new Date(),
    })
    .where(eq(regionalVariants.id, variantId));

  await recordUsageEvent({
    orgId,
    brandId,
    eventType: 'ai-inference',
    eventSubtype: 'translation',
    quantity: translatedCount,
    unit: 'fields',
    metadata: {
      language,
      totalFields: fields.length,
      translatedFields: translatedCount,
    },
  });

  return { translatedCount };
}

export const translationWorker = createWorker<TranslationJobData>(
  'translation',
  processTranslation,
  { concurrency: 1 },
);

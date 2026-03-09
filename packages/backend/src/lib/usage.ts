import { db } from '../db/index.js';
import { usageEvents } from '../db/schema.js';

// --- Model Pricing (microdollars per token, i.e. $1 = 1_000_000 microdollars) ---
// Source: https://docs.anthropic.com/en/docs/about-claude/models (as of 2025-05)

interface ModelPricing {
  inputPerToken: number;   // microdollars per input token
  outputPerToken: number;  // microdollars per output token
}

const MODEL_PRICING: Record<string, ModelPricing> = {
  // Haiku 4.5 — $0.80/M input, $4/M output
  'claude-haiku-4-5-20241022': { inputPerToken: 0.8, outputPerToken: 4 },
  // Sonnet 4.6 — $3/M input, $15/M output
  'claude-sonnet-4-6-20250514': { inputPerToken: 3, outputPerToken: 15 },
  // Sonnet 3.5 (legacy fallback) — $3/M input, $15/M output
  'claude-3-5-sonnet-20241022': { inputPerToken: 3, outputPerToken: 15 },
};

/**
 * Calculate cost in microdollars for a Claude API call.
 *
 * Pricing values above are in microdollars per token, so:
 *   cost = inputTokens * inputPerToken + outputTokens * outputPerToken
 *
 * Example: Sonnet, 10k input + 2k output
 *   = 10_000 * 3 + 2_000 * 15 = 60_000 microdollars = $0.06
 *
 * Returns 0 for unknown models (logs a warning).
 */
export function calculateCostMicrodollars(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    console.warn(`[usage] Unknown model "${model}" — cost will not be tracked.`);
    return 0;
  }
  return Math.round(inputTokens * pricing.inputPerToken + outputTokens * pricing.outputPerToken);
}

export async function recordUsageEvent(input: {
  orgId: string;
  brandId?: string;
  eventType: string;
  eventSubtype?: string;
  quantity?: number;
  unit: string;
  costMicrodollars?: number;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await db.insert(usageEvents).values({
    orgId: input.orgId,
    brandId: input.brandId,
    eventType: input.eventType,
    eventSubtype: input.eventSubtype,
    quantity: String(input.quantity ?? 1),
    unit: input.unit,
    costMicrodollars: input.costMicrodollars,
    metadata: input.metadata,
  });
}

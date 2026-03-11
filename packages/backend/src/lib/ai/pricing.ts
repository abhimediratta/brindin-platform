// Phase 2F — Unified Model Pricing
// Microdollars per token (i.e. $1 = 1_000_000 microdollars)

interface ModelPricing {
  inputPerToken: number;
  outputPerToken: number;
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  // Claude Haiku 4.5 — $0.80/M input, $4/M output
  'claude-haiku-4-5-20241022': { inputPerToken: 0.8, outputPerToken: 4 },
  // Claude Sonnet 4.6 — $3/M input, $15/M output
  'claude-sonnet-4-6-20250514': { inputPerToken: 3, outputPerToken: 15 },
  // Claude Sonnet 3.5 (legacy fallback) — $3/M input, $15/M output
  'claude-3-5-sonnet-20241022': { inputPerToken: 3, outputPerToken: 15 },
  // Gemini 2.5 Pro — $1.25/M input, $10/M output (prompts ≤200k tokens)
  'gemini-2.5-pro': { inputPerToken: 1.25, outputPerToken: 10 },
  // Sarvam AI — flat per-request pricing tracked separately; placeholder
  'sarvam-translate': { inputPerToken: 0, outputPerToken: 0 },
  'sarvam-transliterate': { inputPerToken: 0, outputPerToken: 0 },
};

/**
 * Calculate cost in microdollars for an AI API call.
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

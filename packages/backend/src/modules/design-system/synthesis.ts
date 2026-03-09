// Phase 2D — Design System Synthesis
// Claude Sonnet API call to produce final DesignSystem JSON from aggregated data

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

import {
  colorPaletteSchema,
  typographySchema,
  layoutStructuresSchema,
  imageTreatmentSchema,
  copyPatternsSchema,
  logoUsageSchema,
  confidenceScoresSchema,
  extractionMetadataSchema,
} from '@brindin/shared';

import { env } from '../../lib/env.js';
import { calculateCostMicrodollars, recordUsageEvent } from '../../lib/usage.js';
import type { AggregatedResult, ClusteredColor } from './aggregation.js';

// --- Types ---

export interface SynthesisInput {
  brandName: string;
  brandCategory: string | null;
  aggregatedResult: AggregatedResult;
  totalCreatives: number;
  analyzedCreatives: number;
  excludedCreatives: number;
  orgId: string;
  brandId: string;
}

const designSystemOutputSchema = z.object({
  colorPalette: colorPaletteSchema,
  typography: typographySchema,
  layoutStructures: layoutStructuresSchema,
  imageTreatment: imageTreatmentSchema,
  copyPatterns: copyPatternsSchema,
  logoUsage: logoUsageSchema,
  inconsistencyReport: z.object({
    items: z.array(z.object({
      dimension: z.string(),
      severity: z.string(),
      description: z.string(),
      recommendation: z.string(),
    })),
    overallConsistencyScore: z.number().min(0).max(100),
  }).passthrough(),
  onboardingGuide: z.object({
    summary: z.string(),
    keyPatterns: z.array(z.string()),
    recommendations: z.array(z.string()),
  }).passthrough(),
});

export type DesignSystemOutput = z.infer<typeof designSystemOutputSchema>;

export interface SynthesisResult {
  output: DesignSystemOutput;
  confidenceScores: z.infer<typeof confidenceScoresSchema>;
  extractionMetadata: z.infer<typeof extractionMetadataSchema>;
  usedFallback: boolean;
}

// --- System Prompt ---

const SYSTEM_PROMPT = `You are a brand design system analyst. Given aggregated analysis data from a brand's creative assets, produce a comprehensive design system specification as JSON.

Your output must be a single JSON object with these exact top-level keys:

1. "colorPalette" — { colors: [{ hex: string, role: "primary"|"secondary"|"accent"|"background"|"text"|"cta"|"other", frequency?: number, confidence?: "strong"|"moderate"|"emerging" }], guidelines?: string }

2. "typography" — { fonts: [{ family: string, type: "serif"|"sans"|"display", role: "heading"|"body"|"cta", weight?: string|number }], sizeHierarchy?: object, devanagariUsage?: object, guidelines?: string }

3. "layoutStructures" — { layouts: [{ type: string, frequency?: number, platforms?: string[] }], dominantLayout?: string, guidelines?: string }

4. "imageTreatment" — { photographyStyle?: string, colorGrading?: string, productProminence?: string }

5. "copyPatterns" — { tone?: string, structurePreferences?: object, ctaConventions?: string[], languagePreferences?: object }

6. "logoUsage" — { preferredPosition?: string, sizeGuideline?: string, backgroundTreatment?: string }

7. "inconsistencyReport" — { items: [{ dimension: string, severity: string, description: string, recommendation: string }], overallConsistencyScore: number (0-100) }

8. "onboardingGuide" — { summary: string, keyPatterns: string[], recommendations: string[] }

IMPORTANT:
- Output ONLY valid JSON. No markdown, no explanations.
- All hex colors must start with "#".
- Be specific and actionable in guidelines and recommendations.
- The inconsistencyReport should include remediation recommendations.
- The onboardingGuide summary should be 2-3 sentences describing the brand's visual identity.
- Base everything on the provided data — do not invent data not supported by the analysis.`;

// --- Token Budget ---

// Sonnet pricing: $3/M input, $15/M output (as of 2025)
// Budget: cap total spend per synthesis at ~$0.15 (safe for a single brand)
const MAX_OUTPUT_TOKENS = 5_120; // typical output ~1.2k tokens; 5k gives 4x headroom without overspending
const MAX_USER_MESSAGE_CHARS = 60_000; // ~15k tokens; aggregated data is ~3-5k chars so this is a safety net
const MAX_TOTAL_TOKENS_BUDGET = 30_000; // across both attempts combined; prevents runaway retry costs

// --- Core Functions ---

/** Rough token estimate: ~4 chars per token for JSON/English */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Trim the aggregated data to fit within token budget.
 * Keeps top-N entries per category to reduce payload size.
 */
function trimAggregatedData(input: SynthesisInput): SynthesisInput {
  const agg = input.aggregatedResult;
  return {
    ...input,
    aggregatedResult: {
      ...agg,
      // Cap color clusters (already capped at 10, but enforce)
      colorPalette: agg.colorPalette.slice(0, 10),
      // Cap layout entries
      layoutStructures: {
        ...agg.layoutStructures,
        layouts: agg.layoutStructures.layouts.slice(0, 8),
      },
      // Cap CTA texts and structure patterns
      copyPatterns: {
        ...agg.copyPatterns,
        ctaTexts: agg.copyPatterns.ctaTexts.slice(0, 10),
        tones: agg.copyPatterns.tones.slice(0, 5),
        structurePatterns: agg.copyPatterns.structurePatterns.slice(0, 5),
      },
      // Cap image treatment entries
      imageTreatment: {
        ...agg.imageTreatment,
        styles: agg.imageTreatment.styles.slice(0, 5),
        filterEffects: agg.imageTreatment.filterEffects.slice(0, 5),
      },
      // Cap inconsistency examples
      inconsistencies: agg.inconsistencies.map((inc) => ({
        ...inc,
        exampleCreativeIds: inc.exampleCreativeIds.slice(0, 2),
      })),
    },
  };
}

function stripMarkdownFences(text: string): string {
  // Remove ```json ... ``` or ``` ... ``` wrappers
  const match = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (match) return match[1].trim();
  return text.trim();
}

async function callSynthesisAPI(
  client: Anthropic,
  systemPrompt: string,
  userMessage: string,
): Promise<{ text: string; truncated: boolean; usage: { input_tokens: number; output_tokens: number } }> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6-20250514',
    max_tokens: MAX_OUTPUT_TOKENS,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userMessage }],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  const text = textBlock?.type === 'text' ? textBlock.text : '';
  const truncated = response.stop_reason === 'max_tokens';

  return { text, truncated, usage: response.usage };
}

export function buildConfidenceScores(aggregated: AggregatedResult): z.infer<typeof confidenceScoresSchema> {
  const tierFromFreq = (freq: number): { strong?: number; moderate?: number; emerging?: number } => {
    if (freq > 0.7) return { strong: freq };
    if (freq >= 0.4) return { moderate: freq };
    return { emerging: freq };
  };

  const scores: Record<string, { strong?: number; moderate?: number; emerging?: number }> = {};

  // Color confidence: average of top 3 color frequencies
  if (aggregated.colorPalette.length > 0) {
    const topColors = aggregated.colorPalette.slice(0, 3);
    const avgFreq = topColors.reduce((s, c) => s + c.frequency, 0) / topColors.length;
    scores.color = tierFromFreq(avgFreq);
  } else {
    scores.color = { emerging: 0 };
  }

  // Typography
  if (aggregated.typography.fonts.length > 0) {
    scores.typography = tierFromFreq(aggregated.typography.fonts[0].frequency);
  } else {
    scores.typography = { emerging: 0 };
  }

  // Layout
  if (aggregated.layoutStructures.layouts.length > 0) {
    scores.layout = tierFromFreq(aggregated.layoutStructures.layouts[0].frequency);
  } else {
    scores.layout = { emerging: 0 };
  }

  // Copy/tone
  if (aggregated.copyPatterns.tones.length > 0) {
    scores.tone = tierFromFreq(aggregated.copyPatterns.tones[0].frequency);
  } else {
    scores.tone = { emerging: 0 };
  }

  // Image treatment
  if (aggregated.imageTreatment.styles.length > 0) {
    scores.imageTreatment = tierFromFreq(aggregated.imageTreatment.styles[0].frequency);
  } else {
    scores.imageTreatment = { emerging: 0 };
  }

  // Logo
  scores.logo = tierFromFreq(aggregated.logoUsage.presenceRate);

  return scores;
}

function mapClusteredColorToEntry(c: ClusteredColor) {
  return {
    hex: c.hex,
    role: c.role as typeof c.role,
    frequency: c.frequency,
    confidence: c.confidence as typeof c.confidence,
  };
}

export function buildFallbackOutput(input: SynthesisInput): DesignSystemOutput {
  const { aggregatedResult: agg, brandName } = input;

  return {
    colorPalette: {
      colors: agg.colorPalette.map(mapClusteredColorToEntry),
      guidelines: `Color palette extracted from ${input.analyzedCreatives} ${brandName} creatives.`,
    },
    typography: {
      fonts: agg.typography.fonts.map((f) => ({
        family: f.family,
        type: f.type,
        role: f.role,
        weight: undefined,
      })),
      guidelines: `Typography patterns from ${brandName} creatives.`,
    },
    layoutStructures: {
      layouts: agg.layoutStructures.layouts.map((l) => ({
        type: l.type,
        frequency: l.frequency,
      })),
      dominantLayout: agg.layoutStructures.dominantLayout,
      guidelines: `Layout patterns from ${brandName} creatives.`,
    },
    imageTreatment: {
      photographyStyle: agg.imageTreatment.dominantStyle,
      colorGrading: agg.imageTreatment.filterEffects[0]?.effect ?? undefined,
    },
    copyPatterns: {
      tone: agg.copyPatterns.dominantTone,
      ctaConventions: agg.copyPatterns.ctaTexts.slice(0, 5).map((ct) => ct.text),
    },
    logoUsage: {
      preferredPosition: agg.logoUsage.preferredPosition ?? undefined,
      sizeGuideline: undefined,
      backgroundTreatment: undefined,
    },
    inconsistencyReport: {
      items: agg.inconsistencies.map((inc) => ({
        dimension: inc.dimension,
        severity: inc.severity,
        description: inc.description,
        recommendation: `Review ${inc.dimension} consistency across creatives.`,
      })),
      overallConsistencyScore: Math.max(0, 100 - agg.inconsistencies.length * 15),
    },
    onboardingGuide: {
      summary: `${brandName}'s design system was extracted from ${input.analyzedCreatives} creative assets. This is a fallback extraction — AI synthesis was unavailable.`,
      keyPatterns: [
        agg.colorPalette.length > 0 ? `Primary color: ${agg.colorPalette[0].hex}` : 'No dominant color detected',
        agg.typography.fonts.length > 0 ? `Primary font: ${agg.typography.fonts[0].family}` : 'No consistent typography',
        `Dominant layout: ${agg.layoutStructures.dominantLayout}`,
      ],
      recommendations: [
        'Review and refine the extracted design system.',
        'Upload additional creatives for higher accuracy.',
      ],
    },
  };
}

function buildUserMessage(input: SynthesisInput): string {
  const { brandName, brandCategory, aggregatedResult, totalCreatives, analyzedCreatives, excludedCreatives } = input;

  return JSON.stringify({
    brand: {
      name: brandName,
      category: brandCategory,
    },
    analysisStats: {
      totalCreatives,
      analyzedCreatives,
      excludedCreatives,
    },
    aggregatedData: aggregatedResult,
  });
}

/** Synthesize a complete DesignSystem from aggregated creative analysis */
export async function synthesizeDesignSystem(input: SynthesisInput): Promise<SynthesisResult> {
  const { orgId, brandId } = input;

  const confidenceScores = buildConfidenceScores(input.aggregatedResult);
  const extractionMetadata: z.infer<typeof extractionMetadataSchema> = {
    totalImages: input.totalCreatives,
    analyzedImages: input.analyzedCreatives,
    excludedImages: input.excludedCreatives,
  };

  // If no API key, go straight to fallback
  if (!env.ANTHROPIC_API_KEY) {
    return {
      output: buildFallbackOutput(input),
      confidenceScores,
      extractionMetadata,
      usedFallback: true,
    };
  }

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  // Trim aggregated data to stay within token budget
  const trimmedInput = trimAggregatedData(input);
  let userMessage = buildUserMessage(trimmedInput);

  // Hard guard: if payload is still too large, skip AI and use fallback
  if (userMessage.length > MAX_USER_MESSAGE_CHARS) {
    console.warn(
      `[synthesis] User message too large (${userMessage.length} chars, ~${estimateTokens(userMessage)} tokens). Using fallback.`,
    );
    return {
      output: buildFallbackOutput(input),
      confidenceScores,
      extractionMetadata,
      usedFallback: true,
    };
  }

  const SYNTHESIS_MODEL = 'claude-sonnet-4-6-20250514';
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  const recordSynthesisUsage = async (extra: Record<string, unknown>) => {
    const costMicrodollars = calculateCostMicrodollars(SYNTHESIS_MODEL, totalInputTokens, totalOutputTokens);
    await recordUsageEvent({
      orgId,
      brandId,
      eventType: 'ai-inference',
      eventSubtype: 'design-system-synthesis',
      quantity: 1,
      unit: 'synthesis',
      costMicrodollars,
      metadata: {
        model: SYNTHESIS_MODEL,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        costMicrodollars,
        ...extra,
      },
    });
  };

  // First attempt
  try {
    const first = await callSynthesisAPI(client, SYSTEM_PROMPT, userMessage);
    totalInputTokens += first.usage.input_tokens;
    totalOutputTokens += first.usage.output_tokens;

    // Only try parsing if the response wasn't truncated
    if (!first.truncated) {
      const cleaned = stripMarkdownFences(first.text);
      const parsed = JSON.parse(cleaned);
      const result = designSystemOutputSchema.safeParse(parsed);

      if (result.success) {
        await recordSynthesisUsage({ attempt: 1 });
        return { output: result.data, confidenceScores, extractionMetadata, usedFallback: false };
      }

      // Budget check before retry: skip if first attempt already used most of the budget
      if (totalInputTokens + totalOutputTokens > MAX_TOTAL_TOKENS_BUDGET * 0.6) {
        console.warn(
          `[synthesis] First attempt used ${totalInputTokens + totalOutputTokens} tokens — skipping retry to stay within budget.`,
        );
      } else {
        // Retry with Zod errors
        const zodErrors = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
        const retryMessage = `${userMessage}\n\nYour previous response had validation errors. Fix these issues:\n${zodErrors}\n\nReturn corrected JSON only.`;

        const retry = await callSynthesisAPI(client, SYSTEM_PROMPT, retryMessage);
        totalInputTokens += retry.usage.input_tokens;
        totalOutputTokens += retry.usage.output_tokens;

        if (!retry.truncated) {
          const retryCleaned = stripMarkdownFences(retry.text);
          const retryParsed = JSON.parse(retryCleaned);
          const retryResult = designSystemOutputSchema.safeParse(retryParsed);

          if (retryResult.success) {
            await recordSynthesisUsage({ attempt: 2 });
            return { output: retryResult.data, confidenceScores, extractionMetadata, usedFallback: false };
          }
        }
      }
    }
  } catch {
    // Fall through to fallback
  }

  // Record usage even on fallback (if we made API calls)
  if (totalInputTokens > 0) {
    await recordSynthesisUsage({ fallback: true });
  }

  return {
    output: buildFallbackOutput(input),
    confidenceScores,
    extractionMetadata,
    usedFallback: true,
  };
}

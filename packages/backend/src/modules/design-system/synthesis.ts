// Phase 2D/2F — Design System Synthesis
// Uses multi-provider AI router for synthesis calls

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

import { calculateCostMicrodollars, recordUsageEvent } from '../../lib/usage.js';
import { getAIRouter } from '../../lib/ai/index.js';
import type { SynthesisResponse } from '../../lib/ai/index.js';
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

const MAX_OUTPUT_TOKENS = 5_120;
const MAX_USER_MESSAGE_CHARS = 60_000;
const MAX_TOTAL_TOKENS_BUDGET = 30_000;

// --- Core Functions ---

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function trimAggregatedData(input: SynthesisInput): SynthesisInput {
  const agg = input.aggregatedResult;
  return {
    ...input,
    aggregatedResult: {
      ...agg,
      colorPalette: agg.colorPalette.slice(0, 10),
      layoutStructures: {
        ...agg.layoutStructures,
        layouts: agg.layoutStructures.layouts.slice(0, 8),
      },
      copyPatterns: {
        ...agg.copyPatterns,
        ctaTexts: agg.copyPatterns.ctaTexts.slice(0, 10),
        tones: agg.copyPatterns.tones.slice(0, 5),
        structurePatterns: agg.copyPatterns.structurePatterns.slice(0, 5),
      },
      imageTreatment: {
        ...agg.imageTreatment,
        styles: agg.imageTreatment.styles.slice(0, 5),
        filterEffects: agg.imageTreatment.filterEffects.slice(0, 5),
      },
      inconsistencies: agg.inconsistencies.map((inc) => ({
        ...inc,
        exampleCreativeIds: inc.exampleCreativeIds.slice(0, 2),
      })),
    },
  };
}

export function stripMarkdownFences(text: string): string {
  const match = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (match) return match[1].trim();
  return text.trim();
}

export function buildConfidenceScores(aggregated: AggregatedResult): z.infer<typeof confidenceScoresSchema> {
  const tierFromFreq = (freq: number): { strong?: number; moderate?: number; emerging?: number } => {
    if (freq > 0.7) return { strong: freq };
    if (freq >= 0.4) return { moderate: freq };
    return { emerging: freq };
  };

  const scores: Record<string, { strong?: number; moderate?: number; emerging?: number }> = {};

  if (aggregated.colorPalette.length > 0) {
    const topColors = aggregated.colorPalette.slice(0, 3);
    const avgFreq = topColors.reduce((s, c) => s + c.frequency, 0) / topColors.length;
    scores.color = tierFromFreq(avgFreq);
  } else {
    scores.color = { emerging: 0 };
  }

  if (aggregated.typography.fonts.length > 0) {
    scores.typography = tierFromFreq(aggregated.typography.fonts[0].frequency);
  } else {
    scores.typography = { emerging: 0 };
  }

  if (aggregated.layoutStructures.layouts.length > 0) {
    scores.layout = tierFromFreq(aggregated.layoutStructures.layouts[0].frequency);
  } else {
    scores.layout = { emerging: 0 };
  }

  if (aggregated.copyPatterns.tones.length > 0) {
    scores.tone = tierFromFreq(aggregated.copyPatterns.tones[0].frequency);
  } else {
    scores.tone = { emerging: 0 };
  }

  if (aggregated.imageTreatment.styles.length > 0) {
    scores.imageTreatment = tierFromFreq(aggregated.imageTreatment.styles[0].frequency);
  } else {
    scores.imageTreatment = { emerging: 0 };
  }

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

export async function synthesizeDesignSystem(input: SynthesisInput): Promise<SynthesisResult> {
  const { orgId, brandId } = input;

  const confidenceScores = buildConfidenceScores(input.aggregatedResult);
  const extractionMetadata: z.infer<typeof extractionMetadataSchema> = {
    totalImages: input.totalCreatives,
    analyzedImages: input.analyzedCreatives,
    excludedImages: input.excludedCreatives,
  };

  const router = getAIRouter();

  // If no synthesis provider is available, go straight to fallback
  if (!router.isTaskAvailable('design-system-synthesis')) {
    return {
      output: buildFallbackOutput(input),
      confidenceScores,
      extractionMetadata,
      usedFallback: true,
    };
  }

  // Trim aggregated data to stay within token budget
  const trimmedInput = trimAggregatedData(input);
  const userMessage = buildUserMessage(trimmedInput);

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

  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let usedModel = '';

  const recordSynthesisUsage = async (extra: Record<string, unknown>) => {
    const costMicrodollars = calculateCostMicrodollars(usedModel, totalInputTokens, totalOutputTokens);
    await recordUsageEvent({
      orgId,
      brandId,
      eventType: 'ai-inference',
      eventSubtype: 'design-system-synthesis',
      quantity: 1,
      unit: 'synthesis',
      costMicrodollars,
      metadata: {
        model: usedModel,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        costMicrodollars,
        ...extra,
      },
    });
  };

  // First attempt
  try {
    const first: SynthesisResponse = await router.synthesize({
      systemPrompt: SYSTEM_PROMPT,
      userMessage,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    });
    totalInputTokens += first.usage.inputTokens;
    totalOutputTokens += first.usage.outputTokens;
    usedModel = first.model;

    if (!first.truncated) {
      const cleaned = stripMarkdownFences(first.text);
      const parsed = JSON.parse(cleaned);
      const result = designSystemOutputSchema.safeParse(parsed);

      if (result.success) {
        await recordSynthesisUsage({ attempt: 1, provider: first.provider });
        return { output: result.data, confidenceScores, extractionMetadata, usedFallback: false };
      }

      // Budget check before retry
      if (totalInputTokens + totalOutputTokens > MAX_TOTAL_TOKENS_BUDGET * 0.6) {
        console.warn(
          `[synthesis] First attempt used ${totalInputTokens + totalOutputTokens} tokens — skipping retry to stay within budget.`,
        );
      } else {
        // Retry with Zod errors
        const zodErrors = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
        const retryMessage = `${userMessage}\n\nYour previous response had validation errors. Fix these issues:\n${zodErrors}\n\nReturn corrected JSON only.`;

        const retry: SynthesisResponse = await router.synthesize({
          systemPrompt: SYSTEM_PROMPT,
          userMessage: retryMessage,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
        });
        totalInputTokens += retry.usage.inputTokens;
        totalOutputTokens += retry.usage.outputTokens;
        usedModel = retry.model;

        if (!retry.truncated) {
          const retryCleaned = stripMarkdownFences(retry.text);
          const retryParsed = JSON.parse(retryCleaned);
          const retryResult = designSystemOutputSchema.safeParse(retryParsed);

          if (retryResult.success) {
            await recordSynthesisUsage({ attempt: 2, provider: retry.provider });
            return { output: retryResult.data, confidenceScores, extractionMetadata, usedFallback: false };
          }
        }
      }
    }
  } catch {
    // Fall through to fallback
  }

  // Record usage even on fallback
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

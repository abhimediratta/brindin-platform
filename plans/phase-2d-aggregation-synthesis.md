# Phase 2D: Aggregation Engine + Design System Synthesis

**Status: COMPLETED** ✅

## Context

Phases 2A-2C built the infrastructure and individual analysis workers. At this point, each `brand_creatives` row has `color_analysis` (from Python k-means) and `analysis` (from Claude Vision). Phase 2D builds Stages 3 and 4 of the pipeline: aggregating individual analyses into patterns, then synthesizing a complete DesignSystem via Claude Sonnet.

These stages run **inline in the orchestrator** (not as separate queue workers) since they operate on already-collected data from the DB.

## What Exists (key files to read first)

- `packages/backend/src/db/schema.ts` — Key tables:
  - `brandCreatives`: `colorAnalysis` (jsonb), `analysis` (jsonb), `isExcluded` (bool)
  - `designSystems`: `colorPalette`, `typography`, `layoutStructures`, `imageTreatment`, `copyPatterns`, `logoUsage` (all jsonb, NOT NULL), `inconsistencyReport` (jsonb, nullable), `onboardingGuide` (text, nullable), `confidenceScores` (jsonb, nullable), `extractionMetadata` (jsonb, nullable), `version` (int, default 1), `status` (text, default 'draft'), `brandId` (uuid, unique)
- `packages/shared/src/schemas/design-system.ts` — Zod sub-schemas defining the exact output shape:
  - `colorPaletteSchema`: `{ colors: colorEntry[], guidelines?: string }`
  - `colorEntrySchema`: `{ hex, role, frequency?, confidence? }`
  - `typographySchema`: `{ fonts: fontEntry[], sizeHierarchy?, devanagariUsage?, guidelines? }`
  - `layoutStructuresSchema`: `{ layouts: layoutEntry[], dominantLayout?, guidelines? }`
  - `imageTreatmentSchema`: `{ photographyStyle?, colorGrading?, productProminence? }`
  - `copyPatternsSchema`: `{ tone?, structurePreferences?, ctaConventions?, languagePreferences? }`
  - `logoUsageSchema`: `{ preferredPosition?, sizeGuideline?, backgroundTreatment? }`
  - `confidenceScoresSchema`: `record<{ strong?, moderate?, emerging? }>`
  - `extractionMetadataSchema`: `{ totalImages, analyzedImages, excludedImages? }`
  - Color roles: `'primary' | 'secondary' | 'accent' | 'background' | 'text' | 'cta' | 'other'`
  - Confidence levels: `'strong' | 'moderate' | 'emerging'`
- `packages/backend/package.json` — (from 2A) has `@anthropic-ai/sdk` dependency

## What to Build

### 1. Aggregation Engine

**New file: `packages/backend/src/modules/design-system/aggregation.ts`**

This is a pure data-processing module — no DB calls, no API calls. Takes analyzed creatives, returns aggregated patterns.

```typescript
// ── Input Types ──

interface AnalyzedCreative {
  id: string;
  colorAnalysis: {
    colors: Array<{
      hex: string;
      rgb: [number, number, number];
      lab: [number, number, number];
      hsl: [number, number, number];
      percentage: number;
      isBackground: boolean;
    }>;
    dominantColor: string;
    backgroundColor: string | null;
  };
  analysis: {
    layout: { type: string; gridStructure: string; hierarchy: string };
    typography: {
      fonts: Array<{ family: string; role: string; weight: string; estimatedSize: string }>;
      textDensity: string;
    };
    imageTreatment: { style: string; colorGrading: string; productProminence: string };
    copyPatterns: {
      headline: string | null; bodyText: string | null; cta: string | null;
      tone: string; structure: string; languages: string[]; languageMix: string;
    };
    logoUsage: { position: string; size: string; treatment: string };
    platformEstimate: string;
  };
}

// ── Output Types ──

interface AggregatedResult {
  colorPalette: {
    colors: Array<{
      hex: string;
      role: string;        // assigned: primary, secondary, accent, background, text
      frequency: number;   // 0-1, how often this color appears across creatives
      confidence: string;  // strong (>70% of creatives), moderate (40-70%), emerging (<40%)
    }>;
    guidelines: string;
  };
  typography: {
    fonts: Array<{
      family: string;
      type: string;        // serif, sans, display
      role: string;        // heading, body, cta
      frequency: number;
    }>;
    sizeHierarchy: Record<string, unknown>;
    guidelines: string;
  };
  layoutStructures: {
    layouts: Array<{ type: string; frequency: number; platforms: string[] }>;
    dominantLayout: string;
    guidelines: string;
  };
  imageTreatment: {
    photographyStyle: string;
    colorGrading: string;
    productProminence: string;
  };
  copyPatterns: {
    tone: string;
    structurePreferences: Record<string, number>;
    ctaConventions: string[];
    languagePreferences: Record<string, number>;
  };
  logoUsage: {
    preferredPosition: string;
    sizeGuideline: string;
    backgroundTreatment: string;
  };
  inconsistencies: Array<{
    dimension: string;     // "color" | "typography" | "layout" | "copy" | "image_treatment"
    description: string;
    severity: string;      // "high" | "medium" | "low"
    examples: string[];    // creative IDs showing the inconsistency
  }>;
}

// ── Main Function ──

export async function aggregateAnalyses(creatives: AnalyzedCreative[]): Promise<AggregatedResult>
```

#### Sub-functions:

**`clusterColors(creatives)`**
- Collect all non-background colors from all creatives (weighted by percentage)
- Simple agglomerative clustering: sort by frequency, merge colors with deltaE < 15
  - deltaE = Euclidean distance in Lab space: `sqrt((L1-L2)² + (a1-a2)² + (b1-b2)²)`
- After clustering, assign roles by frequency rank:
  - Most frequent non-background = primary
  - Second = secondary
  - Third = accent
  - Most common background color = background
  - Darkest color used for text = text
- Calculate confidence per color: appears in >70% of creatives = strong, 40-70% = moderate, <40% = emerging
- Generate guidelines string: "Primary brand color is {hex}. Used in {X}% of creatives..."

**`aggregateTypography(creatives)`**
- Frequency count of font families across all creatives
- Group by role (heading/body/cta)
- For each role, the most frequent font family is the primary
- Detect "serif", "sans", "display" classification from family names
- Build size hierarchy from estimatedSize patterns
- Guidelines: "Primary heading font: {family}. Body text: {family}..."

**`analyzeLayouts(creatives)`**
- Count layout types across creatives
- Calculate frequency as proportion (count / total)
- Cross-reference with platformEstimate to build platform associations
- Identify dominant layout (highest frequency)
- Guidelines based on dominant patterns

**`analyzeCopyPatterns(creatives)`**
- Aggregate tone: frequency count, pick dominant
- Aggregate structure preferences: frequency count of each structure type
- Collect unique CTA texts, find conventions (e.g., "Shop Now" appears 60% of time)
- Language preferences: count language occurrences, compute proportions
- Note: language mix is important for Indian market context

**`analyzeImageTreatment(creatives)`**
- Frequency count of style, colorGrading, productProminence
- Pick dominant for each dimension

**`analyzeLogoUsage(creatives)`**
- Frequency count of position, size, treatment
- Pick dominant for each (excluding "absent")

**`detectInconsistencies(creatives, aggregated)`**
- **Color**: >5 distinct primary-frequency colors → "No consistent color palette"
- **Typography**: >3 different heading fonts → "Inconsistent heading typography"
- **Layout**: No single layout >25% → "No dominant layout pattern"
- **Copy**: Multiple conflicting tones (e.g., both "formal" and "playful" above 30%) → "Mixed tone"
- **Image treatment**: Multiple styles above 30% → "Inconsistent image treatment"
- Include creative IDs as examples for each inconsistency

### 2. Design System Synthesis

**New file: `packages/backend/src/modules/design-system/synthesis.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import type { AggregatedResult } from './aggregation.js';

interface SynthesisInput {
  brandName: string;
  brandCategory: string | null;
  aggregatedResult: AggregatedResult;
  sampleCreativeCount: number;
  excludedCount: number;
}

interface DesignSystemOutput {
  colorPalette: object;         // matches colorPaletteSchema
  typography: object;           // matches typographySchema
  layoutStructures: object;     // matches layoutStructuresSchema
  imageTreatment: object;       // matches imageTreatmentSchema
  copyPatterns: object;         // matches copyPatternsSchema
  logoUsage: object;            // matches logoUsageSchema
  inconsistencyReport: object;  // structured report
  onboardingGuide: string;      // markdown text
  confidenceScores: object;     // per-dimension scoring
  extractionMetadata: object;   // analysis stats
}

export async function synthesizeDesignSystem(input: SynthesisInput): Promise<DesignSystemOutput>
```

The synthesis prompt:

```
System: You are a brand design system synthesizer. Given aggregated analysis data from
{sampleCreativeCount} creatives of the brand "{brandName}" ({brandCategory}), produce
a complete, structured brand design system.

Your output must be a single JSON object with these exact keys:

1. "colorPalette" — {
     "colors": [{ "hex": "#...", "role": "primary|secondary|accent|background|text|cta", "frequency": 0-1, "confidence": "strong|moderate|emerging" }],
     "guidelines": "Human-readable color usage guidelines"
   }

2. "typography" — {
     "fonts": [{ "family": "...", "type": "serif|sans|display", "role": "heading|body|cta", "weight": "..." }],
     "sizeHierarchy": { "heading": "...", "subheading": "...", "body": "..." },
     "devanagariUsage": { ... } (if Hindi/Devanagari detected),
     "guidelines": "..."
   }

3. "layoutStructures" — {
     "layouts": [{ "type": "...", "frequency": 0-1, "platforms": [...] }],
     "dominantLayout": "...",
     "guidelines": "..."
   }

4. "imageTreatment" — {
     "photographyStyle": "...",
     "colorGrading": "...",
     "productProminence": "..."
   }

5. "copyPatterns" — {
     "tone": "...",
     "structurePreferences": { "offer-led": 0.3, ... },
     "ctaConventions": ["Shop Now", ...],
     "languagePreferences": { "en": 0.6, "hi": 0.3, ... }
   }

6. "logoUsage" — {
     "preferredPosition": "...",
     "sizeGuideline": "...",
     "backgroundTreatment": "..."
   }

7. "inconsistencyReport" — {
     "findings": [{ "dimension": "...", "description": "...", "severity": "high|medium|low", "recommendation": "..." }],
     "overallConsistency": "strong|moderate|weak"
   }

8. "onboardingGuide" — Markdown text. A concise guide for a new designer joining the team.
   Cover: brand visual identity summary, key do's and don'ts, color rules, typography rules,
   layout preferences, copy tone. Should be immediately actionable.

9. "confidenceScores" — {
     "colorPalette": "strong|moderate|emerging",
     "typography": "strong|moderate|emerging",
     "layoutStructures": "...",
     "imageTreatment": "...",
     "copyPatterns": "...",
     "logoUsage": "..."
   }
   Base confidence on: data consistency, sample size, pattern clarity.

10. "extractionMetadata" — {
      "totalImages": N,
      "analyzedImages": N,
      "excludedImages": N
    }

Guidelines:
- Be specific and actionable, not vague
- Reference the actual data (e.g., "Used in 78% of creatives" not "commonly used")
- When patterns are weak, say so clearly with "emerging" confidence
- The onboarding guide should be 300-500 words, practical, not theoretical
- Output ONLY valid JSON, no markdown wrapping
```

Implementation:
```typescript
export async function synthesizeDesignSystem(input: SynthesisInput): Promise<DesignSystemOutput> {
  const anthropic = new Anthropic();

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6-20250514',
    max_tokens: 8192,
    system: SYNTHESIS_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: JSON.stringify({
        brandName: input.brandName,
        brandCategory: input.brandCategory,
        sampleCreativeCount: input.sampleCreativeCount,
        excludedCount: input.excludedCount,
        aggregatedData: input.aggregatedResult,
      }),
    }],
  });

  const textContent = response.content.find(c => c.type === 'text');
  if (!textContent || textContent.type !== 'text') throw new Error('No text response from Claude');

  const result = JSON.parse(textContent.text) as DesignSystemOutput;

  // Validate required fields exist (the 6 NOT NULL columns)
  const required = ['colorPalette', 'typography', 'layoutStructures', 'imageTreatment', 'copyPatterns', 'logoUsage'];
  for (const field of required) {
    if (!result[field as keyof DesignSystemOutput]) {
      throw new Error(`Synthesis missing required field: ${field}`);
    }
  }

  return result;
}
```

## Files Summary

| Action | File | What Changes |
|--------|------|-------------|
| New | `backend/src/modules/design-system/aggregation.ts` | Aggregation engine with clustering + frequency analysis |
| New | `backend/src/modules/design-system/synthesis.ts` | Claude Sonnet synthesis for DesignSystem JSON |

## Verification

### Aggregation
1. Create mock data matching the `AnalyzedCreative` interface (10 creatives with realistic color and analysis data)
2. Call `aggregateAnalyses(mockCreatives)` directly
3. Verify:
   - Color palette has 5-8 clustered colors with roles assigned
   - Typography has dominant heading/body fonts identified
   - Layout has frequency counts summing to 1.0
   - Inconsistencies detected where patterns conflict
   - All frequencies are between 0 and 1

### Synthesis
1. Feed aggregation output into `synthesizeDesignSystem()`
2. Verify all 6 NOT NULL fields are present in output
3. Verify `onboardingGuide` is readable markdown (300-500 words)
4. Verify `confidenceScores` has entries for all 6 dimensions
5. Verify `extractionMetadata` has correct counts
6. Verify `inconsistencyReport` references real inconsistencies from aggregation

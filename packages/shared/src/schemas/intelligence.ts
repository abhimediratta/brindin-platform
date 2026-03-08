import { z } from 'zod';
import { uuidSchema, timestampSchema } from './common.js';

export const INTELLIGENCE_DIMENSIONS = [
  'geographic',
  'category',
  'cultural',
  'creative_pattern',
] as const;
export const intelligenceDimensionSchema = z.enum(INTELLIGENCE_DIMENSIONS);
export type IntelligenceDimension = z.infer<typeof intelligenceDimensionSchema>;

export const INTELLIGENCE_ENTRY_TYPES = [
  'platform_mix',
  'language_preference',
  'cpm_range',
  'creative_style',
  'festival_timing',
] as const;
export const intelligenceEntryTypeSchema = z.enum(INTELLIGENCE_ENTRY_TYPES);
export type IntelligenceEntryType = z.infer<typeof intelligenceEntryTypeSchema>;

export const SOURCE_TYPES = ['curated', 'aggregated'] as const;
export const sourceTypeSchema = z.enum(SOURCE_TYPES);
export type SourceType = z.infer<typeof sourceTypeSchema>;

export const CONFIDENCE_TIERS = ['strong', 'moderate', 'emerging'] as const;
export const confidenceTierSchema = z.enum(CONFIDENCE_TIERS);
export type ConfidenceTier = z.infer<typeof confidenceTierSchema>;

export const intelligenceEntrySchema = z.object({
  id: uuidSchema,
  dimension: intelligenceDimensionSchema,
  entry_type: intelligenceEntryTypeSchema,
  key: z.string().min(1),
  value: z.record(z.unknown()),
  confidence: confidenceTierSchema,
  source_type: sourceTypeSchema,
  source_references: z.array(z.string()).nullable(),
  applicable_regions: z.array(z.string()).nullable(),
  applicable_categories: z.array(z.string()).nullable(),
  valid_from: timestampSchema.nullable(),
  valid_until: timestampSchema.nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export const intelligenceEntryCreateSchema = intelligenceEntrySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  source_references: z.array(z.string()).nullish(),
  applicable_regions: z.array(z.string()).nullish(),
  applicable_categories: z.array(z.string()).nullish(),
  valid_from: timestampSchema.nullish(),
  valid_until: timestampSchema.nullish(),
});

export type IntelligenceEntry = z.infer<typeof intelligenceEntrySchema>;
export type IntelligenceEntryCreate = z.infer<typeof intelligenceEntryCreateSchema>;

import { z } from 'zod';
import { uuidSchema, timestampSchema, hexColorSchema } from './common.js';

// --- Enums ---

export const DESIGN_SYSTEM_STATUSES = ['draft', 'review', 'approved'] as const;
export const designSystemStatusSchema = z.enum(DESIGN_SYSTEM_STATUSES);
export type DesignSystemStatus = z.infer<typeof designSystemStatusSchema>;

export const COLOR_ROLES = ['primary', 'secondary', 'accent', 'background', 'text', 'cta', 'other'] as const;
export const colorRoleSchema = z.enum(COLOR_ROLES);

export const CONFIDENCE_LEVELS = ['strong', 'moderate', 'emerging'] as const;
export const confidenceLevelSchema = z.enum(CONFIDENCE_LEVELS);

export const REGION_TIERS = ['metro', 'tier1', 'tier2'] as const;
export const regionTierSchema = z.enum(REGION_TIERS);

// --- JSONB Sub-Schemas ---

export const colorEntrySchema = z.object({
  hex: hexColorSchema,
  role: colorRoleSchema,
  frequency: z.number().min(0).max(1).optional(),
  confidence: confidenceLevelSchema.optional(),
}).passthrough();

export const colorPaletteSchema = z.object({
  colors: z.array(colorEntrySchema),
  guidelines: z.string().optional(),
}).passthrough();

export const fontEntrySchema = z.object({
  family: z.string(),
  type: z.enum(['serif', 'sans', 'display']),
  role: z.enum(['heading', 'body', 'cta']),
  weight: z.union([z.string(), z.number()]).optional(),
}).passthrough();

export const typographySchema = z.object({
  fonts: z.array(fontEntrySchema),
  sizeHierarchy: z.record(z.unknown()).optional(),
  devanagariUsage: z.record(z.unknown()).optional(),
  guidelines: z.string().optional(),
}).passthrough();

export const layoutEntrySchema = z.object({
  type: z.string(),
  frequency: z.number().min(0).max(1).optional(),
  platforms: z.array(z.string()).optional(),
}).passthrough();

export const layoutStructuresSchema = z.object({
  layouts: z.array(layoutEntrySchema),
  dominantLayout: z.string().optional(),
  guidelines: z.string().optional(),
}).passthrough();

export const imageTreatmentSchema = z.object({
  photographyStyle: z.string().optional(),
  colorGrading: z.string().optional(),
  productProminence: z.string().optional(),
}).passthrough();

export const copyPatternsSchema = z.object({
  tone: z.string().optional(),
  structurePreferences: z.record(z.unknown()).optional(),
  ctaConventions: z.array(z.string()).optional(),
  languagePreferences: z.record(z.unknown()).optional(),
}).passthrough();

export const logoUsageSchema = z.object({
  preferredPosition: z.string().optional(),
  sizeGuideline: z.string().optional(),
  backgroundTreatment: z.string().optional(),
}).passthrough();

export const confidenceScoresSchema = z.record(
  z.object({
    strong: z.number().optional(),
    moderate: z.number().optional(),
    emerging: z.number().optional(),
  }).passthrough(),
);

export const extractionMetadataSchema = z.object({
  totalImages: z.number().int().nonnegative(),
  analyzedImages: z.number().int().nonnegative(),
  excludedImages: z.number().int().nonnegative().optional(),
}).passthrough();

// --- Main Design System Schema ---

export const designSystemSchema = z.object({
  id: uuidSchema,
  brand_id: uuidSchema,
  version: z.number().int().positive(),
  status: designSystemStatusSchema,
  color_palette: colorPaletteSchema.nullable(),
  typography: typographySchema.nullable(),
  layout_structures: layoutStructuresSchema.nullable(),
  image_treatment: imageTreatmentSchema.nullable(),
  copy_patterns: copyPatternsSchema.nullable(),
  logo_usage: logoUsageSchema.nullable(),
  confidence_scores: confidenceScoresSchema.nullable(),
  extraction_metadata: extractionMetadataSchema.nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export const designSystemCreateSchema = designSystemSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  version: z.number().int().positive().optional(),
  status: designSystemStatusSchema.optional(),
  color_palette: colorPaletteSchema.nullish(),
  typography: typographySchema.nullish(),
  layout_structures: layoutStructuresSchema.nullish(),
  image_treatment: imageTreatmentSchema.nullish(),
  copy_patterns: copyPatternsSchema.nullish(),
  logo_usage: logoUsageSchema.nullish(),
  confidence_scores: confidenceScoresSchema.nullish(),
  extraction_metadata: extractionMetadataSchema.nullish(),
});

export const designSystemUpdateSchema = designSystemCreateSchema.partial();

export type DesignSystem = z.infer<typeof designSystemSchema>;
export type DesignSystemCreate = z.infer<typeof designSystemCreateSchema>;
export type DesignSystemUpdate = z.infer<typeof designSystemUpdateSchema>;

// --- Design System Version Schema (append-only) ---

export const designSystemVersionSchema = z.object({
  id: uuidSchema,
  design_system_id: uuidSchema,
  version_number: z.number().int().positive(),
  snapshot: z.record(z.unknown()),
  change_summary: z.string().nullable(),
  created_by: uuidSchema.nullable(),
  created_at: timestampSchema,
});

export const designSystemVersionCreateSchema = designSystemVersionSchema.omit({
  id: true,
  created_at: true,
}).extend({
  change_summary: z.string().nullish(),
  created_by: uuidSchema.nullish(),
});

export type DesignSystemVersion = z.infer<typeof designSystemVersionSchema>;
export type DesignSystemVersionCreate = z.infer<typeof designSystemVersionCreateSchema>;

// --- Regional Variant Schema ---

export const regionalVariantSchema = z.object({
  id: uuidSchema,
  design_system_id: uuidSchema,
  region: z.string().min(1),
  tier: regionTierSchema,
  color_overrides: colorPaletteSchema.nullable(),
  typography_overrides: typographySchema.nullable(),
  copy_overrides: copyPatternsSchema.nullable(),
  custom_overrides: z.record(z.unknown()).nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export const regionalVariantCreateSchema = regionalVariantSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  color_overrides: colorPaletteSchema.nullish(),
  typography_overrides: typographySchema.nullish(),
  copy_overrides: copyPatternsSchema.nullish(),
  custom_overrides: z.record(z.unknown()).nullish(),
});

export const regionalVariantUpdateSchema = regionalVariantCreateSchema.partial();

export type RegionalVariant = z.infer<typeof regionalVariantSchema>;
export type RegionalVariantCreate = z.infer<typeof regionalVariantCreateSchema>;
export type RegionalVariantUpdate = z.infer<typeof regionalVariantUpdateSchema>;

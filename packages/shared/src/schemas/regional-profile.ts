import { z } from 'zod';
import { uuidSchema, timestampSchema } from './common.js';

// ─── Region Codes ──────────────────────────────────────────────────

export const REGION_CODES = ['TN', 'WB', 'PB', 'KL', 'MH', 'KA', 'GJ', 'DL'] as const;
export type RegionCode = typeof REGION_CODES[number];

export const regionCodeSchema = z.enum(REGION_CODES);

// ─── JSONB Sub-Schemas ─────────────────────────────────────────────

export const typographyStyleSchema = z.object({
  preferredWeight: z.enum(['bold', 'medium', 'regular']),
  density: z.enum(['high', 'medium', 'low']),
  scriptAesthetics: z.string(),
  displayPreference: z.enum(['sans-serif', 'serif', 'display']),
  notes: z.string(),
});

export const colorTendenciesSchema = z.object({
  paletteType: z.enum(['vibrant', 'earthy', 'jewel', 'warm', 'muted']),
  preferredHues: z.array(z.string()),
  saturationLevel: z.enum(['high', 'medium', 'low']),
  contrastPreference: z.enum(['high', 'medium', 'subtle']),
  festivalColors: z.record(z.array(z.string())),
  avoidColors: z.array(z.object({ color: z.string(), reason: z.string() })),
});

export const layoutDensitySchema = z.object({
  informationDensity: z.enum(['high', 'medium', 'low']),
  whitespaceTolerance: z.enum(['high', 'medium', 'low']),
  elementCountRange: z.object({ min: z.number(), max: z.number() }),
  priceProminence: z.enum(['dominant', 'prominent', 'subtle', 'hidden']),
  ctaStyle: z.string(),
});

export const copyToneSchema = z.object({
  register: z.enum(['formal', 'conversational', 'casual', 'literary']),
  humorNorm: z.enum(['witty', 'slapstick', 'subtle', 'minimal']),
  formality: z.enum(['high', 'medium', 'low']),
  literaryInfluence: z.string(),
  emotionalRegister: z.array(z.string()),
  hinglishAcceptance: z.enum(['high', 'medium', 'low', 'none']),
});

export const trustSignalsSchema = z.object({
  primary: z.array(z.string()),
  secondary: z.array(z.string()),
  format: z.array(z.string()),
});

export const visualGrammarSchema = z.object({
  motifs: z.array(z.string()),
  photographyStyle: z.string(),
  illustrationPreference: z.string(),
  modelRepresentation: z.string(),
  productPresentation: z.string(),
});

export const whatFailsSchema = z.object({
  antiPatterns: z.array(z.object({ pattern: z.string(), reason: z.string() })),
});

export const languageDevicesSchema = z.object({
  wordplayType: z.array(z.string()),
  alliteration: z.boolean(),
  poetryForms: z.array(z.string()),
  memeFormats: z.array(z.string()),
  idioms: z.array(z.string()),
  scriptMixing: z.string(),
});

// ─── Full Profile Schema ───────────────────────────────────────────

export const regionalCreativeProfileSchema = z.object({
  id: uuidSchema,
  region_code: regionCodeSchema,
  region_name: z.string().min(1),
  primary_languages: z.array(z.string()).min(1),
  typography_style: typographyStyleSchema,
  color_tendencies: colorTendenciesSchema,
  layout_density: layoutDensitySchema,
  copy_tone: copyToneSchema,
  trust_signals: trustSignalsSchema,
  visual_grammar: visualGrammarSchema,
  what_fails: whatFailsSchema.nullable(),
  language_devices: languageDevicesSchema.nullable(),
  confidence_tier: z.number().int().min(1).max(3),
  source: z.string().min(1),
  is_active: z.boolean(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

// ─── Create/Upsert Schema ──────────────────────────────────────────

export const createRegionalProfileSchema = z.object({
  regionCode: regionCodeSchema,
  regionName: z.string().min(1),
  primaryLanguages: z.array(z.string()).min(1),
  typographyStyle: typographyStyleSchema,
  colorTendencies: colorTendenciesSchema,
  layoutDensity: layoutDensitySchema,
  copyTone: copyToneSchema,
  trustSignals: trustSignalsSchema,
  visualGrammar: visualGrammarSchema,
  whatFails: whatFailsSchema.nullish(),
  languageDevices: languageDevicesSchema.nullish(),
  confidenceTier: z.number().int().min(1).max(3).default(1),
  source: z.string().min(1),
});

// ─── Query Schema ──────────────────────────────────────────────────

export const regionalProfileQuerySchema = z.object({
  regionCode: regionCodeSchema.optional(),
  isActive: z.coerce.boolean().optional(),
});

// ─── Types ─────────────────────────────────────────────────────────

export type RegionalCreativeProfile = z.infer<typeof regionalCreativeProfileSchema>;
export type CreateRegionalProfile = z.infer<typeof createRegionalProfileSchema>;
export type RegionalProfileQuery = z.infer<typeof regionalProfileQuerySchema>;

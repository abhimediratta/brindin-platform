import { z } from 'zod';
import { uuidSchema, timestampSchema, urlSchema, dimensionsSchema } from './common.js';

export const VARIANT_STATUSES = ['generated', 'selected', 'refined', 'approved', 'rejected'] as const;
export const variantStatusSchema = z.enum(VARIANT_STATUSES);
export type VariantStatus = z.infer<typeof variantStatusSchema>;

export const COPY_APPROACHES = ['offer-led', 'benefit-led', 'question-hook', 'social-proof'] as const;
export const copyApproachSchema = z.enum(COPY_APPROACHES);
export type CopyApproach = z.infer<typeof copyApproachSchema>;

export const copyContentSchema = z.object({
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  body: z.string().optional(),
  cta: z.string().optional(),
  approach: copyApproachSchema.optional(),
}).passthrough();

export const generatedVariantSchema = z.object({
  id: uuidSchema,
  generation_job_id: uuidSchema,
  brand_id: uuidSchema,
  image_url: urlSchema,
  thumbnail_url: urlSchema.nullable(),
  dimensions: dimensionsSchema,
  copy_content: copyContentSchema.nullable(),
  layout_type: z.string().nullable(),
  color_scheme: z.record(z.unknown()).nullable(),
  status: variantStatusSchema,
  score: z.number().min(0).max(1).nullable(),
  feedback: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export const generatedVariantCreateSchema = generatedVariantSchema.omit({
  id: true,
  status: true,
  score: true,
  feedback: true,
  created_at: true,
  updated_at: true,
}).extend({
  thumbnail_url: urlSchema.nullish(),
  copy_content: copyContentSchema.nullish(),
  layout_type: z.string().nullish(),
  color_scheme: z.record(z.unknown()).nullish(),
  metadata: z.record(z.unknown()).nullish(),
});

export const generatedVariantUpdateSchema = z.object({
  status: variantStatusSchema.optional(),
  score: z.number().min(0).max(1).nullable().optional(),
  feedback: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
});

export type GeneratedVariant = z.infer<typeof generatedVariantSchema>;
export type GeneratedVariantCreate = z.infer<typeof generatedVariantCreateSchema>;
export type GeneratedVariantUpdate = z.infer<typeof generatedVariantUpdateSchema>;
export type CopyContent = z.infer<typeof copyContentSchema>;

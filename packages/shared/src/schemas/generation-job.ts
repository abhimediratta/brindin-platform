import { z } from 'zod';
import { uuidSchema, timestampSchema, dimensionsSchema } from './common.js';

export const GENERATION_JOB_STATUSES = [
  'queued',
  'preprocessing',
  'generating',
  'rendering',
  'completed',
  'failed',
] as const;
export const generationJobStatusSchema = z.enum(GENERATION_JOB_STATUSES);
export type GenerationJobStatus = z.infer<typeof generationJobStatusSchema>;

export const generationJobSchema = z.object({
  id: uuidSchema,
  brand_id: uuidSchema,
  design_system_id: uuidSchema,
  campaign_brief_id: uuidSchema.nullable(),
  target_dimensions: dimensionsSchema,
  target_platform: z.string().nullable(),
  variant_count: z.number().int().positive(),
  status: generationJobStatusSchema,
  generated_count: z.number().int().nonnegative().nullable(),
  error_message: z.string().nullable(),
  started_at: timestampSchema.nullable(),
  completed_at: timestampSchema.nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export const generationJobCreateSchema = generationJobSchema.omit({
  id: true,
  status: true,
  generated_count: true,
  error_message: true,
  started_at: true,
  completed_at: true,
  created_at: true,
  updated_at: true,
}).extend({
  campaign_brief_id: uuidSchema.nullish(),
  target_platform: z.string().nullish(),
  variant_count: z.number().int().positive().optional(),
});

export type GenerationJob = z.infer<typeof generationJobSchema>;
export type GenerationJobCreate = z.infer<typeof generationJobCreateSchema>;

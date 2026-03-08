import { z } from 'zod';
import { uuidSchema, timestampSchema } from './common.js';

export const EXTRACTION_JOB_STATUSES = [
  'queued',
  'preprocessing',
  'analyzing',
  'aggregating',
  'synthesizing',
  'completed',
  'failed',
] as const;
export const extractionJobStatusSchema = z.enum(EXTRACTION_JOB_STATUSES);
export type ExtractionJobStatus = z.infer<typeof extractionJobStatusSchema>;

export const extractionJobSchema = z.object({
  id: uuidSchema,
  brand_id: uuidSchema,
  status: extractionJobStatusSchema,
  total_images: z.number().int().nonnegative().nullable(),
  processed_images: z.number().int().nonnegative().nullable(),
  result_design_system_id: uuidSchema.nullable(),
  error_message: z.string().nullable(),
  started_at: timestampSchema.nullable(),
  completed_at: timestampSchema.nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export const extractionJobCreateSchema = extractionJobSchema.omit({
  id: true,
  status: true,
  total_images: true,
  processed_images: true,
  result_design_system_id: true,
  error_message: true,
  started_at: true,
  completed_at: true,
  created_at: true,
  updated_at: true,
});

export type ExtractionJob = z.infer<typeof extractionJobSchema>;
export type ExtractionJobCreate = z.infer<typeof extractionJobCreateSchema>;

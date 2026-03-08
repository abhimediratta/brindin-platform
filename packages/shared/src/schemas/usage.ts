import { z } from 'zod';
import { uuidSchema, timestampSchema } from './common.js';

export const USAGE_EVENT_TYPES = [
  'extraction',
  'generation',
  'evaluation',
  'storage_upload',
  'ai_api_call',
] as const;
export const usageEventTypeSchema = z.enum(USAGE_EVENT_TYPES);
export type UsageEventType = z.infer<typeof usageEventTypeSchema>;

export const USAGE_UNITS = [
  'images',
  'variants',
  'bytes',
  'input_tokens',
  'output_tokens',
  'api_call',
] as const;
export const usageUnitSchema = z.enum(USAGE_UNITS);
export type UsageUnit = z.infer<typeof usageUnitSchema>;

export const usageEventSchema = z.object({
  id: uuidSchema,
  organization_id: uuidSchema,
  user_id: uuidSchema.nullable(),
  event_type: usageEventTypeSchema,
  unit: usageUnitSchema,
  quantity: z.number().nonnegative(),
  metadata: z.record(z.unknown()).nullable(),
  created_at: timestampSchema,
});

export const usageEventCreateSchema = usageEventSchema.omit({
  id: true,
  created_at: true,
}).extend({
  user_id: uuidSchema.nullish(),
  metadata: z.record(z.unknown()).nullish(),
});

export const usageSummarySchema = z.object({
  organization_id: uuidSchema,
  period_start: timestampSchema,
  period_end: timestampSchema,
  event_type: usageEventTypeSchema,
  unit: usageUnitSchema,
  total_quantity: z.number().nonnegative(),
  event_count: z.number().int().nonnegative(),
});

export type UsageEvent = z.infer<typeof usageEventSchema>;
export type UsageEventCreate = z.infer<typeof usageEventCreateSchema>;
export type UsageSummary = z.infer<typeof usageSummarySchema>;

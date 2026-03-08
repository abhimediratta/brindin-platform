import { z } from 'zod';
import { uuidSchema, timestampSchema, urlSchema, dimensionsSchema } from './common.js';

export const brandCreativeSchema = z.object({
  id: uuidSchema,
  brand_id: uuidSchema,
  original_url: urlSchema,
  thumbnail_url: urlSchema.nullable(),
  file_name: z.string(),
  file_size_bytes: z.number().int().nonnegative(),
  mime_type: z.string(),
  dimensions: dimensionsSchema.nullable(),
  platform: z.string().nullable(),
  captured_at: timestampSchema.nullable(),
  metadata: z.record(z.unknown()).nullable(),
  created_at: timestampSchema,
});

export const brandCreativeCreateSchema = brandCreativeSchema.omit({
  id: true,
  created_at: true,
}).extend({
  thumbnail_url: urlSchema.nullish(),
  dimensions: dimensionsSchema.nullish(),
  platform: z.string().nullish(),
  captured_at: timestampSchema.nullish(),
  metadata: z.record(z.unknown()).nullish(),
});

export type BrandCreative = z.infer<typeof brandCreativeSchema>;
export type BrandCreativeCreate = z.infer<typeof brandCreativeCreateSchema>;

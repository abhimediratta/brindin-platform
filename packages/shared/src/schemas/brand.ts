import { z } from 'zod';
import { uuidSchema, timestampSchema, slugSchema } from './common.js';

export const brandSchema = z.object({
  id: uuidSchema,
  organization_id: uuidSchema,
  name: z.string().min(1).max(200),
  slug: slugSchema,
  description: z.string().nullable(),
  logo_url: z.string().url().nullable(),
  website_url: z.string().url().nullable(),
  industry: z.string().nullable(),
  target_markets: z.array(z.string()).nullable(),
  settings: z.record(z.unknown()).nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export const brandCreateSchema = brandSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  description: z.string().nullish(),
  logo_url: z.string().url().nullish(),
  website_url: z.string().url().nullish(),
  industry: z.string().nullish(),
  target_markets: z.array(z.string()).nullish(),
  settings: z.record(z.unknown()).nullish(),
});

export const brandUpdateSchema = brandCreateSchema.partial();

export type Brand = z.infer<typeof brandSchema>;
export type BrandCreate = z.infer<typeof brandCreateSchema>;
export type BrandUpdate = z.infer<typeof brandUpdateSchema>;

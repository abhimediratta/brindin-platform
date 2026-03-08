import { z } from 'zod';
import { uuidSchema, timestampSchema, slugSchema } from './common.js';

export const ORG_PLANS = ['free', 'starter', 'pro', 'enterprise'] as const;
export const orgPlanSchema = z.enum(ORG_PLANS);
export type OrgPlan = z.infer<typeof orgPlanSchema>;

export const organizationSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).max(200),
  slug: slugSchema,
  plan: orgPlanSchema,
  logo_url: z.string().url().nullable(),
  settings: z.record(z.unknown()).nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export const organizationCreateSchema = organizationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  plan: orgPlanSchema.optional(),
  logo_url: z.string().url().nullish(),
  settings: z.record(z.unknown()).nullish(),
});

export type Organization = z.infer<typeof organizationSchema>;
export type OrganizationCreate = z.infer<typeof organizationCreateSchema>;

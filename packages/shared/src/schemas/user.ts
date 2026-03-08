import { z } from 'zod';
import { uuidSchema, timestampSchema } from './common.js';

export const USER_ROLES = ['admin', 'manager', 'designer', 'viewer'] as const;
export const userRoleSchema = z.enum(USER_ROLES);
export type UserRole = z.infer<typeof userRoleSchema>;

export const userSchema = z.object({
  id: uuidSchema,
  organization_id: uuidSchema,
  email: z.string().email(),
  name: z.string().min(1).max(200),
  role: userRoleSchema,
  avatar_url: z.string().url().nullable(),
  auth_provider_id: z.string().nullable(),
  last_login_at: timestampSchema.nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export const userCreateSchema = userSchema.omit({
  id: true,
  last_login_at: true,
  created_at: true,
  updated_at: true,
}).extend({
  role: userRoleSchema.optional(),
  avatar_url: z.string().url().nullish(),
  auth_provider_id: z.string().nullish(),
});

export type User = z.infer<typeof userSchema>;
export type UserCreate = z.infer<typeof userCreateSchema>;

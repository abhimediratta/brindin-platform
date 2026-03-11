import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3001),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().url(),

  // Cloudflare R2
  R2_ENDPOINT: z.string().url(),
  R2_ACCESS_KEY: z.string(),
  R2_SECRET_KEY: z.string(),
  R2_BUCKET: z.string(),

  // AI Services (optional until Phase 2)
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_GENAI_API_KEY: z.string().optional(),
  SARVAM_API_KEY: z.string().optional(),

  // API Authentication (optional — dev mode works without it)
  API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;

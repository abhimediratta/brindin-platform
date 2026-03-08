import { z } from 'zod';

export const uuidSchema = z.string().uuid();

export const timestampSchema = z.string().datetime({ offset: true });

export const dateSchema = z.string().date();

export const slugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const urlSchema = z.string().url();

export const dimensionsSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const jsonbSchema = z.record(z.unknown());

export type UUID = z.infer<typeof uuidSchema>;
export type Timestamp = z.infer<typeof timestampSchema>;
export type Dimensions = z.infer<typeof dimensionsSchema>;

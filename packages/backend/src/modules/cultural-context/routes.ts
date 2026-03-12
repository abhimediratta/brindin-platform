import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { AppEnv } from '../../server/types.js';
import { createRegionalProfileSchema, regionCodeSchema } from '@brindin/shared';
import * as profileService from './regional-profile.service.js';

const culturalRoutes = new Hono<AppEnv>();

// GET /cultural/regions — list all active regional profiles
culturalRoutes.get('/cultural/regions', async (c) => {
  const profiles = await profileService.getAllActiveProfiles();
  return c.json({ profiles });
});

// GET /cultural/regions/:code — get single profile by region code
culturalRoutes.get('/cultural/regions/:code', async (c) => {
  const code = c.req.param('code').toUpperCase();
  const parsed = regionCodeSchema.safeParse(code);
  if (!parsed.success) {
    return c.json({ error: `Invalid region code: ${code}` }, 400);
  }

  const profile = await profileService.getProfile(parsed.data);
  if (!profile) {
    return c.json({ error: `Region profile not found: ${code}` }, 404);
  }

  return c.json({ profile });
});

// PUT /cultural/regions/:code — upsert a regional profile
culturalRoutes.put(
  '/cultural/regions/:code',
  zValidator('json', createRegionalProfileSchema.omit({ regionCode: true })),
  async (c) => {
    const code = c.req.param('code').toUpperCase();
    const parsed = regionCodeSchema.safeParse(code);
    if (!parsed.success) {
      return c.json({ error: `Invalid region code: ${code}` }, 400);
    }

    const data = c.req.valid('json');
    const profile = await profileService.upsertProfile({
      ...data,
      regionCode: parsed.data,
    });

    return c.json({ profile });
  },
);

// DELETE /cultural/regions/:code — deactivate (soft delete)
culturalRoutes.delete('/cultural/regions/:code', async (c) => {
  const code = c.req.param('code').toUpperCase();
  const parsed = regionCodeSchema.safeParse(code);
  if (!parsed.success) {
    return c.json({ error: `Invalid region code: ${code}` }, 400);
  }

  await profileService.deactivateProfile(parsed.data);
  return c.json({ success: true });
});

export default culturalRoutes;

// Phase 3G — Design System Routes
// API routes for editing, versioning, and variant management

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { AppEnv } from '../types.js';
import * as brandService from '../../services/brand.service.js';
import * as designSystemService from '../../services/design-system.service.js';

const designSystem = new Hono<AppEnv>();

// ─── Helpers ─────────────────────────────────────────────────────────

async function requireBrand(orgId: string, brandId: string) {
  const brand = await brandService.getBrandById(orgId, brandId);
  if (!brand) {
    throw new HTTPException(404, { message: 'Brand not found' });
  }
  return brand;
}

// ─── PATCH /brands/:id/design-system — partial update ────────────────

designSystem.patch('/brands/:id/design-system', async (c) => {
  const orgId = c.get('orgId');
  const brandId = c.req.param('id');
  await requireBrand(orgId, brandId);

  const body = await c.req.json();

  // Only allow known design system fields
  const allowed = [
    'colorPalette',
    'typography',
    'layoutStructures',
    'imageTreatment',
    'copyPatterns',
    'logoUsage',
  ] as const;

  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) {
      updates[key] = body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No valid fields provided' }, 400);
  }

  const result = await designSystemService.updateDesignSystem(
    brandId,
    orgId,
    updates,
  );
  return c.json({ designSystem: result });
});

// ─── PATCH /brands/:id/design-system/status — status transition ──────

designSystem.patch('/brands/:id/design-system/status', async (c) => {
  const orgId = c.get('orgId');
  const brandId = c.req.param('id');
  await requireBrand(orgId, brandId);

  const body = await c.req.json<{ status: string }>();
  if (!body.status) {
    return c.json({ error: 'status is required' }, 400);
  }

  const validStatuses = ['draft', 'review', 'approved'];
  if (!validStatuses.includes(body.status)) {
    return c.json(
      { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
      400,
    );
  }

  const result = await designSystemService.updateDesignSystemStatus(
    brandId,
    orgId,
    body.status,
  );
  return c.json({ designSystem: result });
});

// ─── POST /brands/:id/design-system/versions — create snapshot ───────

designSystem.post('/brands/:id/design-system/versions', async (c) => {
  const orgId = c.get('orgId');
  const brandId = c.req.param('id');
  await requireBrand(orgId, brandId);

  let changeSummary: string | undefined;
  try {
    const body = await c.req.json<{ changeSummary?: string }>();
    changeSummary = body.changeSummary;
  } catch {
    // Body is optional for this endpoint
  }

  const version = await designSystemService.createVersion(
    brandId,
    orgId,
    changeSummary,
  );
  return c.json({ version }, 201);
});

// ─── GET /brands/:id/design-system/versions — list versions ──────────

designSystem.get('/brands/:id/design-system/versions', async (c) => {
  const orgId = c.get('orgId');
  const brandId = c.req.param('id');
  await requireBrand(orgId, brandId);

  const versions = await designSystemService.listVersions(brandId, orgId);
  return c.json({ versions });
});

// ─── GET /brands/:id/design-system/versions/:vid — get version ───────

designSystem.get('/brands/:id/design-system/versions/:vid', async (c) => {
  const orgId = c.get('orgId');
  const brandId = c.req.param('id');
  await requireBrand(orgId, brandId);

  const versionId = c.req.param('vid');
  const version = await designSystemService.getVersion(
    brandId,
    orgId,
    versionId,
  );
  return c.json({ version });
});

// ─── POST /brands/:id/design-system/versions/:vid/restore ────────────

designSystem.post(
  '/brands/:id/design-system/versions/:vid/restore',
  async (c) => {
    const orgId = c.get('orgId');
    const brandId = c.req.param('id');
    await requireBrand(orgId, brandId);

    const versionId = c.req.param('vid');
    const designSystemResult = await designSystemService.restoreVersion(
      brandId,
      orgId,
      versionId,
    );
    return c.json({ designSystem: designSystemResult });
  },
);

// ─── PATCH /brands/:id/design-system/variants/:vid — update variant ──

designSystem.patch(
  '/brands/:id/design-system/variants/:vid',
  async (c) => {
    const orgId = c.get('orgId');
    const brandId = c.req.param('id');
    await requireBrand(orgId, brandId);

    const variantId = c.req.param('vid');
    const body = await c.req.json();

    const allowed = [
      'colorOverrides',
      'typographyOverrides',
      'copyOverrides',
      'culturalNotes',
    ] as const;

    const overrides: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) {
        overrides[key] = body[key];
      }
    }

    if (Object.keys(overrides).length === 0) {
      return c.json({ error: 'No valid override fields provided' }, 400);
    }

    const variant = await designSystemService.updateVariant(
      brandId,
      orgId,
      variantId,
      overrides,
    );
    return c.json({ variant });
  },
);

export default designSystem;

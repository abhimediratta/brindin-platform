import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import type { AppEnv } from '../types.js';
import * as brandService from '../../services/brand.service.js';
import { uploadFile, getSignedDownloadUrl } from '../../lib/storage.js';
import { recordUsageEvent } from '../../lib/usage.js';
import { thumbnailQueue } from '../../lib/queue.js';

const brands = new Hono<AppEnv>();

// ─── Validation Schemas ──────────────────────────────────────────────

const createBrandSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  categoryVertical: z.string().optional(),
  categorySub: z.string().optional(),
  targetGeographies: z.array(z.string()).optional(),
  logoUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

// ─── Routes ──────────────────────────────────────────────────────────

brands.post(
  '/brands',
  zValidator('json', createBrandSchema),
  async (c) => {
    const orgId = c.get('orgId');
    const data = c.req.valid('json');
    const brand = await brandService.createBrand(orgId, data);
    return c.json({ brand }, 201);
  },
);

brands.get('/brands', async (c) => {
  const orgId = c.get('orgId');
  const result = await brandService.listBrands(orgId);
  return c.json({ brands: result });
});

brands.get('/brands/:id', async (c) => {
  const orgId = c.get('orgId');
  const brandId = c.req.param('id');
  const brand = await brandService.getBrandById(orgId, brandId);

  if (!brand) {
    return c.json({ error: 'Brand not found' }, 404);
  }

  return c.json({ brand });
});

brands.post('/brands/:id/creatives/upload', async (c) => {
  const orgId = c.get('orgId');
  const brandId = c.req.param('id');

  // Verify brand exists and belongs to org
  const brand = await brandService.getBrandById(orgId, brandId);
  if (!brand) {
    return c.json({ error: 'Brand not found' }, 404);
  }

  const body = await c.req.parseBody();
  const file = body['file'];

  if (!(file instanceof File)) {
    return c.json({ error: 'Missing or invalid "file" field' }, 400);
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return c.json(
      {
        error: `Invalid file type "${file.type}". Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      },
      400,
    );
  }

  // Upload to R2
  const fileId = randomUUID();
  const s3Key = `orgs/${orgId}/brands/${brandId}/creatives/${fileId}/${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await uploadFile(s3Key, buffer, file.type);

  // Create DB record
  const creative = await brandService.createCreativeRecord(brandId, {
    fileUrl: s3Key,
    fileType: file.type,
    fileSizeBytes: file.size,
    originalFilename: file.name,
  });

  // Fire-and-forget usage event
  recordUsageEvent({
    orgId,
    brandId,
    eventType: 'storage_upload',
    unit: 'bytes',
    quantity: file.size,
  }).catch(console.error);

  // Enqueue thumbnail generation (contract for Phase 1F workers)
  thumbnailQueue
    .add('generate-thumbnail', {
      creativeId: creative.id,
      s3Key,
      fileType: file.type,
    })
    .catch(console.error);

  return c.json({ creative }, 201);
});

brands.get('/brands/:id/creatives', async (c) => {
  const orgId = c.get('orgId');
  const brandId = c.req.param('id');

  const limit = Math.min(Number(c.req.query('limit')) || 50, 100);
  const offset = Math.max(Number(c.req.query('offset')) || 0, 0);

  // Verify brand exists and belongs to org
  const brand = await brandService.getBrandById(orgId, brandId);
  if (!brand) {
    return c.json({ error: 'Brand not found' }, 404);
  }

  const creatives = await brandService.listCreatives(brandId, {
    limit,
    offset,
  });

  // Generate signed URLs for each creative
  const creativesWithUrls = await Promise.all(
    creatives.map(async (creative) => ({
      ...creative,
      signedUrl: await getSignedDownloadUrl(creative.fileUrl),
      thumbnailSignedUrl: creative.thumbnailUrl
        ? await getSignedDownloadUrl(creative.thumbnailUrl)
        : null,
    })),
  );

  return c.json({
    creatives: creativesWithUrls,
    pagination: { limit, offset, count: creativesWithUrls.length },
  });
});

export default brands;

// Phase 2E — Extraction Routes
// API routes for triggering extraction, fetching design systems, and job status

import { Hono } from 'hono';
import type { AppEnv } from '../types.js';
import * as brandService from '../../services/brand.service.js';
import {
  createExtractionJob,
  getActiveExtractionJob,
  getExtractionJob,
  getDesignSystemByBrand,
} from '../../modules/design-system/extraction.service.js';
import { extractionQueue } from '../../lib/queue.js';

const extraction = new Hono<AppEnv>();

// POST /brands/:id/design-system/extract — trigger extraction pipeline
extraction.post('/brands/:id/design-system/extract', async (c) => {
  const orgId = c.get('orgId');
  const brandId = c.req.param('id');

  // Verify brand exists and belongs to org
  const brand = await brandService.getBrandById(orgId, brandId);
  if (!brand) {
    return c.json({ error: 'Brand not found' }, 404);
  }

  // Check for active extraction job
  const activeJob = await getActiveExtractionJob(brandId);
  if (activeJob) {
    return c.json(
      {
        error: 'An extraction is already in progress for this brand',
        jobId: activeJob.id,
        status: activeJob.status,
        stage: activeJob.stage,
      },
      409,
    );
  }

  // Create job and enqueue
  const job = await createExtractionJob(brandId);

  await extractionQueue.add('run-extraction', {
    jobId: job.id,
    brandId,
    orgId,
  });

  return c.json({ job }, 202);
});

// GET /brands/:id/design-system — fetch current design system
extraction.get('/brands/:id/design-system', async (c) => {
  const orgId = c.get('orgId');
  const brandId = c.req.param('id');

  // Verify brand exists and belongs to org
  const brand = await brandService.getBrandById(orgId, brandId);
  if (!brand) {
    return c.json({ error: 'Brand not found' }, 404);
  }

  const designSystem = await getDesignSystemByBrand(brandId);
  if (!designSystem) {
    return c.json({ error: 'No design system found for this brand' }, 404);
  }

  return c.json({ designSystem });
});

// GET /brands/:id/extraction-jobs/:jobId — get job status
extraction.get('/brands/:id/extraction-jobs/:jobId', async (c) => {
  const orgId = c.get('orgId');
  const brandId = c.req.param('id');

  // Verify brand exists and belongs to org
  const brand = await brandService.getBrandById(orgId, brandId);
  if (!brand) {
    return c.json({ error: 'Brand not found' }, 404);
  }

  const jobId = c.req.param('jobId');
  const job = await getExtractionJob(jobId);

  if (!job || job.brandId !== brandId) {
    return c.json({ error: 'Extraction job not found' }, 404);
  }

  return c.json({ job });
});

export default extraction;

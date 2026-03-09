// Phase 2E — Extraction Orchestrator Worker
// BullMQ worker on the 'extraction' queue that delegates to runExtractionPipeline

import { createWorker } from '../lib/queue.js';
import { runExtractionPipeline } from '../modules/design-system/orchestrator.js';

interface ExtractionJobData {
  jobId: string;
  brandId: string;
  orgId: string;
}

async function processExtraction(job: { data: ExtractionJobData }): Promise<void> {
  const { jobId, brandId, orgId } = job.data;
  await runExtractionPipeline(jobId, brandId, orgId);
}

export const extractionOrchestratorWorker = createWorker<ExtractionJobData>(
  'extraction',
  processExtraction,
  { concurrency: 2 },
);

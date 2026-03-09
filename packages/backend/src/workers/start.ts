import '../lib/env.js';
import type { Worker } from 'bullmq';

import { visionWorker } from './claude-vision.js';
import { extractionOrchestratorWorker } from './extraction-orchestrator.js';

const workers: Worker[] = [
  visionWorker,
  extractionOrchestratorWorker,
];

console.log(`[workers] Starting ${workers.length} worker(s)…`);

async function shutdown() {
  console.log('[workers] Shutting down…');
  await Promise.all(workers.map((w) => w.close()));
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

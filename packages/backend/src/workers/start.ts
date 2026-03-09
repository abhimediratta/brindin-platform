import '../lib/env.js';
import type { Worker } from 'bullmq';

// Worker imports — uncomment as phases are implemented
// import { preprocessingWorker } from './preprocessing.js';
// import { colorExtractionWorker } from './color-extraction.js';
// import { visionAnalysisWorker } from './vision-analysis.js';

const workers: Worker[] = [
  // preprocessingWorker,
  // colorExtractionWorker,
  // visionAnalysisWorker,
];

console.log(`[workers] Starting ${workers.length} worker(s)…`);

async function shutdown() {
  console.log('[workers] Shutting down…');
  await Promise.all(workers.map((w) => w.close()));
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

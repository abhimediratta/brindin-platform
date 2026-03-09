# Phase 2A: Infrastructure Foundation ✅ COMPLETED

## Context

Phase 1 built the Hono API server, BullMQ queues (`thumbnails`, `extraction`, `generation`), R2 storage, and WebSocket skeleton. Phase 2A adds the infrastructure needed before any pipeline workers can be built: Redis pub/sub for cross-process communication, new queue definitions, a Node worker entry point, and WebSocket progress broadcasting.

## What Exists (key files to read first)

- `packages/backend/src/lib/queue.ts` — 3 existing queues, `redisConnection` config, `createWorker()` factory
- `packages/backend/src/server/ws.ts` — `/ws/jobs/:jobId` WebSocket route (logs only, no broadcasting)
- `packages/backend/src/server/index.ts` — Hono app with middleware, routes, WS setup
- `packages/backend/package.json` — current deps (no `@anthropic-ai/sdk` or `ioredis`)
- `packages/backend/src/lib/env.ts` — env schema (has optional `ANTHROPIC_API_KEY`)

## What to Build

### 1. Add Dependencies

**Modify: `packages/backend/package.json`**
- Add `@anthropic-ai/sdk` to dependencies (Claude API client, needed in 2C/2D)
- Add `ioredis` to dependencies (Redis pub/sub — BullMQ uses ioredis internally but shared connections can't do pub/sub)
- Add script: `"dev:workers": "tsx watch src/workers/start.ts"`

### 2. Redis Pub/Sub Utility

**New file: `packages/backend/src/lib/redis-pubsub.ts`**

Create dedicated Redis connections for pub/sub (separate from BullMQ's connections). Reuse the `redisConnection` config from `queue.ts`.

Functions:
```typescript
// Lazy-initialized singleton connections
getPublisher(): Redis       // For publishing progress events
getSubscriber(): Redis      // For subscribing to progress channels

// Publish extraction progress (called by workers)
publishProgress(jobId: string, data: {
  stage: string;           // 'preprocessing' | 'analyzing' | 'aggregating' | 'synthesizing'
  progress: number;        // 0-100
  processedImages?: number;
  excludedImages?: number;
  message?: string;
}): Promise<void>
// Publishes to channel: `extraction:progress:{jobId}`

// Stage completion coordination (called by child workers after each job)
signalStageProgress(jobId: string, stage: string): Promise<boolean>
// INCR `extraction:{jobId}:{stage}:completed`
// Compare against `extraction:{jobId}:{stage}:total`
// If equal: publish completion event to `extraction:orchestration:{jobId}`, return true
// Else: return false

// Wait for all child jobs in a stage to complete (called by orchestrator)
waitForStageCompletion(jobId: string, stage: string, timeoutMs?: number): Promise<void>
// Default timeout: 30 minutes
// Subscribe to `extraction:orchestration:{jobId}`
// Resolve when stage-complete message received
// Reject on timeout

// Initialize stage counters (called by orchestrator before dispatching)
initStageCounter(jobId: string, stage: string, total: number): Promise<void>
// SET `extraction:{jobId}:{stage}:total` {total}
// SET `extraction:{jobId}:{stage}:completed` 0
// EXPIRE both keys 86400 (24h)

// Cleanup (called when pipeline completes)
cleanupPipelineKeys(jobId: string): Promise<void>
// DEL all `extraction:{jobId}:*` keys
```

### 3. Extend Queue Definitions

**Modify: `packages/backend/src/lib/queue.ts`**

Add to `QUEUE_NAMES`:
```typescript
PREPROCESSING: 'preprocessing',
COLOR_EXTRACTION: 'color-extraction',
VISION_ANALYSIS: 'vision-analysis',
```

Create corresponding Queue instances:
```typescript
export const preprocessingQueue = new Queue(QUEUE_NAMES.PREPROCESSING, { connection: redisConnection });
export const colorExtractionQueue = new Queue(QUEUE_NAMES.COLOR_EXTRACTION, { connection: redisConnection });
export const visionAnalysisQueue = new Queue(QUEUE_NAMES.VISION_ANALYSIS, { connection: redisConnection });
```

### 4. Node Worker Entry Point

**New file: `packages/backend/src/workers/start.ts`**

Separate process from Hono server. Loads env, imports worker registrations, handles graceful shutdown.

```typescript
// Load env
import '../lib/env.js';

// Import workers (each file registers itself via createWorker)
// These will be added in phases 2C and 2E:
// import './claude-vision.js';
// import './extraction-orchestrator.js';

console.log('Node workers started');

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down workers...');
  // Close all imported workers
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
```

For now, this is a skeleton that will be extended as workers are added in later sub-phases.

### 5. Enhance WebSocket with Redis Pub/Sub Bridge

**Modify: `packages/backend/src/server/ws.ts`**

On WebSocket connect for a jobId:
1. Send `{ type: 'connected', jobId }` (existing)
2. Create a **new** Redis subscriber (each WS connection needs its own because Redis pub/sub is per-connection)
3. Subscribe to `extraction:progress:{jobId}`
4. On message: forward to WS client as `{ type: 'progress', ...data }`
5. On WS close: unsubscribe and quit the subscriber connection

Important: Use `ioredis` directly (not the shared subscriber from redis-pubsub.ts) because each WebSocket connection needs its own subscription. Create a new `Redis` instance per connection and `quit()` it on close.

```typescript
import Redis from 'ioredis';
import { redisConnection } from '../lib/queue.js';

// In onOpen:
const sub = new Redis({ host: redisConnection.host, port: redisConnection.port, password: redisConnection.password });
const channel = `extraction:progress:${jobId}`;
sub.subscribe(channel);
sub.on('message', (ch, message) => {
  if (ch === channel) {
    ws.send(JSON.stringify({ type: 'progress', ...JSON.parse(message) }));
  }
});

// In onClose:
sub.unsubscribe(channel);
sub.quit();
```

## Files Summary

| Action | File | What Changes |
|--------|------|-------------|
| Modify | `backend/package.json` | Add `@anthropic-ai/sdk`, `ioredis` deps + `dev:workers` script |
| New | `backend/src/lib/redis-pubsub.ts` | Redis pub/sub utility with progress + stage coordination |
| Modify | `backend/src/lib/queue.ts` | Add 3 new queue names + Queue instances |
| New | `backend/src/workers/start.ts` | Node worker entry point (skeleton) |
| Modify | `backend/src/server/ws.ts` | Redis pub/sub → WebSocket bridge |

## Verification

1. `pnpm install` succeeds with new deps
2. `pnpm --filter backend typecheck` passes
3. Start infra: `docker compose up -d`
4. Start API server: `pnpm --filter backend dev`
5. Connect to `ws://localhost:3001/ws/jobs/test-123` via wscat or browser
6. Manually publish to Redis: `redis-cli PUBLISH extraction:progress:test-123 '{"stage":"preprocessing","progress":50}'`
7. Verify WS client receives: `{"type":"progress","stage":"preprocessing","progress":50}`

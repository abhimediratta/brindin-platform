import { Queue, Worker, type Processor, type WorkerOptions } from 'bullmq';
import { env } from './env.js';

const redisUrl = new URL(env.REDIS_URL);

export const redisConnection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port) || 6379,
  password: redisUrl.password || undefined,
};

export const QUEUE_NAMES = {
  THUMBNAILS: 'thumbnails',
  EXTRACTION: 'extraction',
  GENERATION: 'generation',
} as const;

export const thumbnailQueue = new Queue(QUEUE_NAMES.THUMBNAILS, {
  connection: redisConnection,
});

export const extractionQueue = new Queue(QUEUE_NAMES.EXTRACTION, {
  connection: redisConnection,
});

export const generationQueue = new Queue(QUEUE_NAMES.GENERATION, {
  connection: redisConnection,
});

export function createWorker<T = unknown, R = unknown>(
  queueName: string,
  processor: Processor<T, R>,
  options?: Partial<WorkerOptions>,
): Worker<T, R> {
  return new Worker<T, R>(queueName, processor, {
    connection: redisConnection,
    ...options,
  });
}

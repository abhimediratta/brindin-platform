import { Redis } from 'ioredis';
import { redisConnection } from './queue.js';

export interface ProgressData {
  stage: string;
  progress: number;
  processedImages?: number;
  excludedImages?: number;
  message?: string;
}

let publisher: Redis | null = null;
let subscriber: Redis | null = null;

export function getPublisher(): Redis {
  if (!publisher) {
    publisher = new Redis(redisConnection);
  }
  return publisher;
}

export function getSubscriber(): Redis {
  if (!subscriber) {
    subscriber = new Redis(redisConnection);
  }
  return subscriber;
}

const KEY_TTL = 60 * 60 * 24; // 24 hours

export async function publishProgress(
  jobId: string,
  data: ProgressData,
): Promise<void> {
  await getPublisher().publish(
    `extraction:progress:${jobId}`,
    JSON.stringify(data),
  );
}

export async function initStageCounter(
  jobId: string,
  stage: string,
  total: number,
): Promise<void> {
  const pub = getPublisher();
  const pipeline = pub.pipeline();
  pipeline.set(`extraction:${jobId}:${stage}:total`, total, 'EX', KEY_TTL);
  pipeline.set(`extraction:${jobId}:${stage}:completed`, 0, 'EX', KEY_TTL);
  await pipeline.exec();
}

export async function signalStageProgress(
  jobId: string,
  stage: string,
): Promise<boolean> {
  const pub = getPublisher();
  const completed = await pub.incr(`extraction:${jobId}:${stage}:completed`);
  const total = await pub.get(`extraction:${jobId}:${stage}:total`);

  if (total !== null && completed >= Number(total)) {
    await pub.publish(
      `extraction:orchestration:${jobId}`,
      JSON.stringify({ event: 'stage-complete', stage }),
    );
    return true;
  }
  return false;
}

export function waitForStageCompletion(
  jobId: string,
  stage: string,
  timeoutMs = 30 * 60 * 1000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const channel = `extraction:orchestration:${jobId}`;
    const sub = new Redis(redisConnection);

    const timeout = setTimeout(() => {
      sub.unsubscribe(channel);
      sub.quit();
      reject(new Error(`Timeout waiting for stage "${stage}" on job ${jobId}`));
    }, timeoutMs);

    sub.subscribe(channel).catch((err) => {
      clearTimeout(timeout);
      sub.quit();
      reject(err);
    });

    sub.on('message', (_ch: string, message: string) => {
      const data = JSON.parse(message) as {
        event: string;
        stage: string;
      };
      if (data.event === 'stage-complete' && data.stage === stage) {
        clearTimeout(timeout);
        sub.unsubscribe(channel);
        sub.quit();
        resolve();
      }
    });
  });
}

export async function cleanupPipelineKeys(jobId: string): Promise<void> {
  const pub = getPublisher();
  const pattern = `extraction:${jobId}:*`;
  let cursor = '0';

  do {
    const [nextCursor, keys] = await pub.scan(
      cursor,
      'MATCH',
      pattern,
      'COUNT',
      100,
    );
    cursor = nextCursor;
    if (keys.length > 0) {
      await pub.del(...keys);
    }
  } while (cursor !== '0');
}

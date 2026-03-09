import { createNodeWebSocket } from '@hono/node-ws';
import type { Hono } from 'hono';
import { Redis } from 'ioredis';
import { redisConnection } from '../lib/queue.js';
import type { AppEnv } from './types.js';

export function setupWebSocket(app: Hono<AppEnv>) {
  const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

  app.get(
    '/ws/jobs/:jobId',
    upgradeWebSocket((c) => {
      const jobId = c.req.param('jobId');
      let sub: Redis | null = null;

      return {
        onOpen(_event, ws) {
          console.log(`[WS] Client connected for job ${jobId}`);
          ws.send(JSON.stringify({ type: 'connected', jobId }));

          sub = new Redis(redisConnection);
          const channel = `extraction:progress:${jobId}`;

          sub.subscribe(channel).catch((err) => {
            console.error(`[WS] Subscribe error for job ${jobId}:`, err);
          });

          sub.on('message', (_ch: string, message: string) => {
            try {
              const data = JSON.parse(message);
              ws.send(JSON.stringify({ type: 'progress', ...data }));
            } catch {
              console.error(`[WS] Failed to parse message for job ${jobId}`);
            }
          });
        },
        onClose() {
          console.log(`[WS] Client disconnected for job ${jobId}`);
          if (sub) {
            sub.unsubscribe();
            sub.quit();
            sub = null;
          }
        },
        onMessage(event) {
          console.log(`[WS] Message for job ${jobId}:`, event.data);
        },
      };
    }),
  );

  return { injectWebSocket };
}

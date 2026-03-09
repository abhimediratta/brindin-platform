import { createNodeWebSocket } from '@hono/node-ws';
import type { Hono } from 'hono';
import type { AppEnv } from './types.js';

export function setupWebSocket(app: Hono<AppEnv>) {
  const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

  app.get(
    '/ws/jobs/:jobId',
    upgradeWebSocket((c) => {
      const jobId = c.req.param('jobId');

      return {
        onOpen(_event, ws) {
          console.log(`[WS] Client connected for job ${jobId}`);
          ws.send(JSON.stringify({ type: 'connected', jobId }));
        },
        onClose() {
          console.log(`[WS] Client disconnected for job ${jobId}`);
        },
        onMessage(event) {
          console.log(`[WS] Message for job ${jobId}:`, event.data);
        },
      };
    }),
  );

  return { injectWebSocket };
}

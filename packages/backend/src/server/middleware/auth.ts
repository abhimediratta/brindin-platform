import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { env } from '../../lib/env.js';
import type { AppEnv } from '../types.js';

const DEV_ORG_ID = '00000000-0000-0000-0000-000000000000';

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  // Skip auth for health check
  if (c.req.path === '/api/health') {
    c.set('orgId', DEV_ORG_ID);
    return next();
  }

  const apiKey =
    c.req.header('X-API-Key') ??
    c.req.header('Authorization')?.replace('Bearer ', '');

  // Dev mode: no API_KEY configured → allow all requests
  if (!env.API_KEY) {
    c.set('orgId', DEV_ORG_ID);
    return next();
  }

  if (!apiKey || apiKey !== env.API_KEY) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }

  c.set('orgId', DEV_ORG_ID);
  return next();
});

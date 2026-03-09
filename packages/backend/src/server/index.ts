import { env } from '../lib/env.js';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import type { AppEnv } from './types.js';
import { errorHandler } from './middleware/error-handler.js';
import { loggerMiddleware } from './middleware/logger.js';
import { corsMiddleware } from './middleware/cors.js';
import { authMiddleware } from './middleware/auth.js';
import healthRoutes from './routes/health.js';
import brandRoutes from './routes/brands.js';
import extractionRoutes from './routes/extraction.js';
import { setupWebSocket } from './ws.js';

const app = new Hono<AppEnv>();

// Global error handler
app.onError(errorHandler);

// Middleware
app.use('*', loggerMiddleware);
app.use('*', corsMiddleware);
app.use('/api/*', authMiddleware);

// Routes
app.route('/api', healthRoutes);
app.route('/api', brandRoutes);
app.route('/api', extractionRoutes);

// WebSocket
const { injectWebSocket } = setupWebSocket(app);

// Start server
const server = serve(
  { fetch: app.fetch, port: env.PORT },
  (info) => {
    console.log(`Server running on http://localhost:${info.port}`);
  },
);

injectWebSocket(server);

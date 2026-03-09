import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const errorHandler: ErrorHandler = (err, c) => {
  console.error(`[Error] ${err.message}`, err.stack);

  if (err instanceof HTTPException) {
    return c.json(
      { error: err.message, status: err.status },
      err.status,
    );
  }

  return c.json({ error: 'Internal Server Error', status: 500 }, 500);
};

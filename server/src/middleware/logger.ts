import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const method = req.method;
  const url = req.originalUrl || req.url;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    console.log(`[HTTP] ${method} ${url} → ${status} (${duration}ms)`);
  });

  next();
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error('[HTTP] Unhandled error:', err.message);

  const isDev = process.env.NODE_ENV === 'development';
  res.status(500).json({
    errors: [
      {
        message: isDev ? err.message : 'Internal Server Error',
        ...(isDev && { stack: err.stack }),
      },
    ],
  });
};

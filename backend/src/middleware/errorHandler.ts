import { Request, Response, NextFunction } from 'express';

/**
 * Global Express error handling middleware.
 * Any route that throws an error or calls next(err) will be caught here.
 */
export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the complete error stack trace for debugging
  console.error('[Global Error Handler]:', error);

  // Determine status code (default to 500 Internal Server Error)
  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';

  // Send uniform JSON error response
  res.status(status).json({
    success: false,
    error: {
      message: message,
      status: status,
    },
  });
}

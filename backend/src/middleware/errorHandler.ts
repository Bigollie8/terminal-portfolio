/**
 * Error Handling Middleware
 *
 * Provides centralized error handling with consistent API error format.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ApiError } from '../types';

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly error: string;

  constructor(message: string, statusCode: number = 500, error?: string) {
    super(message);
    this.statusCode = statusCode;
    this.error = error || this.getErrorName(statusCode);
    Error.captureStackTrace(this, this.constructor);
  }

  private getErrorName(statusCode: number): string {
    const errorNames: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
    };
    return errorNames[statusCode] || 'Error';
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404, 'Not Found');
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'Validation Error');
  }
}

/**
 * Conflict Error (e.g., duplicate slug)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'Conflict');
  }
}

/**
 * Format Zod validation errors into a readable message
 */
function formatZodError(error: ZodError): string {
  const issues = error.issues.map((issue) => {
    const path = issue.path.join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
  });
  return issues.join('; ');
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const response: ApiError = {
      error: 'Validation Error',
      message: formatZodError(err),
      statusCode: 400,
    };
    res.status(400).json(response);
    return;
  }

  // Handle custom application errors
  if (err instanceof AppError) {
    const response: ApiError = {
      error: err.error,
      message: err.message,
      statusCode: err.statusCode,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle syntax errors (malformed JSON)
  if (err instanceof SyntaxError && 'body' in err) {
    const response: ApiError = {
      error: 'Bad Request',
      message: 'Invalid JSON in request body',
      statusCode: 400,
    };
    res.status(400).json(response);
    return;
  }

  // Handle unknown errors
  const response: ApiError = {
    error: 'Internal Server Error',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'An unexpected error occurred',
    statusCode: 500,
  };
  res.status(500).json(response);
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

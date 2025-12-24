/**
 * Validation Middleware
 *
 * Wraps Zod schemas for use as Express middleware.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

/**
 * Create validation middleware for request body
 */
export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Create validation middleware for query parameters
 */
export function validateQuery(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as typeof req.query;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Create validation middleware for URL parameters
 */
export function validateParams(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as typeof req.params;
      next();
    } catch (error) {
      next(error);
    }
  };
}

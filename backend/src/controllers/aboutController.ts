/**
 * About Controller
 *
 * Handles HTTP request/response for about/profile endpoints.
 */

import { Request, Response, NextFunction } from 'express';
import * as aboutModel from '../models/aboutModel';
import { NotFoundError, asyncHandler } from '../middleware/errorHandler';
import type { AboutResponse } from '../types';

/**
 * GET /api/about
 *
 * Get the about/profile information.
 */
export const getAbout = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const about = aboutModel.getAbout();

    if (!about) {
      throw new NotFoundError('About information');
    }

    const response: AboutResponse = about;
    res.json(response);
  }
);

/**
 * PUT /api/about
 *
 * Update the about/profile information.
 *
 * NOTE: This endpoint is currently unprotected (SEC-001).
 * Authentication must be added before production deployment.
 */
export const updateAbout = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const input = req.body;

    const about = aboutModel.updateAbout(input);

    if (!about) {
      throw new NotFoundError('About information');
    }

    const response: AboutResponse = about;
    res.json(response);
  }
);

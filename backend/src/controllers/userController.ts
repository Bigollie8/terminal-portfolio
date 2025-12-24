/**
 * User Controller
 *
 * Handles user profile endpoints.
 */

import { Request, Response, NextFunction } from 'express';
import * as userModel from '../models/userModel';
import { NotFoundError, asyncHandler } from '../middleware/errorHandler';
import type { UsersResponse } from '../types';

/**
 * GET /api/users
 *
 * List all registered users.
 */
export const getAllUsers = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const users = userModel.getAllUsers();

    const response: UsersResponse = { users };
    res.json(response);
  }
);

/**
 * GET /api/users/active
 *
 * Get users active in the last 15 minutes.
 */
export const getActiveUsers = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const users = userModel.getRecentlyActiveUsers(15);

    const response: UsersResponse = { users };
    res.json(response);
  }
);

/**
 * GET /api/users/:username
 *
 * Get a single user's profile.
 */
export const getUserByUsername = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { username } = req.params;
    const user = userModel.getUserByUsername(username);

    if (!user) {
      throw new NotFoundError('User', username);
    }

    res.json({ user });
  }
);

/**
 * PUT /api/users/bio
 *
 * Update current user's bio.
 */
export const updateBio = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user!.id;
    const { bio } = req.body;

    const user = userModel.updateBio(userId, bio || null);

    if (!user) {
      throw new NotFoundError('User');
    }

    res.json({ user });
  }
);

/**
 * Auth Controller
 *
 * Handles authentication endpoints: register, login, logout, me.
 */

import { Request, Response, NextFunction } from 'express';
import * as userModel from '../models/userModel';
import * as sessionModel from '../models/sessionModel';
import { ConflictError, AppError, asyncHandler } from '../middleware/errorHandler';
import type { AuthResponse } from '../types';

/**
 * POST /api/auth/register
 *
 * Create a new user account.
 */
export const register = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { username, password } = req.body;

    // Check if username already exists
    if (userModel.usernameExists(username)) {
      throw new ConflictError(`Username '${username}' is already taken`);
    }

    // Create user
    const user = userModel.createUser(username, password);

    // Create session
    const session = sessionModel.createSession(user.id);

    const response: AuthResponse = {
      user,
      token: session.token,
    };

    res.status(201).json(response);
  }
);

/**
 * POST /api/auth/login
 *
 * Authenticate user and create session.
 */
export const login = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { username, password } = req.body;

    // Verify credentials
    const user = userModel.verifyPassword(username, password);

    if (!user) {
      throw new AppError('Invalid username or password', 401, 'Unauthorized');
    }

    // Create session
    const session = sessionModel.createSession(user.id);

    // Update last seen
    userModel.updateLastSeen(user.id);

    const response: AuthResponse = {
      user,
      token: session.token,
    };

    res.json(response);
  }
);

/**
 * POST /api/auth/logout
 *
 * End current session.
 */
export const logout = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const token = req.token;

    if (token) {
      sessionModel.deleteSession(token);
    }

    res.status(204).send();
  }
);

/**
 * GET /api/auth/me
 *
 * Get current authenticated user.
 */
export const me = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    // User is set by requireAuth middleware
    const user = req.user!;

    res.json({ user });
  }
);

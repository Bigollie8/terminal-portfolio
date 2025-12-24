/**
 * Authentication Middleware
 *
 * Provides authentication verification for protected routes.
 */

import { Request, Response, NextFunction } from 'express';
import { getSessionByToken, isSessionExpired } from '../models/sessionModel';
import { updateLastSeen } from '../models/userModel';
import { AppError } from './errorHandler';
import type { User } from '../types';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      token?: string;
    }
  }
}

/**
 * Required authentication middleware
 * Fails with 401 if not authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401, 'Unauthorized');
  }

  const token = authHeader.substring(7);
  const session = getSessionByToken(token);

  if (!session) {
    throw new AppError('Invalid session token', 401, 'Unauthorized');
  }

  if (isSessionExpired(session)) {
    throw new AppError('Session has expired', 401, 'Unauthorized');
  }

  // Update last seen timestamp
  updateLastSeen(session.user.id);

  // Attach user and token to request
  req.user = session.user;
  req.token = token;

  next();
}

/**
 * Optional authentication middleware
 * Sets user if authenticated, but continues regardless
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const session = getSessionByToken(token);

    if (session && !isSessionExpired(session)) {
      updateLastSeen(session.user.id);
      req.user = session.user;
      req.token = token;
    }
  }

  next();
}

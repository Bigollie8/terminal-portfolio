/**
 * Auth Routes
 *
 * Defines all routes for the /api/auth endpoint.
 */

import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validateBody } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { RegisterUserSchema, LoginUserSchema } from '../validation/schemas';

const router = Router();

/**
 * POST /api/auth/register
 * Create a new user account
 */
router.post(
  '/register',
  validateBody(RegisterUserSchema),
  authController.register
);

/**
 * POST /api/auth/login
 * Authenticate and get session token
 */
router.post(
  '/login',
  validateBody(LoginUserSchema),
  authController.login
);

/**
 * POST /api/auth/logout
 * End current session
 */
router.post(
  '/logout',
  requireAuth,
  authController.logout
);

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get(
  '/me',
  requireAuth,
  authController.me
);

export default router;

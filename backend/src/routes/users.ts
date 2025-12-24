/**
 * User Routes
 *
 * Defines all routes for the /api/users endpoint.
 */

import { Router } from 'express';
import * as userController from '../controllers/userController';
import { validateBody } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { UpdateBioSchema } from '../validation/schemas';

const router = Router();

/**
 * GET /api/users
 * List all registered users
 */
router.get('/', userController.getAllUsers);

/**
 * GET /api/users/active
 * Get recently active users (last 15 minutes)
 */
router.get('/active', userController.getActiveUsers);

/**
 * PUT /api/users/bio
 * Update current user's bio
 */
router.put(
  '/bio',
  requireAuth,
  validateBody(UpdateBioSchema),
  userController.updateBio
);

/**
 * GET /api/users/:username
 * Get a user's profile
 */
router.get('/:username', userController.getUserByUsername);

export default router;

/**
 * Wall Routes
 *
 * Defines all routes for the /api/wall endpoint.
 */

import { Router } from 'express';
import * as wallController from '../controllers/wallController';
import { validateBody } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { WallPostSchema } from '../validation/schemas';

const router = Router();

/**
 * GET /api/wall
 * Get all wall posts
 */
router.get('/', wallController.getPosts);

/**
 * POST /api/wall
 * Create a new wall post
 */
router.post(
  '/',
  requireAuth,
  validateBody(WallPostSchema),
  wallController.createPost
);

/**
 * DELETE /api/wall/:id
 * Delete a wall post (only by owner)
 */
router.delete('/:id', requireAuth, wallController.deletePost);

export default router;

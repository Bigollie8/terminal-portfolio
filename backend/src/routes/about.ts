/**
 * About Routes
 *
 * Defines all routes for the /api/about endpoint.
 */

import { Router } from 'express';
import * as aboutController from '../controllers/aboutController';
import { validateBody } from '../middleware/validate';
import { UpdateAboutSchema } from '../validation/schemas';

const router = Router();

/**
 * GET /api/about
 * Get the about/profile information
 */
router.get('/', aboutController.getAbout);

/**
 * PUT /api/about
 * Update the about/profile information
 *
 * NOTE: Currently unprotected (SEC-001)
 */
router.put('/', validateBody(UpdateAboutSchema), aboutController.updateAbout);

export default router;

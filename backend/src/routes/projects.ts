/**
 * Project Routes
 *
 * Defines all routes for the /api/projects endpoint.
 */

import { Router } from 'express';
import * as projectController from '../controllers/projectController';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  ProjectQuerySchema,
} from '../validation/schemas';

const router = Router();

/**
 * GET /api/projects
 * List all projects with optional filtering and sorting
 *
 * Query parameters:
 * - status: 'active' | 'archived' | 'wip'
 * - sort: 'name' | 'order'
 * - featured: 'true' | 'false'
 */
router.get(
  '/',
  validateQuery(ProjectQuerySchema),
  projectController.getAllProjects
);

/**
 * GET /api/projects/:slug
 * Get a single project by slug
 */
router.get('/:slug', projectController.getProjectBySlug);

/**
 * POST /api/projects
 * Create a new project
 *
 * NOTE: Currently unprotected (SEC-001)
 */
router.post(
  '/',
  validateBody(CreateProjectSchema),
  projectController.createProject
);

/**
 * PUT /api/projects/:slug
 * Update an existing project
 *
 * NOTE: Currently unprotected (SEC-001)
 */
router.put(
  '/:slug',
  validateBody(UpdateProjectSchema),
  projectController.updateProject
);

/**
 * DELETE /api/projects/:slug
 * Delete a project
 *
 * NOTE: Currently unprotected (SEC-001)
 */
router.delete('/:slug', projectController.deleteProject);

export default router;

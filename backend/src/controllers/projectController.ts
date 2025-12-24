/**
 * Project Controller
 *
 * Handles HTTP request/response for project endpoints.
 */

import { Request, Response, NextFunction } from 'express';
import * as projectModel from '../models/projectModel';
import {
  NotFoundError,
  ConflictError,
  asyncHandler,
} from '../middleware/errorHandler';
import type { ProjectsResponse, ProjectResponse } from '../types';

/**
 * GET /api/projects
 *
 * List all projects with optional filtering and sorting.
 *
 * Query parameters:
 * - status: 'active' | 'archived' | 'wip'
 * - sort: 'name' | 'order' (default: 'order')
 * - featured: 'true' | 'false'
 */
export const getAllProjects = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { status, sort, featured } = req.query;

    const projects = projectModel.getAllProjects({
      status: status as string | undefined,
      sort: sort as 'name' | 'order' | undefined,
      featured:
        featured !== undefined ? featured === 'true' : undefined,
    });

    const response: ProjectsResponse = { projects };
    res.json(response);
  }
);

/**
 * GET /api/projects/:slug
 *
 * Get a single project by slug.
 */
export const getProjectBySlug = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { slug } = req.params;
    const project = projectModel.getProjectBySlug(slug);

    if (!project) {
      throw new NotFoundError('Project', slug);
    }

    const response: ProjectResponse = { project };
    res.json(response);
  }
);

/**
 * POST /api/projects
 *
 * Create a new project.
 *
 * NOTE: This endpoint is currently unprotected (SEC-001).
 * Authentication must be added before production deployment.
 */
export const createProject = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const input = req.body;

    // Check for duplicate slug if provided
    if (input.slug && projectModel.slugExists(input.slug)) {
      throw new ConflictError(`Project with slug '${input.slug}' already exists`);
    }

    // Generate slug from name if not provided
    if (!input.slug) {
      const generatedSlug = input.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Check if generated slug exists
      if (projectModel.slugExists(generatedSlug)) {
        throw new ConflictError(
          `Project with slug '${generatedSlug}' already exists. Please provide a unique slug.`
        );
      }
    }

    const project = projectModel.createProject(input);

    const response: ProjectResponse = { project };
    res.status(201).json(response);
  }
);

/**
 * PUT /api/projects/:slug
 *
 * Update an existing project.
 *
 * NOTE: This endpoint is currently unprotected (SEC-001).
 * Authentication must be added before production deployment.
 */
export const updateProject = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { slug } = req.params;
    const input = req.body;

    // Check if project exists
    const existing = projectModel.getProjectBySlug(slug);
    if (!existing) {
      throw new NotFoundError('Project', slug);
    }

    // Check for slug conflict if changing slug
    if (input.slug && input.slug !== slug) {
      if (projectModel.slugExists(input.slug, existing.id)) {
        throw new ConflictError(`Project with slug '${input.slug}' already exists`);
      }
    }

    const project = projectModel.updateProject(slug, input);

    if (!project) {
      throw new NotFoundError('Project', slug);
    }

    const response: ProjectResponse = { project };
    res.json(response);
  }
);

/**
 * DELETE /api/projects/:slug
 *
 * Delete a project.
 *
 * NOTE: This endpoint is currently unprotected (SEC-001).
 * Authentication must be added before production deployment.
 */
export const deleteProject = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { slug } = req.params;

    const deleted = projectModel.deleteProject(slug);

    if (!deleted) {
      throw new NotFoundError('Project', slug);
    }

    res.status(204).send();
  }
);

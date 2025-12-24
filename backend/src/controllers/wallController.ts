/**
 * Wall Controller
 *
 * Handles public wall/message board endpoints.
 */

import { Request, Response, NextFunction } from 'express';
import * as wallModel from '../models/wallModel';
import { NotFoundError, AppError, asyncHandler } from '../middleware/errorHandler';
import type { WallResponse } from '../types';

/**
 * GET /api/wall
 *
 * Get all wall posts.
 */
export const getPosts = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const posts = wallModel.getAllPosts(Math.min(limit, 100));

    const response: WallResponse = { posts };
    res.json(response);
  }
);

/**
 * POST /api/wall
 *
 * Create a new wall post.
 */
export const createPost = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user!.id;
    const { content } = req.body;

    const post = wallModel.createPost(userId, content);

    res.status(201).json({ post });
  }
);

/**
 * DELETE /api/wall/:id
 *
 * Delete a wall post (only by owner).
 */
export const deletePost = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user!.id;
    const postId = parseInt(req.params.id, 10);

    if (isNaN(postId)) {
      throw new AppError('Invalid post ID', 400, 'Bad Request');
    }

    const success = wallModel.deletePost(postId, userId);

    if (!success) {
      throw new NotFoundError('Post', req.params.id);
    }

    res.status(204).send();
  }
);

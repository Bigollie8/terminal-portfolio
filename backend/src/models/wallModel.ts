/**
 * Wall Model
 *
 * Handles public wall/message board operations.
 */

import db from '../config/database';
import type { WallPost, WallPostRow } from '../types';
import { rowToWallPost } from '../types';

/**
 * Create a new wall post
 */
export function createPost(userId: number, content: string): WallPost {
  const stmt = db.prepare(`
    INSERT INTO wall_posts (user_id, content, created_at)
    VALUES (@userId, @content, datetime('now'))
  `);

  const info = stmt.run({ userId, content });

  const post = getPostById(info.lastInsertRowid as number);
  if (!post) {
    throw new Error('Failed to create wall post');
  }

  return post;
}

/**
 * Get a single post by ID
 */
export function getPostById(postId: number): WallPost | null {
  const stmt = db.prepare(`
    SELECT w.*, u.username
    FROM wall_posts w
    JOIN users u ON w.user_id = u.id
    WHERE w.id = ?
  `);

  const row = stmt.get(postId) as (WallPostRow & { username: string }) | undefined;

  if (!row) {
    return null;
  }

  return rowToWallPost(row);
}

/**
 * Get all wall posts (most recent first)
 */
export function getAllPosts(limit: number = 50): WallPost[] {
  const stmt = db.prepare(`
    SELECT w.*, u.username
    FROM wall_posts w
    JOIN users u ON w.user_id = u.id
    ORDER BY w.created_at DESC
    LIMIT ?
  `);

  const rows = stmt.all(limit) as Array<WallPostRow & { username: string }>;

  return rows.map(rowToWallPost);
}

/**
 * Get posts by a specific user
 */
export function getPostsByUser(userId: number): WallPost[] {
  const stmt = db.prepare(`
    SELECT w.*, u.username
    FROM wall_posts w
    JOIN users u ON w.user_id = u.id
    WHERE w.user_id = ?
    ORDER BY w.created_at DESC
  `);

  const rows = stmt.all(userId) as Array<WallPostRow & { username: string }>;

  return rows.map(rowToWallPost);
}

/**
 * Delete a wall post (only by owner)
 */
export function deletePost(postId: number, userId: number): boolean {
  const stmt = db.prepare(`
    DELETE FROM wall_posts
    WHERE id = ? AND user_id = ?
  `);

  const info = stmt.run(postId, userId);
  return info.changes > 0;
}

/**
 * Get post count
 */
export function getPostCount(): number {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM wall_posts');
  const result = stmt.get() as { count: number };
  return result.count;
}

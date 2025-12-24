/**
 * Session Model
 *
 * Handles token-based session management.
 */

import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import type { Session, SessionRow, User } from '../types';
import { getUserById } from './userModel';

const SESSION_DURATION_DAYS = 7;

/**
 * Create a new session for a user
 */
export function createSession(userId: number): Session {
  const token = uuidv4();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  const stmt = db.prepare(`
    INSERT INTO sessions (user_id, token, created_at, expires_at)
    VALUES (@userId, @token, @createdAt, @expiresAt)
  `);

  const info = stmt.run({
    userId,
    token,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });

  return {
    id: info.lastInsertRowid as number,
    userId,
    token,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * Get session by token with user data
 */
export function getSessionByToken(token: string): (Session & { user: User }) | null {
  const stmt = db.prepare('SELECT * FROM sessions WHERE token = ?');
  const row = stmt.get(token) as SessionRow | undefined;

  if (!row) {
    return null;
  }

  const user = getUserById(row.user_id);
  if (!user) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    token: row.token,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    user,
  };
}

/**
 * Delete a session by token
 */
export function deleteSession(token: string): boolean {
  const stmt = db.prepare('DELETE FROM sessions WHERE token = ?');
  const info = stmt.run(token);

  return info.changes > 0;
}

/**
 * Delete all sessions for a user
 */
export function deleteUserSessions(userId: number): number {
  const stmt = db.prepare('DELETE FROM sessions WHERE user_id = ?');
  const info = stmt.run(userId);

  return info.changes;
}

/**
 * Delete expired sessions
 */
export function deleteExpiredSessions(): number {
  const stmt = db.prepare(`
    DELETE FROM sessions
    WHERE datetime(expires_at) < datetime('now')
  `);
  const info = stmt.run();

  return info.changes;
}

/**
 * Check if a session is expired
 */
export function isSessionExpired(session: Session): boolean {
  return new Date(session.expiresAt) < new Date();
}

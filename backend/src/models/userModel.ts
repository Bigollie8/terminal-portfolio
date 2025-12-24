/**
 * User Model
 *
 * Handles all database operations for users including authentication.
 */

import bcrypt from 'bcrypt';
import db from '../config/database';
import type { User, UserRow } from '../types';
import { rowToUser } from '../types';

const SALT_ROUNDS = 12;

/**
 * Create a new user with hashed password
 */
export function createUser(username: string, password: string): User {
  const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO users (username, password_hash, registered_at, last_seen)
    VALUES (@username, @passwordHash, @now, @now)
  `);

  const info = stmt.run({ username, passwordHash, now });
  const user = getUserById(info.lastInsertRowid as number);

  if (!user) {
    throw new Error('Failed to create user');
  }

  return user;
}

/**
 * Get user by ID
 */
export function getUserById(id: number): User | null {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const row = stmt.get(id) as UserRow | undefined;

  if (!row) {
    return null;
  }

  return rowToUser(row);
}

/**
 * Get user by username (case-insensitive)
 */
export function getUserByUsername(username: string): User | null {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE');
  const row = stmt.get(username) as UserRow | undefined;

  if (!row) {
    return null;
  }

  return rowToUser(row);
}

/**
 * Get user row with password hash for authentication
 */
export function getUserRowByUsername(username: string): UserRow | null {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE');
  const row = stmt.get(username) as UserRow | undefined;

  return row || null;
}

/**
 * Get all users
 */
export function getAllUsers(): User[] {
  const stmt = db.prepare('SELECT * FROM users ORDER BY registered_at DESC');
  const rows = stmt.all() as UserRow[];

  return rows.map(rowToUser);
}

/**
 * Get recently active users (within specified minutes)
 */
export function getRecentlyActiveUsers(minutes: number = 15): User[] {
  const stmt = db.prepare(`
    SELECT * FROM users
    WHERE datetime(last_seen) > datetime('now', '-' || ? || ' minutes')
    ORDER BY last_seen DESC
  `);
  const rows = stmt.all(minutes) as UserRow[];

  return rows.map(rowToUser);
}

/**
 * Update user's last_seen timestamp
 */
export function updateLastSeen(userId: number): void {
  const now = new Date().toISOString();
  const stmt = db.prepare('UPDATE users SET last_seen = ? WHERE id = ?');
  stmt.run(now, userId);
}

/**
 * Update user's bio
 */
export function updateBio(userId: number, bio: string | null): User | null {
  const stmt = db.prepare('UPDATE users SET bio = ? WHERE id = ?');
  stmt.run(bio, userId);

  return getUserById(userId);
}

/**
 * Verify password and return user if valid
 */
export function verifyPassword(username: string, password: string): User | null {
  const row = getUserRowByUsername(username);

  if (!row) {
    return null;
  }

  const isValid = bcrypt.compareSync(password, row.password_hash);

  if (!isValid) {
    return null;
  }

  return rowToUser(row);
}

/**
 * Check if username already exists
 */
export function usernameExists(username: string): boolean {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ? COLLATE NOCASE');
  const result = stmt.get(username) as { count: number };

  return result.count > 0;
}

/**
 * Get user count
 */
export function getUserCount(): number {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const result = stmt.get() as { count: number };
  return result.count;
}

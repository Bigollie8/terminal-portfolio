/**
 * Database Configuration and Connection
 *
 * Uses better-sqlite3 for synchronous SQLite database access.
 * Includes schema initialization and migration support.
 */

import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Resolve database path from environment or use default
const dbPath = process.env.DATABASE_URL || './data/portfolio.db';
const absoluteDbPath = path.isAbsolute(dbPath)
  ? dbPath
  : path.resolve(process.cwd(), dbPath);

// Ensure data directory exists
const dataDir = path.dirname(absoluteDbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create database connection
const db: DatabaseType = new Database(absoluteDbPath);

// Enable foreign keys and WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Initialize database schema
 */
export function initializeDatabase(): void {
  // Create projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      long_description TEXT,
      url TEXT NOT NULL,
      github_url TEXT,
      tech_stack TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'archived', 'wip')),
      featured INTEGER NOT NULL DEFAULT 0 CHECK(featured IN (0, 1)),
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Create index on slug for fast lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug)
  `);

  // Create index on display_order for sorting
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects(display_order)
  `);

  // Create about table (single row)
  db.exec(`
    CREATE TABLE IF NOT EXISTS about (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      bio TEXT NOT NULL,
      email TEXT NOT NULL,
      github TEXT,
      linkedin TEXT,
      twitter TEXT,
      website TEXT,
      ascii_art TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Create deployments table for tracking service deployment status
  db.exec(`
    CREATE TABLE IF NOT EXISTS deployments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      version TEXT NOT NULL DEFAULT '1.0.0',
      commit_hash TEXT,
      deployed_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Create index on service_key for fast lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_deployments_service_key ON deployments(service_key)
  `);

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      bio TEXT,
      registered_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_seen TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)
  `);

  // Create sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)
  `);

  // Create messages table for mail
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      recipient_id INTEGER NOT NULL,
      subject TEXT,
      content TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)
  `);

  // Create wall posts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS wall_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_wall_posts_created ON wall_posts(created_at DESC)
  `);

  console.log('Database initialized successfully');
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  db.close();
}

/**
 * Get database instance
 */
export function getDatabase(): DatabaseType {
  return db;
}

export default db;

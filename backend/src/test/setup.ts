import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Test database path
const TEST_DB_PATH = path.join(__dirname, '../../data/test.db');

// Mock environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = TEST_DB_PATH;

// Store original database for restoration
let originalDb: Database.Database | null = null;

// Create test database schema
function createTestDatabase(): Database.Database {
  // Ensure data directory exists
  const dataDir = path.dirname(TEST_DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Remove existing test database
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  const db = new Database(TEST_DB_PATH);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create schema
  db.exec(`
    -- Projects table
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      long_description TEXT,
      url TEXT,
      github_url TEXT,
      tech_stack TEXT DEFAULT '[]',
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'archived', 'wip')),
      featured INTEGER DEFAULT 0,
      display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- About table (single row for profile info)
    CREATE TABLE IF NOT EXISTS about (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL DEFAULT '',
      bio TEXT DEFAULT '',
      email TEXT DEFAULT '',
      github TEXT DEFAULT '',
      linkedin TEXT DEFAULT '',
      twitter TEXT DEFAULT '',
      website TEXT DEFAULT '',
      ascii_art TEXT DEFAULT '',
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Deployments table
    CREATE TABLE IF NOT EXISTS deployments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      url TEXT,
      description TEXT,
      icon TEXT,
      version TEXT,
      commit_hash TEXT,
      deployed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      bio TEXT DEFAULT '',
      registered_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_seen TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Sessions table
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Messages table
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      recipient_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      content TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Wall posts table
    CREATE TABLE IF NOT EXISTS wall_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
    CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects(display_order);
    CREATE INDEX IF NOT EXISTS idx_deployments_service_key ON deployments(service_key);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
    CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_wall_posts_created_at ON wall_posts(created_at DESC);

    -- Insert default about row
    INSERT OR IGNORE INTO about (id, name, title) VALUES (1, 'Test User', 'Developer');
  `);

  return db;
}

// Clear test database between tests
function clearTestDatabase(db: Database.Database) {
  db.exec(`
    DELETE FROM wall_posts;
    DELETE FROM messages;
    DELETE FROM sessions;
    DELETE FROM users;
    DELETE FROM deployments;
    DELETE FROM projects;
    UPDATE about SET name = 'Test User', title = 'Developer', bio = '', email = '', github = '', linkedin = '', twitter = '', website = '', ascii_art = '' WHERE id = 1;
  `);
}

// Setup before all tests
beforeAll(() => {
  // Create test database
  createTestDatabase();
});

// Clean up after all tests
afterAll(() => {
  // Remove test database
  if (fs.existsSync(TEST_DB_PATH)) {
    try {
      fs.unlinkSync(TEST_DB_PATH);
    } catch {
      // Ignore errors during cleanup
    }
  }
});

// Export test utilities
export { createTestDatabase, clearTestDatabase, TEST_DB_PATH };

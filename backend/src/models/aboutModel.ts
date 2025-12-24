/**
 * About Model
 *
 * Handles all database operations for the about/profile info.
 * Note: The about table is designed to hold a single row (id=1).
 */

import db from '../config/database';
import type { About, AboutRow, UpdateAboutInput } from '../types';
import { rowToAbout } from '../types';

/**
 * Get the about information
 */
export function getAbout(): About | null {
  const stmt = db.prepare('SELECT * FROM about WHERE id = 1');
  const row = stmt.get() as AboutRow | undefined;

  if (!row) {
    return null;
  }

  return rowToAbout(row);
}

/**
 * Check if about info exists
 */
export function aboutExists(): boolean {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM about WHERE id = 1');
  const result = stmt.get() as { count: number };
  return result.count > 0;
}

/**
 * Create initial about information
 */
export function createAbout(input: About): About {
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO about (
      id, name, title, bio, email, github, linkedin,
      twitter, website, ascii_art, updated_at
    ) VALUES (
      1, @name, @title, @bio, @email, @github, @linkedin,
      @twitter, @website, @asciiArt, @updatedAt
    )
  `);

  stmt.run({
    name: input.name,
    title: input.title,
    bio: input.bio,
    email: input.email,
    github: input.github || null,
    linkedin: input.linkedin || null,
    twitter: input.twitter || null,
    website: input.website || null,
    asciiArt: input.asciiArt || null,
    updatedAt: now,
  });

  const about = getAbout();
  if (!about) {
    throw new Error('Failed to create about info');
  }

  return about;
}

/**
 * Update the about information
 */
export function updateAbout(input: UpdateAboutInput): About | null {
  const existing = getAbout();

  if (!existing) {
    // If no about info exists, create it with required fields
    if (input.name && input.title && input.bio && input.email) {
      return createAbout({
        name: input.name,
        title: input.title,
        bio: input.bio,
        email: input.email,
        github: input.github,
        linkedin: input.linkedin,
        twitter: input.twitter,
        website: input.website,
        asciiArt: input.asciiArt,
      });
    }
    return null;
  }

  const now = new Date().toISOString();

  const stmt = db.prepare(`
    UPDATE about SET
      name = @name,
      title = @title,
      bio = @bio,
      email = @email,
      github = @github,
      linkedin = @linkedin,
      twitter = @twitter,
      website = @website,
      ascii_art = @asciiArt,
      updated_at = @updatedAt
    WHERE id = 1
  `);

  stmt.run({
    name: input.name ?? existing.name,
    title: input.title ?? existing.title,
    bio: input.bio ?? existing.bio,
    email: input.email ?? existing.email,
    github: input.github ?? existing.github ?? null,
    linkedin: input.linkedin ?? existing.linkedin ?? null,
    twitter: input.twitter ?? existing.twitter ?? null,
    website: input.website ?? existing.website ?? null,
    asciiArt: input.asciiArt ?? existing.asciiArt ?? null,
    updatedAt: now,
  });

  return getAbout();
}

/**
 * Delete about information (reset to empty)
 */
export function deleteAbout(): boolean {
  const stmt = db.prepare('DELETE FROM about WHERE id = 1');
  const info = stmt.run();
  return info.changes > 0;
}

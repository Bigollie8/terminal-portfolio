/**
 * Project Model
 *
 * Handles all database operations for projects.
 */

import db from '../config/database';
import type {
  Project,
  ProjectRow,
  CreateProjectInput,
  UpdateProjectInput,
} from '../types';
import { rowToProject } from '../types';

/**
 * Convert a name to a URL-friendly slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Get all projects from the database
 */
export function getAllProjects(options?: {
  status?: string;
  sort?: 'name' | 'order';
  featured?: boolean;
}): Project[] {
  let query = 'SELECT * FROM projects WHERE 1=1';
  const params: Record<string, unknown> = {};

  if (options?.status) {
    query += ' AND status = @status';
    params.status = options.status;
  }

  if (options?.featured !== undefined) {
    query += ' AND featured = @featured';
    params.featured = options.featured ? 1 : 0;
  }

  if (options?.sort === 'name') {
    query += ' ORDER BY name ASC';
  } else {
    query += ' ORDER BY display_order ASC, id ASC';
  }

  const stmt = db.prepare(query);
  const rows = stmt.all(params) as ProjectRow[];

  return rows.map(rowToProject);
}

/**
 * Get a single project by slug
 */
export function getProjectBySlug(slug: string): Project | null {
  const stmt = db.prepare('SELECT * FROM projects WHERE slug = ?');
  const row = stmt.get(slug) as ProjectRow | undefined;

  if (!row) {
    return null;
  }

  return rowToProject(row);
}

/**
 * Get a single project by ID
 */
export function getProjectById(id: number): Project | null {
  const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
  const row = stmt.get(id) as ProjectRow | undefined;

  if (!row) {
    return null;
  }

  return rowToProject(row);
}

/**
 * Check if a slug already exists
 */
export function slugExists(slug: string, excludeId?: number): boolean {
  let query = 'SELECT COUNT(*) as count FROM projects WHERE slug = ?';
  const params: (string | number)[] = [slug];

  if (excludeId !== undefined) {
    query += ' AND id != ?';
    params.push(excludeId);
  }

  const stmt = db.prepare(query);
  const result = stmt.get(...params) as { count: number };

  return result.count > 0;
}

/**
 * Get the next display order value
 */
function getNextDisplayOrder(): number {
  const stmt = db.prepare(
    'SELECT COALESCE(MAX(display_order), 0) + 1 as next FROM projects'
  );
  const result = stmt.get() as { next: number };
  return result.next;
}

/**
 * Create a new project
 */
export function createProject(input: CreateProjectInput): Project {
  const slug = input.slug || slugify(input.name);
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO projects (
      name, slug, description, long_description, url, github_url,
      tech_stack, status, featured, display_order, created_at, updated_at
    ) VALUES (
      @name, @slug, @description, @longDescription, @url, @githubUrl,
      @techStack, @status, @featured, @displayOrder, @createdAt, @updatedAt
    )
  `);

  const info = stmt.run({
    name: input.name,
    slug,
    description: input.description,
    longDescription: input.longDescription || null,
    url: input.url,
    githubUrl: input.githubUrl || null,
    techStack: JSON.stringify(input.techStack),
    status: input.status || 'active',
    featured: input.featured ? 1 : 0,
    displayOrder: input.displayOrder ?? getNextDisplayOrder(),
    createdAt: now,
    updatedAt: now,
  });

  const project = getProjectById(info.lastInsertRowid as number);
  if (!project) {
    throw new Error('Failed to create project');
  }

  return project;
}

/**
 * Update an existing project
 */
export function updateProject(
  slug: string,
  input: UpdateProjectInput
): Project | null {
  const existing = getProjectBySlug(slug);
  if (!existing) {
    return null;
  }

  const now = new Date().toISOString();

  const stmt = db.prepare(`
    UPDATE projects SET
      name = @name,
      slug = @slug,
      description = @description,
      long_description = @longDescription,
      url = @url,
      github_url = @githubUrl,
      tech_stack = @techStack,
      status = @status,
      featured = @featured,
      display_order = @displayOrder,
      updated_at = @updatedAt
    WHERE id = @id
  `);

  stmt.run({
    id: existing.id,
    name: input.name ?? existing.name,
    slug: input.slug ?? existing.slug,
    description: input.description ?? existing.description,
    longDescription: input.longDescription ?? existing.longDescription ?? null,
    url: input.url ?? existing.url,
    githubUrl: input.githubUrl ?? existing.githubUrl ?? null,
    techStack: JSON.stringify(input.techStack ?? existing.techStack),
    status: input.status ?? existing.status,
    featured: (input.featured ?? existing.featured) ? 1 : 0,
    displayOrder: input.displayOrder ?? existing.displayOrder,
    updatedAt: now,
  });

  return getProjectById(existing.id);
}

/**
 * Delete a project by slug
 */
export function deleteProject(slug: string): boolean {
  const stmt = db.prepare('DELETE FROM projects WHERE slug = ?');
  const info = stmt.run(slug);

  return info.changes > 0;
}

/**
 * Get project count
 */
export function getProjectCount(): number {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM projects');
  const result = stmt.get() as { count: number };
  return result.count;
}

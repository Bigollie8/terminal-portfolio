/**
 * Deployment Model
 *
 * Database operations for service deployment tracking.
 */

import db from '../config/database';

export interface Deployment {
  id: number;
  service_key: string;
  name: string;
  url: string;
  description: string | null;
  icon: string | null;
  version: string;
  commit_hash: string | null;
  deployed_at: string;
  updated_at: string;
}

export interface CreateDeploymentInput {
  service_key: string;
  name: string;
  url: string;
  description?: string;
  icon?: string;
  version: string;
  commit_hash?: string;
}

export interface UpdateDeploymentInput {
  name?: string;
  url?: string;
  description?: string;
  icon?: string;
  version?: string;
  commit_hash?: string;
  deployed_at?: string;
}

/**
 * Get all deployments
 */
export function getAll(): Deployment[] {
  const stmt = db.prepare('SELECT * FROM deployments ORDER BY service_key');
  return stmt.all() as Deployment[];
}

/**
 * Get deployment by service key
 */
export function getByServiceKey(serviceKey: string): Deployment | undefined {
  const stmt = db.prepare('SELECT * FROM deployments WHERE service_key = ?');
  return stmt.get(serviceKey) as Deployment | undefined;
}

/**
 * Create a new deployment record
 */
export function create(input: CreateDeploymentInput): Deployment {
  const stmt = db.prepare(`
    INSERT INTO deployments (service_key, name, url, description, icon, version, commit_hash, deployed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  const result = stmt.run(
    input.service_key,
    input.name,
    input.url,
    input.description || null,
    input.icon || null,
    input.version,
    input.commit_hash || null
  );

  return getByServiceKey(input.service_key)!;
}

/**
 * Update a deployment record (also updates deployed_at to now)
 */
export function update(serviceKey: string, input: UpdateDeploymentInput): Deployment | undefined {
  const existing = getByServiceKey(serviceKey);
  if (!existing) return undefined;

  const updates: string[] = [];
  const values: (string | null)[] = [];

  if (input.name !== undefined) {
    updates.push('name = ?');
    values.push(input.name);
  }
  if (input.url !== undefined) {
    updates.push('url = ?');
    values.push(input.url);
  }
  if (input.description !== undefined) {
    updates.push('description = ?');
    values.push(input.description);
  }
  if (input.icon !== undefined) {
    updates.push('icon = ?');
    values.push(input.icon);
  }
  if (input.version !== undefined) {
    updates.push('version = ?');
    values.push(input.version);
  }
  if (input.commit_hash !== undefined) {
    updates.push('commit_hash = ?');
    values.push(input.commit_hash);
  }
  if (input.deployed_at !== undefined) {
    updates.push('deployed_at = ?');
    values.push(input.deployed_at);
  } else {
    // Default: update deployed_at to now
    updates.push("deployed_at = datetime('now')");
  }

  updates.push("updated_at = datetime('now')");
  values.push(serviceKey);

  const stmt = db.prepare(`
    UPDATE deployments SET ${updates.join(', ')} WHERE service_key = ?
  `);

  stmt.run(...values);
  return getByServiceKey(serviceKey);
}

/**
 * Upsert deployment (create or update)
 */
export function upsert(input: CreateDeploymentInput): Deployment {
  const existing = getByServiceKey(input.service_key);
  if (existing) {
    return update(input.service_key, {
      name: input.name,
      url: input.url,
      description: input.description,
      icon: input.icon,
      version: input.version,
      commit_hash: input.commit_hash,
    })!;
  }
  return create(input);
}

/**
 * Delete a deployment record
 */
export function remove(serviceKey: string): boolean {
  const stmt = db.prepare('DELETE FROM deployments WHERE service_key = ?');
  const result = stmt.run(serviceKey);
  return result.changes > 0;
}

/**
 * Seed default deployments if table is empty
 */
export function seedDefaults(): void {
  const existing = getAll();
  if (existing.length > 0) return;

  const defaults: CreateDeploymentInput[] = [
    {
      service_key: 'terminal',
      name: 'Terminal Portfolio',
      url: 'https://portfolio.basedsecurity.net',
      description: 'Interactive terminal portfolio',
      icon: '💻',
      version: '2.1.0',
    },
    {
      service_key: 'basedsecurity',
      name: 'BasedSecurity',
      url: 'https://security.basedsecurity.net',
      description: 'AI Security Training Platform',
      icon: '🔐',
      version: '1.3.2',
    },
    {
      service_key: 'rapidphotoflow',
      name: 'RapidPhotoFlow',
      url: 'https://photos.basedsecurity.net',
      description: 'Photo Management System',
      icon: '📸',
      version: '1.0.5',
    },
    {
      service_key: 'shipping',
      name: 'Shipping Monitor',
      url: 'https://shipping.basedsecurity.net',
      description: 'Package Tracking Dashboard',
      icon: '📦',
      version: '1.0.0',
    },
  ];

  for (const deployment of defaults) {
    create(deployment);
  }

  console.log('Default deployments seeded');
}

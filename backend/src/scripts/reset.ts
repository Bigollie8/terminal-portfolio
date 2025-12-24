/**
 * Database Reset Script
 *
 * Drops all tables and recreates them empty.
 * WARNING: This will delete all data!
 *
 * Run with: npm run db:reset
 */

import dotenv from 'dotenv';
dotenv.config();

import { getDatabase, initializeDatabase, closeDatabase } from '../config/database';

async function reset(): Promise<void> {
  console.log('WARNING: This will delete all data!');
  console.log('Resetting database...');

  const db = getDatabase();

  console.log('Dropping tables...');
  db.exec('DROP TABLE IF EXISTS projects');
  db.exec('DROP TABLE IF EXISTS about');

  console.log('Recreating tables...');
  initializeDatabase();

  console.log('Database reset complete!');

  closeDatabase();
}

reset().catch((error) => {
  console.error('Reset failed:', error);
  process.exit(1);
});

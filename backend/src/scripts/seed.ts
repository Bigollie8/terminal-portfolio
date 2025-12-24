/**
 * Database Seed Script
 *
 * Populates the database with sample data for development and testing.
 *
 * Run with: npm run db:seed
 */

import dotenv from 'dotenv';
dotenv.config();

import { initializeDatabase, getDatabase } from '../config/database';
import * as projectModel from '../models/projectModel';
import * as aboutModel from '../models/aboutModel';
import type { About } from '../types';
import type { CreateProjectInput } from '../validation/schemas';

// Sample projects data
const sampleProjects: CreateProjectInput[] = [
  {
    name: 'RapidPhotoFlow',
    slug: 'rapidphotoflow',
    description: 'AI-powered photo ingestion, tagging, and review platform',
    longDescription: `A comprehensive photo management platform with intelligent automation for batch
photo processing. Built with a modern full-stack architecture and deployed on AWS.

Key Features:
- Drag-and-drop batch uploads with live preview
- AI auto-tagging using OpenAI Vision (gpt-4o-mini)
- Powerful search with tag autocomplete and status filtering
- Review workflow with keyboard shortcuts (A/R/D for approve/reject/delete)
- Bulk operations for approve, reject, delete, and re-tag
- Complete audit trail with event logging
- Smart adaptive polling based on system state

Architecture follows Domain-Driven Design with bounded contexts for Ingestion,
Processing, Review, and Audit/Events.`,
    url: 'https://photos.basedsecurity.net',
    techStack: ['React', 'TypeScript', 'Java Spring Boot', 'PostgreSQL', 'AWS', 'OpenAI', 'Terraform'],
    status: 'active',
    featured: true,
    displayOrder: 1,
  },
  {
    name: 'BasedSecurity',
    slug: 'basedsecurity',
    description: 'Lua script authentication, licensing, and distribution platform',
    longDescription: `A full-stack platform for secure Lua script distribution with hardware-bound
licensing, user management, and real-time analytics.

Key Features:
- Secure script distribution with AES-256-GCM encryption
- Hardware-bound license management and validation
- JWT authentication with refresh token rotation
- Developer portal for script and user management
- Admin dashboard with audit logging and statistics
- Invite-based user registration system
- Rate limiting and account lockout protection

Security: Argon2id password hashing, short-lived JWTs (15 min), CSRF protection,
and comprehensive security headers.`,
    url: 'https://security.basedsecurity.net',
    techStack: ['React', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker', 'Tailwind CSS'],
    status: 'active',
    featured: true,
    displayOrder: 2,
  },
  {
    name: 'Shipping Monitor',
    slug: 'shipping',
    description: 'Real-time package tracking and monitoring dashboard',
    longDescription: `A comprehensive shipping and package tracking dashboard for monitoring deliveries
across multiple carriers in real-time.

Key Features:
- Multi-carrier tracking (UPS, FedEx, USPS, DHL)
- Real-time status updates and notifications
- Delivery timeline visualization
- Cost tracking and analytics
- Alert system for delays or issues
- Historical shipment data and reporting

Built with a focus on reliability and real-time updates to ensure you never miss
a delivery status change.`,
    url: 'https://shipping.basedsecurity.net',
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
    status: 'active',
    featured: false,
    displayOrder: 3,
  },
];

// Sample about data
const sampleAbout: About = {
  name: 'Oliver Land',
  title: 'Aspiring AI Engineer | QA Engineer & IT Support',
  bio: `Software developer working towards becoming an AI Engineer. Currently a QA Engineer
& IT Support at Xcelerate Restoration Software with experience in software development,
DevOps, and quality assurance.

Experience includes:
- Quality Assurance & IT Support at Xcelerate Restoration Software
- QA & Software Development at Envase Technologies (Agile, GitHub workflows)
- DevOps Engineering with AWS cloud services

Skills: Agile Development, IT Management, Software Development, AWS`,
  email: 'admin@basedsecurity.net',
  github: 'https://github.com/Bigollie8',
  linkedin: 'https://www.linkedin.com/in/oliverland/',
  website: 'https://oliverland.dev',
  asciiArt: `
   ___  _ _                 _                    _
  / _ \\| (_)_   _____ _ __ | |    __ _ _ __   __| |
 | | | | | \\ \\ / / _ \\ '__|| |   / _\` | '_ \\ / _\` |
 | |_| | | |\\ V /  __/ |   | |__| (_| | | | | (_| |
  \\___/|_|_| \\_/ \\___|_|   |_____\\__,_|_| |_|\\__,_|

        Aspiring AI Engineer
`,
};

async function seed(): Promise<void> {
  console.log('Initializing database...');
  initializeDatabase();

  const db = getDatabase();

  console.log('Clearing existing data...');
  db.exec('DELETE FROM projects');
  db.exec('DELETE FROM about');

  console.log('Seeding projects...');
  for (const project of sampleProjects) {
    const created = projectModel.createProject(project);
    console.log(`  Created: ${created.name} (${created.slug})`);
  }

  console.log('Seeding about info...');
  aboutModel.createAbout(sampleAbout);
  console.log(`  Created about for: ${sampleAbout.name}`);

  console.log('');
  console.log('Seed completed successfully!');
  console.log(`  Projects: ${projectModel.getProjectCount()}`);
  console.log(`  About: ${aboutModel.aboutExists() ? 'Yes' : 'No'}`);
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});

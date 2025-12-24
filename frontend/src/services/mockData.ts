import type { Project, About } from '@shared/types';

/**
 * Mock project data for development without backend
 */
export const mockProjects: Project[] = [
  {
    id: 1,
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
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-12-20T00:00:00Z',
  },
  {
    id: 2,
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
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-12-20T00:00:00Z',
  },
];

/**
 * Mock about/profile data for development without backend
 */
export const mockAbout: About = {
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
`,
};

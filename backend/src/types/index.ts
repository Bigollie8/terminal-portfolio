/**
 * Backend Type Definitions
 *
 * Contains all type definitions for the backend API.
 * These types mirror the shared types for consistency.
 */

// =============================================================================
// PROJECT TYPES
// =============================================================================

/**
 * Project status indicating the current state of a portfolio project
 */
export type ProjectStatus = 'active' | 'archived' | 'wip';

/**
 * Represents a portfolio project with all its metadata
 */
export interface Project {
  id: number;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  url: string;
  githubUrl?: string;
  techStack: string[];
  status: ProjectStatus;
  featured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Subset of Project fields returned in list views
 */
export interface ProjectSummary {
  name: string;
  slug: string;
  description: string;
  url: string;
  techStack: string[];
  status: ProjectStatus;
}

// =============================================================================
// ABOUT/PROFILE TYPES
// =============================================================================

/**
 * Personal information displayed via `whoami` and `contact` commands
 */
export interface About {
  name: string;
  title: string;
  bio: string;
  email: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  asciiArt?: string;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

/**
 * Response format for GET /api/projects
 */
export interface ProjectsResponse {
  projects: Project[];
}

/**
 * Response format for GET /api/projects/:slug
 */
export interface ProjectResponse {
  project: Project;
}

/**
 * Response format for GET /api/about
 */
export type AboutResponse = About;

/**
 * Standard API error response format
 */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// =============================================================================
// DATABASE ROW TYPES
// =============================================================================

/**
 * Database row type for projects table
 */
export interface ProjectRow {
  id: number;
  name: string;
  slug: string;
  description: string;
  long_description: string | null;
  url: string;
  github_url: string | null;
  tech_stack: string; // JSON string in SQLite
  status: string;
  featured: number; // SQLite boolean (0 or 1)
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Database row type for about table
 */
export interface AboutRow {
  id: number;
  name: string;
  title: string;
  bio: string;
  email: string;
  github: string | null;
  linkedin: string | null;
  twitter: string | null;
  website: string | null;
  ascii_art: string | null;
  updated_at: string;
}

// =============================================================================
// INPUT TYPES
// =============================================================================

/**
 * Input type for creating a new project
 */
export interface CreateProjectInput {
  name: string;
  slug?: string;
  description: string;
  longDescription?: string;
  url: string;
  githubUrl?: string;
  techStack: string[];
  status?: ProjectStatus;
  featured?: boolean;
  displayOrder?: number;
}

/**
 * Input type for updating a project
 */
export interface UpdateProjectInput {
  name?: string;
  slug?: string;
  description?: string;
  longDescription?: string;
  url?: string;
  githubUrl?: string;
  techStack?: string[];
  status?: ProjectStatus;
  featured?: boolean;
  displayOrder?: number;
}

/**
 * Input type for updating about info
 */
export interface UpdateAboutInput {
  name?: string;
  title?: string;
  bio?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  asciiArt?: string;
}

// =============================================================================
// CONVERSION FUNCTIONS
// =============================================================================

/**
 * Convert database row to Project type
 */
export function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    longDescription: row.long_description ?? undefined,
    url: row.url,
    githubUrl: row.github_url ?? undefined,
    techStack: JSON.parse(row.tech_stack),
    status: row.status as ProjectStatus,
    featured: row.featured === 1,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Convert database row to About type
 */
export function rowToAbout(row: AboutRow): About {
  return {
    name: row.name,
    title: row.title,
    bio: row.bio,
    email: row.email,
    github: row.github ?? undefined,
    linkedin: row.linkedin ?? undefined,
    twitter: row.twitter ?? undefined,
    website: row.website ?? undefined,
    asciiArt: row.ascii_art ?? undefined,
  };
}

// =============================================================================
// USER TYPES
// =============================================================================

/**
 * Public user profile (no password hash)
 */
export interface User {
  id: number;
  username: string;
  bio?: string;
  registeredAt: string;
  lastSeen: string;
}

/**
 * Database row type for users table
 */
export interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  bio: string | null;
  registered_at: string;
  last_seen: string;
}

/**
 * Session for authenticated users
 */
export interface Session {
  id: number;
  userId: number;
  token: string;
  createdAt: string;
  expiresAt: string;
}

/**
 * Database row type for sessions table
 */
export interface SessionRow {
  id: number;
  user_id: number;
  token: string;
  created_at: string;
  expires_at: string;
}

/**
 * Mail message
 */
export interface Message {
  id: number;
  senderId: number;
  senderUsername: string;
  recipientId: number;
  recipientUsername: string;
  subject?: string;
  content: string;
  read: boolean;
  createdAt: string;
}

/**
 * Database row type for messages table
 */
export interface MessageRow {
  id: number;
  sender_id: number;
  recipient_id: number;
  subject: string | null;
  content: string;
  read: number;
  created_at: string;
}

/**
 * Wall post
 */
export interface WallPost {
  id: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
}

/**
 * Database row type for wall_posts table
 */
export interface WallPostRow {
  id: number;
  user_id: number;
  content: string;
  created_at: string;
}

// =============================================================================
// USER API TYPES
// =============================================================================

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UsersResponse {
  users: User[];
}

export interface MessagesResponse {
  messages: Message[];
  unreadCount: number;
}

export interface WallResponse {
  posts: WallPost[];
}

// =============================================================================
// USER CONVERSION FUNCTIONS
// =============================================================================

/**
 * Convert database row to User type
 */
export function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    bio: row.bio ?? undefined,
    registeredAt: row.registered_at,
    lastSeen: row.last_seen,
  };
}

/**
 * Convert database row to Message type
 */
export function rowToMessage(
  row: MessageRow & { sender_username: string; recipient_username: string }
): Message {
  return {
    id: row.id,
    senderId: row.sender_id,
    senderUsername: row.sender_username,
    recipientId: row.recipient_id,
    recipientUsername: row.recipient_username,
    subject: row.subject ?? undefined,
    content: row.content,
    read: row.read === 1,
    createdAt: row.created_at,
  };
}

/**
 * Convert database row to WallPost type
 */
export function rowToWallPost(row: WallPostRow & { username: string }): WallPost {
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username,
    content: row.content,
    createdAt: row.created_at,
  };
}

/**
 * Shared Type Definitions for Terminal Portfolio
 *
 * This file contains the canonical type definitions used by both
 * the frontend and backend applications. Both applications should
 * import from this file to ensure type consistency.
 *
 * @module shared/types
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
  /** Unique identifier for the project */
  id: number;
  /** Display name of the project */
  name: string;
  /** URL-friendly identifier used in commands like `cat <slug>` */
  slug: string;
  /** Brief one-line description shown in `ls` output */
  description: string;
  /** Extended description shown in `cat` output */
  longDescription?: string;
  /** Primary URL where the project is hosted */
  url: string;
  /** GitHub repository URL */
  githubUrl?: string;
  /** Technologies used in the project */
  techStack: string[];
  /** Current status of the project */
  status: ProjectStatus;
  /** Whether this project should be highlighted */
  featured: boolean;
  /** Order for display in listings (lower = first) */
  displayOrder: number;
  /** ISO 8601 timestamp of creation */
  createdAt: string;
  /** ISO 8601 timestamp of last update */
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
  /** Full name */
  name: string;
  /** Professional title */
  title: string;
  /** Short biography */
  bio: string;
  /** Contact email address */
  email: string;
  /** GitHub profile URL */
  github?: string;
  /** LinkedIn profile URL */
  linkedin?: string;
  /** Twitter/X profile URL */
  twitter?: string;
  /** Personal website URL */
  website?: string;
  /** ASCII art for terminal display */
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
  /** Error type/category */
  error: string;
  /** Human-readable error message */
  message: string;
  /** HTTP status code */
  statusCode: number;
}

// =============================================================================
// TERMINAL/COMMAND TYPES (Frontend-specific but shared for reference)
// =============================================================================

/**
 * Type of output line in the terminal
 */
export type OutputLineType = 'input' | 'output' | 'error' | 'system';

/**
 * Single line of terminal output
 */
export interface OutputLine {
  /** Unique identifier for React key */
  id: string;
  /** Type determines styling */
  type: OutputLineType;
  /** Text content to display */
  content: string;
  /** Unix timestamp for ordering */
  timestamp: number;
}

/**
 * Result returned by command execution
 */
export interface CommandOutput {
  /** Lines to display in terminal */
  lines: OutputLine[];
  /** URL to redirect to (for `cd` command) */
  redirect?: string;
  /** Whether to clear terminal (for `clear` command) */
  clear?: boolean;
}

// =============================================================================
// THEME TYPES
// =============================================================================

/**
 * Color scheme for a terminal theme
 */
export interface ThemeColors {
  /** Terminal background color */
  background: string;
  /** Default text color */
  text: string;
  /** Prompt text color */
  prompt: string;
  /** Error message color */
  error: string;
  /** Link/URL color */
  link: string;
  /** Text selection background */
  selection: string;
  /** Border color */
  border: string;
}

/**
 * Complete theme definition
 */
export interface Theme {
  /** Internal theme identifier */
  name: string;
  /** Human-readable theme name */
  displayName: string;
  /** Theme color palette */
  colors: ThemeColors;
}

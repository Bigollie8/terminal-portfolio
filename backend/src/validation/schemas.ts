/**
 * Zod Validation Schemas
 *
 * Defines input validation schemas for API endpoints.
 */

import { z } from 'zod';

/**
 * Project status enum
 */
export const ProjectStatusSchema = z.enum(['active', 'archived', 'wip']);

/**
 * Schema for creating a new project
 */
export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase alphanumeric with hyphens'
    )
    .optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be 500 characters or less'),
  longDescription: z
    .string()
    .max(5000, 'Long description must be 5000 characters or less')
    .optional(),
  url: z.string().url('URL must be a valid URL'),
  githubUrl: z.string().url('GitHub URL must be a valid URL').optional(),
  techStack: z
    .array(z.string().min(1).max(50))
    .min(1, 'At least one technology is required')
    .max(20, 'Maximum 20 technologies allowed'),
  status: ProjectStatusSchema.optional().default('active'),
  featured: z.boolean().optional().default(false),
  displayOrder: z.number().int().min(0).optional(),
});

/**
 * Schema for updating a project
 */
export const UpdateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name must be 100 characters or less')
    .optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase alphanumeric with hyphens'
    )
    .optional(),
  description: z
    .string()
    .min(1, 'Description cannot be empty')
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  longDescription: z
    .string()
    .max(5000, 'Long description must be 5000 characters or less')
    .optional()
    .nullable(),
  url: z.string().url('URL must be a valid URL').optional(),
  githubUrl: z
    .string()
    .url('GitHub URL must be a valid URL')
    .optional()
    .nullable(),
  techStack: z
    .array(z.string().min(1).max(50))
    .min(1, 'At least one technology is required')
    .max(20, 'Maximum 20 technologies allowed')
    .optional(),
  status: ProjectStatusSchema.optional(),
  featured: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

/**
 * Schema for updating about info
 */
export const UpdateAboutSchema = z.object({
  name: z
    .string()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name must be 100 characters or less')
    .optional(),
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(100, 'Title must be 100 characters or less')
    .optional(),
  bio: z
    .string()
    .min(1, 'Bio cannot be empty')
    .max(2000, 'Bio must be 2000 characters or less')
    .optional(),
  email: z.string().email('Must be a valid email address').optional(),
  github: z.string().url('GitHub URL must be a valid URL').optional().nullable(),
  linkedin: z
    .string()
    .url('LinkedIn URL must be a valid URL')
    .optional()
    .nullable(),
  twitter: z
    .string()
    .url('Twitter URL must be a valid URL')
    .optional()
    .nullable(),
  website: z.string().url('Website must be a valid URL').optional().nullable(),
  asciiArt: z
    .string()
    .max(5000, 'ASCII art must be 5000 characters or less')
    .optional()
    .nullable(),
});

/**
 * Query parameters for listing projects
 */
export const ProjectQuerySchema = z.object({
  status: ProjectStatusSchema.optional(),
  sort: z.enum(['name', 'order']).optional().default('order'),
  featured: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

// =============================================================================
// USER & AUTH SCHEMAS
// =============================================================================

/**
 * Schema for user registration
 */
export const RegisterUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be 20 characters or less')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be 100 characters or less'),
});

/**
 * Schema for user login
 */
export const LoginUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Schema for updating user bio
 */
export const UpdateBioSchema = z.object({
  bio: z
    .string()
    .max(500, 'Bio must be 500 characters or less')
    .optional()
    .nullable(),
});

/**
 * Schema for sending a message
 */
export const SendMessageSchema = z.object({
  recipientUsername: z.string().min(1, 'Recipient username is required'),
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be 2000 characters or less'),
  subject: z
    .string()
    .max(100, 'Subject must be 100 characters or less')
    .optional(),
});

/**
 * Schema for wall posts
 */
export const WallPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(500, 'Wall post must be 500 characters or less'),
});

// Export inferred types
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type UpdateAboutInput = z.infer<typeof UpdateAboutSchema>;
export type ProjectQuery = z.infer<typeof ProjectQuerySchema>;
export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;
export type LoginUserInput = z.infer<typeof LoginUserSchema>;
export type UpdateBioInput = z.infer<typeof UpdateBioSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type WallPostInput = z.infer<typeof WallPostSchema>;

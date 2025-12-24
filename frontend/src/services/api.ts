import type { Project, ProjectsResponse, ProjectResponse, AboutResponse } from '@shared/types';
import { mockProjects, mockAbout } from './mockData';

/**
 * API base URL - defaults to localhost for development
 */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Whether to use mock data instead of real API calls
 * Set to false when backend is ready
 */
const USE_MOCK_DATA = false;

/**
 * Simulated network delay for mock data (ms)
 */
const MOCK_DELAY = 300;

/**
 * Helper to simulate network delay
 */
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * API service for fetching portfolio data
 */
export const api = {
  /**
   * Fetch all projects
   */
  async getProjects(): Promise<ProjectsResponse> {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      return { projects: mockProjects };
    }

    const res = await fetch(`${API_BASE}/api/projects`);
    if (!res.ok) {
      throw new Error('Failed to fetch projects');
    }
    return res.json();
  },

  /**
   * Fetch a single project by slug
   */
  async getProject(slug: string): Promise<ProjectResponse> {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      const project = mockProjects.find((p) => p.slug === slug);
      if (!project) {
        throw new Error(`Project not found: ${slug}`);
      }
      return { project };
    }

    const res = await fetch(`${API_BASE}/api/projects/${encodeURIComponent(slug)}`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`Project not found: ${slug}`);
      }
      throw new Error('Failed to fetch project');
    }
    return res.json();
  },

  /**
   * Fetch about/profile information
   */
  async getAbout(): Promise<AboutResponse> {
    if (USE_MOCK_DATA) {
      await delay(MOCK_DELAY);
      return mockAbout;
    }

    const res = await fetch(`${API_BASE}/api/about`);
    if (!res.ok) {
      throw new Error('Failed to fetch about information');
    }
    return res.json();
  },

  /**
   * Get list of project slugs (for autocomplete)
   */
  async getProjectSlugs(): Promise<string[]> {
    const { projects } = await this.getProjects();
    const slugs = projects.map((p: Project) => p.slug);
    slugs.push('status');
    return slugs;
  },

  // ===========================================================================
  // AUTH API
  // ===========================================================================

  /**
   * Register a new user
   */
  async register(username: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Registration failed');
    }
    return res.json();
  },

  /**
   * Login user
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Login failed');
    }
    return res.json();
  },

  /**
   * Logout user
   */
  async logout(token: string): Promise<void> {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },

  /**
   * Get current user
   */
  async getMe(token: string): Promise<{ user: PublicUser }> {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  // ===========================================================================
  // USERS API
  // ===========================================================================

  /**
   * Get all registered users
   */
  async getUsers(): Promise<{ users: PublicUser[] }> {
    const res = await fetch(`${API_BASE}/api/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  /**
   * Get a user by username
   */
  async getUser(username: string): Promise<{ user: PublicUser }> {
    const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(username)}`);
    if (!res.ok) throw new Error(`User not found: ${username}`);
    return res.json();
  },

  /**
   * Get recently active users
   */
  async getActiveUsers(): Promise<{ users: PublicUser[] }> {
    const res = await fetch(`${API_BASE}/api/users/active`);
    if (!res.ok) throw new Error('Failed to fetch active users');
    return res.json();
  },

  /**
   * Update current user's bio
   */
  async updateBio(token: string, bio: string): Promise<{ user: PublicUser }> {
    const res = await fetch(`${API_BASE}/api/users/bio`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ bio }),
    });
    if (!res.ok) throw new Error('Failed to update bio');
    return res.json();
  },

  // ===========================================================================
  // MESSAGES API
  // ===========================================================================

  /**
   * Send a message to another user
   */
  async sendMessage(
    token: string,
    recipientUsername: string,
    content: string,
    subject?: string
  ): Promise<{ message: Message }> {
    const res = await fetch(`${API_BASE}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ recipientUsername, content, subject }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to send message');
    }
    return res.json();
  },

  /**
   * Get inbox messages
   */
  async getInbox(token: string): Promise<{ messages: Message[]; unreadCount: number }> {
    const res = await fetch(`${API_BASE}/api/messages/inbox`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch inbox');
    return res.json();
  },

  /**
   * Get sent messages
   */
  async getSentMessages(token: string): Promise<{ messages: Message[] }> {
    const res = await fetch(`${API_BASE}/api/messages/sent`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch sent messages');
    return res.json();
  },

  /**
   * Get a specific message
   */
  async getMessage(token: string, id: number): Promise<{ message: Message }> {
    const res = await fetch(`${API_BASE}/api/messages/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Message not found');
    return res.json();
  },

  /**
   * Delete a message
   */
  async deleteMessage(token: string, id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/messages/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete message');
  },

  // ===========================================================================
  // WALL API
  // ===========================================================================

  /**
   * Get wall posts
   */
  async getWall(): Promise<{ posts: WallPost[] }> {
    const res = await fetch(`${API_BASE}/api/wall`);
    if (!res.ok) throw new Error('Failed to fetch wall');
    return res.json();
  },

  /**
   * Post to wall
   */
  async postToWall(token: string, content: string): Promise<{ post: WallPost }> {
    const res = await fetch(`${API_BASE}/api/wall`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to post');
    }
    return res.json();
  },

  /**
   * Delete a wall post
   */
  async deleteWallPost(token: string, id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/wall/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete post');
  },
};

// ===========================================================================
// API TYPES
// ===========================================================================

export interface PublicUser {
  id: number;
  username: string;
  bio?: string;
  registeredAt: string;
  lastSeen: string;
}

export interface AuthResponse {
  user: PublicUser;
  token: string;
}

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

export interface WallPost {
  id: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
}

export type ApiService = typeof api;

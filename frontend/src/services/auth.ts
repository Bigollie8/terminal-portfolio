/**
 * Auth Storage Service
 *
 * Manages authentication state in localStorage.
 */

export interface PublicUser {
  id: number;
  username: string;
  bio?: string;
  registeredAt: string;
  lastSeen: string;
}

const TOKEN_KEY = 'terminal-auth-token';
const USER_KEY = 'terminal-auth-user';

export const authStorage = {
  /**
   * Get the current auth token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get the current user
   */
  getUser(): PublicUser | null {
    const data = localStorage.getItem(USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  /**
   * Set the session (token and user)
   */
  setSession(token: string, user: PublicUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Clear the session
   */
  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  },

  /**
   * Update stored user data
   */
  updateUser(user: PublicUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
};

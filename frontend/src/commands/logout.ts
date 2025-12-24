import type { Command, CommandOutput, OutputLine } from '../types/command';
import { authStorage } from '../services/auth';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * logout command - End current session
 *
 * Usage: logout
 */
export const logoutCommand: Command = {
  name: 'logout',
  description: 'Log out of your account',
  usage: 'logout',
  execute: async (_args: string[], context): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];

    // Check if logged in
    if (!authStorage.isLoggedIn()) {
      lines.push({
        id: generateId(),
        type: 'error',
        content: 'Not logged in.',
        timestamp: Date.now(),
      });
      return { lines };
    }

    const username = authStorage.getUser()?.username;
    const token = authStorage.getToken();

    try {
      // Call logout API
      if (token) {
        await context.api.logout(token);
      }
    } catch {
      // Ignore errors - still clear local session
    }

    // Clear local session
    authStorage.clearSession();

    lines.push({
      id: generateId(),
      type: 'output',
      content: '',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'system',
      content: `  Goodbye, ${username}!`,
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: '',
      timestamp: Date.now(),
    });

    return { lines };
  },
};

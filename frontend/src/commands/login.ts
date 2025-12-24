import type { Command, CommandOutput, OutputLine } from '../types/command';
import { authStorage } from '../services/auth';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * login command - Log into an existing account
 *
 * Usage: login -u <username> -p <password>
 */
export const loginCommand: Command = {
  name: 'login',
  description: 'Log into your account',
  usage: 'login -u <username> -p <password>',
  execute: async (args: string[], context): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];

    // Check if already logged in
    if (authStorage.isLoggedIn()) {
      lines.push({
        id: generateId(),
        type: 'error',
        content: `Already logged in as ${authStorage.getUser()?.username}. Use 'logout' first.`,
        timestamp: Date.now(),
      });
      return { lines };
    }

    // Parse -u and -p flags
    let username = '';
    let password = '';

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-u' && args[i + 1]) {
        username = args[i + 1];
        i++;
      } else if (args[i] === '-p' && args[i + 1]) {
        password = args[i + 1];
        i++;
      }
    }

    // Validate inputs
    if (!username || !password) {
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'system',
        content: '  Usage: login -u <username> -p <password>',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: "  Don't have an account? Use 'register' to create one.",
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
      return { lines };
    }

    try {
      const result = await context.api.login(username, password);

      // Save session
      authStorage.setSession(result.token, result.user);

      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'system',
        content: `  Welcome back, ${result.user.username}!`,
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });

      // Check for unread messages
      try {
        const token = authStorage.getToken();
        if (token) {
          const { unreadCount } = await context.api.getInbox(token);
          if (unreadCount > 0) {
            lines.push({
              id: generateId(),
              type: 'system',
              content: `  You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}. Type 'mail' to view.`,
              timestamp: Date.now(),
            });
            lines.push({
              id: generateId(),
              type: 'output',
              content: '',
              timestamp: Date.now(),
            });
          }
        }
      } catch {
        // Ignore errors fetching mail count
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      lines.push({
        id: generateId(),
        type: 'error',
        content: `Error: ${message}`,
        timestamp: Date.now(),
      });
    }

    return { lines };
  },
};

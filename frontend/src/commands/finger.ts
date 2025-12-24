import type { Command, CommandOutput, OutputLine } from '../types/command';
import { authStorage } from '../services/auth';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const formatTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * finger command - View user profiles
 *
 * Usage:
 *   finger              - List all registered users
 *   finger <username>   - View specific user's profile
 *   finger -bio "text"  - Set your bio (requires login)
 */
export const fingerCommand: Command = {
  name: 'finger',
  description: 'View user profiles',
  usage: 'finger [username | -bio "text"]',
  execute: async (args: string[], context): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];

    try {
      // Check for -bio flag to update bio
      if (args.length >= 1 && args[0] === '-bio') {
        if (!authStorage.isLoggedIn()) {
          lines.push({
            id: generateId(),
            type: 'error',
            content: "You must be logged in to update your bio. Use 'login' or 'register'.",
            timestamp: Date.now(),
          });
          return { lines };
        }

        const bio = args.slice(1).join(' ').replace(/^["']|["']$/g, '');
        if (!bio) {
          lines.push({
            id: generateId(),
            type: 'error',
            content: 'Usage: finger -bio "Your bio text here"',
            timestamp: Date.now(),
          });
          return { lines };
        }

        const token = authStorage.getToken()!;
        const { user } = await context.api.updateBio(token, bio);

        // Update stored user info
        authStorage.setSession(token, user);

        lines.push({
          id: generateId(),
          type: 'output',
          content: '',
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'system',
          content: '  Bio updated!',
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: `  "${bio}"`,
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

      if (args.length === 0) {
        // List all users
        const { users } = await context.api.getUsers();

        lines.push({
          id: generateId(),
          type: 'output',
          content: '',
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'system',
          content: '  Registered Users',
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: '  ' + '─'.repeat(40),
          timestamp: Date.now(),
        });

        if (users.length === 0) {
          lines.push({
            id: generateId(),
            type: 'output',
            content: '  No users registered yet.',
            timestamp: Date.now(),
          });
        } else {
          for (const user of users) {
            const lastSeen = formatTimeAgo(user.lastSeen);
            lines.push({
              id: generateId(),
              type: 'output',
              content: `  ${user.username.padEnd(20)} ${lastSeen}`,
              timestamp: Date.now(),
            });
          }
        }

        lines.push({
          id: generateId(),
          type: 'output',
          content: '',
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: `  ${users.length} user${users.length !== 1 ? 's' : ''} total`,
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: '',
          timestamp: Date.now(),
        });
      } else {
        // Get specific user
        const username = args[0];
        const { user } = await context.api.getUser(username);

        lines.push({
          id: generateId(),
          type: 'output',
          content: '',
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'system',
          content: `  User: ${user.username}`,
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: '  ' + '─'.repeat(30),
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: `  Bio:          ${user.bio || '(not set)'}`,
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: `  Member since: ${formatDate(user.registeredAt)}`,
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: `  Last seen:    ${formatTimeAgo(user.lastSeen)}`,
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: '',
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch user info';
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

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

/**
 * wall command - Public message board
 *
 * Usage:
 *   wall             - View recent posts
 *   wall <message>   - Post to wall (requires login)
 */
export const wallCommand: Command = {
  name: 'wall',
  description: 'Public message board',
  usage: 'wall [message]',
  execute: async (args: string[], context): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];

    try {
      if (args.length === 0) {
        // View wall
        const { posts } = await context.api.getWall();

        lines.push({
          id: generateId(),
          type: 'output',
          content: '',
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'system',
          content: '  ══════ Public Wall ══════',
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: '',
          timestamp: Date.now(),
        });

        if (posts.length === 0) {
          lines.push({
            id: generateId(),
            type: 'output',
            content: '  No posts yet. Be the first!',
            timestamp: Date.now(),
          });
        } else {
          for (const post of posts.slice(0, 20)) {
            lines.push({
              id: generateId(),
              type: 'system',
              content: `  [${post.username}] ${formatTimeAgo(post.createdAt)}`,
              timestamp: Date.now(),
            });

            // Handle multiline content
            const contentLines = post.content.split('\n');
            for (const line of contentLines) {
              lines.push({
                id: generateId(),
                type: 'output',
                content: `  ${line}`,
                timestamp: Date.now(),
              });
            }

            lines.push({
              id: generateId(),
              type: 'output',
              content: '',
              timestamp: Date.now(),
            });
          }
        }

        lines.push({
          id: generateId(),
          type: 'output',
          content: '  ' + '─'.repeat(30),
          timestamp: Date.now(),
        });

        if (authStorage.isLoggedIn()) {
          lines.push({
            id: generateId(),
            type: 'output',
            content: "  Type 'wall <message>' to post",
            timestamp: Date.now(),
          });
        } else {
          lines.push({
            id: generateId(),
            type: 'output',
            content: "  Login to post: 'register' or 'login'",
            timestamp: Date.now(),
          });
        }

        lines.push({
          id: generateId(),
          type: 'output',
          content: '',
          timestamp: Date.now(),
        });
      } else {
        // Post to wall
        if (!authStorage.isLoggedIn()) {
          lines.push({
            id: generateId(),
            type: 'error',
            content: "You must be logged in to post. Use 'login' or 'register'.",
            timestamp: Date.now(),
          });
          return { lines };
        }

        const token = authStorage.getToken()!;
        const content = args.join(' ');

        const { post } = await context.api.postToWall(token, content);

        lines.push({
          id: generateId(),
          type: 'output',
          content: '',
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'system',
          content: '  Posted to wall!',
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
          content: `  [${post.username}] ${formatTimeAgo(post.createdAt)}`,
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: `  ${post.content}`,
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
      const message = err instanceof Error ? err.message : 'Failed to process wall command';
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

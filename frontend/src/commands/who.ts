import type { Command, CommandOutput, OutputLine } from '../types/command';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const formatTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'active now';
  if (diffMins < 60) return `active ${diffMins}m ago`;
  return `active ${Math.floor(diffMins / 60)}h ago`;
};

/**
 * who command - Show recently active users
 *
 * Usage: who
 */
export const whoCommand: Command = {
  name: 'who',
  description: 'Show online users',
  usage: 'who',
  execute: async (_args: string[], context): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];

    try {
      const { users } = await context.api.getActiveUsers();

      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'system',
        content: '  Currently Online',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '  ' + '─'.repeat(30),
        timestamp: Date.now(),
      });

      if (users.length === 0) {
        lines.push({
          id: generateId(),
          type: 'output',
          content: '  No users online right now.',
          timestamp: Date.now(),
        });
      } else {
        for (const user of users) {
          const status = formatTimeAgo(user.lastSeen);
          lines.push({
            id: generateId(),
            type: 'output',
            content: `  ${user.username.padEnd(16)} ${status}`,
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch active users';
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

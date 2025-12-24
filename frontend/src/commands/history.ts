import type { Command, CommandOutput, OutputLine } from '../types/command';

/**
 * Generate unique ID for output lines
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * history command - shows command history
 */
export const historyCommand: Command = {
  name: 'history',
  description: 'Show command history',
  usage: 'history [-c]',
  execute: async (args: string[], context): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];

    // Check for clear flag
    if (args.includes('-c') || args.includes('--clear')) {
      return {
        lines: [
          {
            id: generateId(),
            type: 'system',
            content: 'History cleared.',
            timestamp: Date.now(),
          },
        ],
      };
    }

    if (context.history.length === 0) {
      lines.push({
        id: generateId(),
        type: 'output',
        content: 'No commands in history.',
        timestamp: Date.now(),
      });
    } else {
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });

      // Determine number width for alignment
      const numWidth = String(context.history.length).length;

      context.history.forEach((cmd, index) => {
        const num = String(index + 1).padStart(numWidth, ' ');
        lines.push({
          id: generateId(),
          type: 'output',
          content: `  ${num}  ${cmd}`,
          timestamp: Date.now(),
        });
      });

      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
    }

    return { lines };
  },
};

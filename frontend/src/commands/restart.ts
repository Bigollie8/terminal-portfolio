import type { Command, CommandOutput, OutputLine } from '../types/command';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * restart command - Refresh the terminal/browser
 *
 * Usage: restart
 */
export const restartCommand: Command = {
  name: 'restart',
  description: 'Restart the terminal',
  usage: 'restart',
  execute: async (): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];

    lines.push({
      id: generateId(),
      type: 'output',
      content: '',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'system',
      content: '  Restarting terminal...',
      timestamp: Date.now(),
    });

    // Small delay so user sees the message before reload
    setTimeout(() => {
      window.location.reload();
    }, 500);

    return { lines };
  },
};

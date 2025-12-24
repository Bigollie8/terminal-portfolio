import type { Command, CommandOutput } from '../types/command';

/**
 * clear command - clears the terminal screen
 */
export const clearCommand: Command = {
  name: 'clear',
  description: 'Clear the terminal screen',
  usage: 'clear',
  execute: async (): Promise<CommandOutput> => {
    return {
      lines: [],
      clear: true,
    };
  },
};

import type { Command, CommandOutput, OutputLine } from '../types/command';

/**
 * Generate unique ID for output lines
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * echo command - prints text to terminal
 */
export const echoCommand: Command = {
  name: 'echo',
  description: 'Print text to terminal',
  usage: 'echo <text>',
  execute: async (args: string[]): Promise<CommandOutput> => {
    const text = args.join(' ');

    // Easter eggs!
    if (text.toLowerCase() === 'hello') {
      return {
        lines: [
          {
            id: generateId(),
            type: 'output',
            content: 'Hello, world!',
            timestamp: Date.now(),
          },
        ],
      };
    }

    if (text.toLowerCase() === 'the cake is a lie') {
      return {
        lines: [
          {
            id: generateId(),
            type: 'system',
            content: 'This was a triumph.',
            timestamp: Date.now(),
          },
        ],
      };
    }

    const lines: OutputLine[] = [
      {
        id: generateId(),
        type: 'output',
        content: text || '',
        timestamp: Date.now(),
      },
    ];

    return { lines };
  },
};

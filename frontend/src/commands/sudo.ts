import type { Command, CommandOutput, OutputLine } from '../types/command';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const responses = [
  "Nice try, but you're not root here.",
  "Permission denied. This incident will be reported.",
  "sudo: unable to resolve host your-imagination",
  "We trust you have received the usual lecture from the local System Administrator.",
  "Error: User 'visitor' is not in the sudoers file.",
  "Access denied. Did you really think that would work?",
];

/**
 * sudo command - funny permission denied messages
 */
export const sudoCommand: Command = {
  name: 'sudo',
  description: 'Try to run as superuser',
  usage: 'sudo <command>',
  execute: async (args: string[]): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];

    if (args.length === 0) {
      lines.push({
        id: generateId(),
        type: 'error',
        content: 'usage: sudo <command>',
        timestamp: Date.now(),
      });
    } else if (args[0] === 'make' && args[1] === 'me' && args[2] === 'a' && args[3] === 'sandwich') {
      lines.push({
        id: generateId(),
        type: 'system',
        content: 'Okay.',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '  🥪',
        timestamp: Date.now(),
      });
    } else {
      const response = responses[Math.floor(Math.random() * responses.length)];
      lines.push({
        id: generateId(),
        type: 'error',
        content: response,
        timestamp: Date.now(),
      });
    }

    return { lines };
  },
};

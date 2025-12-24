import type { Command, CommandOutput, OutputLine, CommandContext } from '../types/command';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * rm command - fake delete with rm -rf / joke
 */
export const rmCommand: Command = {
  name: 'rm',
  description: 'Remove files (simulated)',
  usage: 'rm <file>',
  execute: async (args: string[], context: CommandContext): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];
    const input = args.join(' ');

    if (input.includes('-rf') && (input.includes('/') || input.includes('*'))) {
      lines.push({
        id: generateId(),
        type: 'error',
        content: 'rm: WARNING: Recursive deletion detected!',
        timestamp: Date.now(),
      });

      // Fake deletion sequence
      const fakeFiles = [
        '/bin/bash',
        '/etc/passwd',
        '/home/visitor/.bashrc',
        '/usr/lib/libc.so.6',
        '/var/log/syslog',
        '/boot/vmlinuz',
      ];

      setTimeout(() => {
        let index = 0;
        const timer = setInterval(() => {
          if (index >= fakeFiles.length) {
            clearInterval(timer);
            context.addOutput([
              {
                id: generateId(),
                type: 'system',
                content: '',
                timestamp: Date.now(),
              },
              {
                id: generateId(),
                type: 'system',
                content: 'Just kidding! Nothing was actually deleted.',
                timestamp: Date.now(),
              },
              {
                id: generateId(),
                type: 'system',
                content: 'This is just a portfolio website. Your files are safe.',
                timestamp: Date.now(),
              },
            ]);
            return;
          }
          context.addOutput([{
            id: generateId(),
            type: 'error',
            content: `rm: deleting '${fakeFiles[index]}'...`,
            timestamp: Date.now(),
          }]);
          index++;
        }, 200);
      }, 500);
    } else if (args.length === 0) {
      lines.push({
        id: generateId(),
        type: 'error',
        content: 'rm: missing operand',
        timestamp: Date.now(),
      });
    } else {
      lines.push({
        id: generateId(),
        type: 'output',
        content: `rm: cannot remove '${args[0]}': This is a simulated filesystem`,
        timestamp: Date.now(),
      });
    }

    return { lines };
  },
};

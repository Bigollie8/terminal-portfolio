import type { Command, CommandOutput, OutputLine } from '../types/command';

/**
 * Generate unique ID for output lines
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create an output line
 */
const output = (content: string): OutputLine => ({
  id: generateId(),
  type: 'output',
  content,
  timestamp: Date.now(),
});

/**
 * Create an error line
 */
const error = (content: string): OutputLine => ({
  id: generateId(),
  type: 'error',
  content,
  timestamp: Date.now(),
});

/**
 * contact command - show contact information
 */
export const contactCommand: Command = {
  name: 'contact',
  description: 'Show contact information',
  usage: 'contact',
  execute: async (_args: string[], context): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];

    try {
      const about = await context.api.getAbout();

      lines.push(output(''));
      lines.push(output('  Contact Information'));
      lines.push(output('  ' + '='.repeat(40)));
      lines.push(output(''));

      // Email
      lines.push(output(`  Email:    ${about.email}`));

      // Social links
      if (about.github) {
        lines.push(output(`  GitHub:   ${about.github}`));
      }
      if (about.linkedin) {
        lines.push(output(`  LinkedIn: ${about.linkedin}`));
      }

      lines.push(output(''));
      lines.push(output('  ' + '-'.repeat(40)));
      lines.push(output('  Feel free to reach out!'));
      lines.push(output(''));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      lines.push(error(`Failed to fetch contact info: ${message}`));
    }

    return { lines };
  },
};

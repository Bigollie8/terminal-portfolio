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
 * whoami command - display information about me
 */
export const whoamiCommand: Command = {
  name: 'whoami',
  description: 'Display information about me',
  usage: 'whoami',
  execute: async (_args: string[], context): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];

    try {
      const about = await context.api.getAbout();

      lines.push(output(''));

      // ASCII art if available
      if (about.asciiArt) {
        const artLines = about.asciiArt.split('\n');
        for (const line of artLines) {
          lines.push(output(line));
        }
        lines.push(output(''));
      }

      lines.push(output('  ' + '='.repeat(50)));
      lines.push(output(`  ${about.name}`));
      lines.push(output(`  ${about.title}`));
      lines.push(output('  ' + '='.repeat(50)));
      lines.push(output(''));

      // Bio
      lines.push(output('  About:'));
      const bioLines = about.bio.split('\n');
      for (const line of bioLines) {
        lines.push(output(`  ${line}`));
      }
      lines.push(output(''));

      lines.push(output('  ' + '-'.repeat(50)));
      lines.push(output("  Type 'contact' to see how to reach me."));
      lines.push(output("  Type 'ls' to see my projects."));
      lines.push(output(''));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      lines.push(error(`Failed to fetch profile: ${message}`));
    }

    return { lines };
  },
};

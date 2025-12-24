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
 * cd command - navigate to project URL
 */
export const cdCommand: Command = {
  name: 'cd',
  description: 'Navigate to project URL',
  usage: 'cd <project-slug>',
  execute: async (args: string[], context): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];

    if (args.length === 0) {
      lines.push(error('Usage: cd <project-slug>'));
      lines.push(output("Use 'ls' to see available projects."));
      return { lines };
    }

    const slug = args[0].toLowerCase();

    // Handle special cases
    if (slug === '~' || slug === '-' || slug === '..') {
      lines.push(output("You're already home!"));
      return { lines };
    }

    // Handle status as a special case
    if (slug === 'status') {
      lines.push(output(''));
      lines.push(output('  Navigating to: Service Status Dashboard'));
      lines.push(output('  URL: https://status.basedsecurity.net'));
      lines.push(output(''));

      return {
        lines,
        redirect: 'https://status.basedsecurity.net',
      };
    }

    try {
      const { project } = await context.api.getProject(slug);

      lines.push(output(''));
      lines.push(output(`  Navigating to: ${project.name}`));
      lines.push(output(`  URL: ${project.url}`));
      lines.push(output(''));

      return {
        lines,
        redirect: project.url,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';

      if (message.includes('not found')) {
        lines.push(error(`Project not found: ${slug}`));
        lines.push(output("Use 'ls' to see available projects."));
      } else {
        lines.push(error(`Failed to navigate: ${message}`));
      }

      return { lines };
    }
  },
};

import type { Command, CommandOutput, OutputLine } from '../types/command';
import type { Project } from '../types/project';

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
 * Format project status with color indicator
 */
const formatStatus = (status: Project['status']): string => {
  switch (status) {
    case 'active':
      return '[active]';
    case 'wip':
      return '[wip]   ';
    case 'archived':
      return '[arch]  ';
    default:
      return '        ';
  }
};

/**
 * ls command - list all projects
 */
export const lsCommand: Command = {
  name: 'ls',
  description: 'List all projects',
  usage: 'ls [-l]',
  execute: async (args: string[], context): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];
    const longFormat = args.includes('-l') || args.includes('--long');

    try {
      const { projects } = await context.api.getProjects();

      if (projects.length === 0) {
        lines.push(output('No projects found.'));
        return { lines };
      }

      lines.push(output(''));

      if (longFormat) {
        // Detailed list format
        lines.push(output('  Projects:'));
        lines.push(output('  ' + '='.repeat(60)));
        lines.push(output(''));

        // Sort by displayOrder
        const sorted = [...projects].sort((a, b) => a.displayOrder - b.displayOrder);

        for (const project of sorted) {
          const featured = project.featured ? '*' : ' ';
          const status = formatStatus(project.status);

          lines.push(output(`  ${featured} ${project.slug}`));
          lines.push(output(`      ${status} ${project.description}`));
          lines.push(output(`      Tech: ${project.techStack.join(', ')}`));
          lines.push(output(''));
        }

        // Add status as a special item
        lines.push(output('    status'));
        lines.push(output('      [live]   Live service status dashboard'));
        lines.push(output('      Tech: Node.js, Express, Docker'));
        lines.push(output(''));

        lines.push(output('  * = featured project'));
        lines.push(output(''));
        lines.push(output(`  Total: ${projects.length + 1} items`));
      } else {
        // Simple list format - columns
        const slugs = projects
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((p) => p.slug);

        // Add status to the list
        slugs.push('status');

        // Calculate column width
        const maxLen = Math.max(...slugs.map((s) => s.length)) + 2;
        const termWidth = 80;
        const columns = Math.floor(termWidth / maxLen) || 1;

        // Group into rows
        for (let i = 0; i < slugs.length; i += columns) {
          const row = slugs.slice(i, i + columns);
          const formatted = row.map((s) => s.padEnd(maxLen)).join('');
          lines.push(output(`  ${formatted}`));
        }
      }

      lines.push(output(''));
      lines.push(output("  Use 'cat <project>' to view details."));
      lines.push(output(''));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      lines.push({
        id: generateId(),
        type: 'error',
        content: `Failed to fetch projects: ${message}`,
        timestamp: Date.now(),
      });
    }

    return { lines };
  },
};

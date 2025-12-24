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
 * Format a date string for display
 */
const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

/**
 * cat command - view project details
 */
export const catCommand: Command = {
  name: 'cat',
  description: 'View project details',
  usage: 'cat <project-slug>',
  execute: async (args: string[], context): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];

    if (args.length === 0) {
      lines.push(error('Usage: cat <project-slug>'));
      lines.push(output("Use 'ls' to see available projects."));
      return { lines };
    }

    const slug = args[0].toLowerCase();

    // Handle status as a special case - fetch live service status
    if (slug === 'status') {
      try {
        const response = await fetch('https://status.basedsecurity.net/api/status');
        const data = await response.json();

        lines.push(output(''));
        lines.push(output('  ' + '='.repeat(60)));
        lines.push(output('  Service Status Dashboard'));
        lines.push(output('  ' + '='.repeat(60)));
        lines.push(output(''));

        // Overall status
        const overallIcon = data.overallStatus === 'operational' ? '[OK]' :
                           data.overallStatus === 'degraded' ? '[!!]' : '[XX]';
        const overallText = data.overallStatus === 'operational' ? 'All Systems Operational' :
                           data.overallStatus === 'degraded' ? 'Partial System Outage' : 'Major System Outage';
        lines.push(output(`  Overall: ${overallIcon} ${overallText}`));
        lines.push(output(''));

        // Group services by category
        const categories: Record<string, typeof data.services> = {};
        for (const service of data.services) {
          const cat = service.category || 'other';
          if (!categories[cat]) categories[cat] = [];
          categories[cat].push(service);
        }

        const categoryNames: Record<string, string> = {
          application: 'Applications',
          microservice: 'Microservices',
          infrastructure: 'Infrastructure'
        };

        for (const [category, services] of Object.entries(categories)) {
          lines.push(output(`  ${categoryNames[category] || category}:`));
          lines.push(output('  ' + '-'.repeat(40)));

          for (const service of services) {
            const statusIcon = service.status === 'operational' ? '[OK]' :
                              service.status === 'degraded' ? '[!!]' : '[XX]';
            const responseTime = service.responseTime ? `${service.responseTime}ms` : '-';
            lines.push(output(`    ${statusIcon} ${service.name.padEnd(25)} ${responseTime.padStart(8)}`));
          }
          lines.push(output(''));
        }

        lines.push(output(`  Last Updated: ${new Date(data.timestamp).toLocaleTimeString()}`));
        lines.push(output(''));
        lines.push(output('  ' + '-'.repeat(60)));
        lines.push(output("  Use 'cd status' to visit the full status dashboard."));
        lines.push(output(''));

        return { lines };
      } catch {
        lines.push(error('Failed to fetch service status'));
        lines.push(output("Try visiting https://status.basedsecurity.net directly."));
        return { lines };
      }
    }

    try {
      const { project } = await context.api.getProject(slug);

      lines.push(output(''));
      lines.push(output('  ' + '='.repeat(60)));
      lines.push(output(`  ${project.name}`));
      lines.push(output('  ' + '='.repeat(60)));
      lines.push(output(''));

      // Status line
      const statusIcon =
        project.status === 'active'
          ? '[ACTIVE]'
          : project.status === 'wip'
          ? '[WIP]'
          : '[ARCHIVED]';
      const featuredBadge = project.featured ? ' *FEATURED*' : '';
      lines.push(output(`  Status: ${statusIcon}${featuredBadge}`));
      lines.push(output(''));

      // Description
      lines.push(output('  Description:'));
      lines.push(output(`  ${project.description}`));
      lines.push(output(''));

      // Long description if available
      if (project.longDescription) {
        lines.push(output('  Details:'));
        // Split long description into lines
        const descLines = project.longDescription.split('\n');
        for (const line of descLines) {
          lines.push(output(`  ${line}`));
        }
        lines.push(output(''));
      }

      // Tech stack
      lines.push(output('  Tech Stack:'));
      lines.push(output(`  ${project.techStack.join(' | ')}`));
      lines.push(output(''));

      // URLs
      lines.push(output('  Links:'));
      lines.push(output(`  URL:    ${project.url}`));
      if (project.githubUrl) {
        lines.push(output(`  GitHub: ${project.githubUrl}`));
      }
      lines.push(output(''));

      // Dates
      lines.push(output('  Timeline:'));
      lines.push(output(`  Created:  ${formatDate(project.createdAt)}`));
      lines.push(output(`  Updated:  ${formatDate(project.updatedAt)}`));
      lines.push(output(''));

      lines.push(output('  ' + '-'.repeat(60)));
      lines.push(output(`  Use 'cd ${project.slug}' to visit this project.`));
      lines.push(output(''));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';

      if (message.includes('not found')) {
        lines.push(error(`Project not found: ${slug}`));
        lines.push(output("Use 'ls' to see available projects."));
      } else {
        lines.push(error(`Failed to fetch project: ${message}`));
      }
    }

    return { lines };
  },
};

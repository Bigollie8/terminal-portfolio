import type { Command, CommandOutput, OutputLine } from '../types/command';

/**
 * Generate unique ID for output lines
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * AWS Infrastructure for portfolio applications
 * Color-coded by application
 */
const infrastructure = {
  rapidphotoflow: {
    name: 'RapidPhotoFlow',
    color: 'cyan',
    region: 'us-east-1',
    services: [
      { type: 'Route 53', name: 'photos.basedsecurity.net', icon: '🌐' },
      { type: 'CloudFront', name: 'CDN Distribution', icon: '⚡' },
      { type: 'S3', name: 'rpf-frontend-bucket', icon: '📦' },
      { type: 'ALB', name: 'rpf-load-balancer', icon: '⚖️' },
      { type: 'ECS', name: 'rpf-backend-cluster', icon: '🐳' },
      { type: 'RDS', name: 'rpf-postgres-db', icon: '🗄️' },
      { type: 'S3', name: 'rpf-photo-storage', icon: '📸' },
      { type: 'Cognito', name: 'rpf-user-pool', icon: '🔐' },
    ],
  },
  basedsecurity: {
    name: 'BasedSecurity',
    color: 'green',
    region: 'us-east-1',
    services: [
      { type: 'Route 53', name: 'basedsecurity.net', icon: '🌐' },
      { type: 'CloudFront', name: 'CDN Distribution', icon: '⚡' },
      { type: 'S3', name: 'bs-frontend-bucket', icon: '📦' },
      { type: 'ALB', name: 'bs-load-balancer', icon: '⚖️' },
      { type: 'ECS', name: 'bs-api-cluster', icon: '🐳' },
      { type: 'RDS', name: 'bs-postgres-db', icon: '🗄️' },
      { type: 'ElastiCache', name: 'bs-redis-cluster', icon: '⚡' },
    ],
  },
  terminal: {
    name: 'Terminal Portfolio',
    color: 'purple',
    region: 'us-east-1',
    services: [
      { type: 'Route 53', name: 'oliverland.dev', icon: '🌐' },
      { type: 'CloudFront', name: 'CDN Distribution', icon: '⚡' },
      { type: 'S3', name: 'terminal-frontend', icon: '📦' },
      { type: 'Lambda', name: 'terminal-api', icon: '⚙️' },
      { type: 'DynamoDB', name: 'terminal-data', icon: '📊' },
    ],
  },
};

type AppKey = keyof typeof infrastructure;

/**
 * Generate ASCII diagram of infrastructure
 */
const generateDiagram = (appKey: AppKey): string[] => {
  const app = infrastructure[appKey];
  const lines: string[] = [];

  lines.push('');
  lines.push(`{${app.color}}  ┌${'─'.repeat(48)}┐{/${app.color}}`);
  lines.push(`{${app.color}}  │${' '.repeat(15)}${app.name.padEnd(33)}│{/${app.color}}`);
  lines.push(`{${app.color}}  │${' '.repeat(15)}Region: ${app.region.padEnd(24)}│{/${app.color}}`);
  lines.push(`{${app.color}}  └${'─'.repeat(48)}┘{/${app.color}}`);
  lines.push('');
  lines.push(`{${app.color}}                    │{/${app.color}}`);
  lines.push(`{${app.color}}                    ▼{/${app.color}}`);

  // Group services by tier
  const tiers = {
    edge: ['Route 53', 'CloudFront'],
    frontend: ['S3'],
    loadbalancing: ['ALB'],
    compute: ['ECS', 'Lambda'],
    database: ['RDS', 'DynamoDB', 'ElastiCache'],
    storage: ['S3'],
    auth: ['Cognito'],
  };

  // Edge tier
  const edgeServices = app.services.filter(s => tiers.edge.includes(s.type));
  if (edgeServices.length > 0) {
    lines.push(`{${app.color}}  ┌─── Edge Layer ${'─'.repeat(32)}┐{/${app.color}}`);
    for (const svc of edgeServices) {
      lines.push(`{${app.color}}  │  ${svc.icon} ${svc.type.padEnd(12)} │ ${svc.name.padEnd(23)}│{/${app.color}}`);
    }
    lines.push(`{${app.color}}  └${'─'.repeat(48)}┘{/${app.color}}`);
    lines.push(`{${app.color}}                    │{/${app.color}}`);
    lines.push(`{${app.color}}                    ▼{/${app.color}}`);
  }

  // Compute tier
  const computeServices = app.services.filter(s =>
    ['ALB', 'ECS', 'Lambda'].includes(s.type)
  );
  if (computeServices.length > 0) {
    lines.push(`{${app.color}}  ┌─── Compute Layer ${'─'.repeat(29)}┐{/${app.color}}`);
    for (const svc of computeServices) {
      lines.push(`{${app.color}}  │  ${svc.icon} ${svc.type.padEnd(12)} │ ${svc.name.padEnd(23)}│{/${app.color}}`);
    }
    lines.push(`{${app.color}}  └${'─'.repeat(48)}┘{/${app.color}}`);
    lines.push(`{${app.color}}                    │{/${app.color}}`);
    lines.push(`{${app.color}}                    ▼{/${app.color}}`);
  }

  // Data tier
  const dataServices = app.services.filter(s =>
    ['RDS', 'DynamoDB', 'ElastiCache', 'Cognito'].includes(s.type) ||
    (s.type === 'S3' && s.name.includes('storage'))
  );
  if (dataServices.length > 0) {
    lines.push(`{${app.color}}  ┌─── Data Layer ${'─'.repeat(32)}┐{/${app.color}}`);
    for (const svc of dataServices) {
      lines.push(`{${app.color}}  │  ${svc.icon} ${svc.type.padEnd(12)} │ ${svc.name.padEnd(23)}│{/${app.color}}`);
    }
    lines.push(`{${app.color}}  └${'─'.repeat(48)}┘{/${app.color}}`);
  }

  lines.push('');

  return lines;
};

/**
 * aws command - show AWS infrastructure for applications
 */
export const awsCommand: Command = {
  name: 'aws',
  description: 'Show AWS infrastructure for applications',
  usage: 'aws [app-name] | aws --all',
  execute: async (args: string[]): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];

    if (args.length === 0) {
      // List available applications
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '  AWS Infrastructure Viewer',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '  ' + '='.repeat(40),
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '  Available Applications:',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });

      for (const [key, app] of Object.entries(infrastructure)) {
        lines.push({
          id: generateId(),
          type: 'output',
          content: `    {${app.color}}${key.padEnd(16)}{/${app.color}} - ${app.name}`,
          timestamp: Date.now(),
        });
      }

      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '  Usage:',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '    aws <app-name>  - Show infrastructure for specific app',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '    aws --all       - Show all infrastructure',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
    } else if (args[0] === '--all') {
      // Show all infrastructure
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'system',
        content: '  AWS Infrastructure Overview - All Applications',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '  ' + '='.repeat(50),
        timestamp: Date.now(),
      });

      for (const key of Object.keys(infrastructure) as AppKey[]) {
        const diagram = generateDiagram(key);
        for (const line of diagram) {
          lines.push({
            id: generateId(),
            type: 'output',
            content: line,
            timestamp: Date.now(),
          });
        }
        lines.push({
          id: generateId(),
          type: 'output',
          content: '',
          timestamp: Date.now(),
        });
      }
    } else {
      // Show specific application
      const appKey = args[0].toLowerCase() as AppKey;

      if (!(appKey in infrastructure)) {
        lines.push({
          id: generateId(),
          type: 'error',
          content: `Unknown application: ${args[0]}`,
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: `Available: ${Object.keys(infrastructure).join(', ')}`,
          timestamp: Date.now(),
        });
        return { lines };
      }

      const app = infrastructure[appKey];
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'system',
        content: `  AWS Infrastructure: ${app.name}`,
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '  ' + '='.repeat(50),
        timestamp: Date.now(),
      });

      const diagram = generateDiagram(appKey);
      for (const line of diagram) {
        lines.push({
          id: generateId(),
          type: 'output',
          content: line,
          timestamp: Date.now(),
        });
      }

      // Add service summary
      lines.push({
        id: generateId(),
        type: 'output',
        content: `  {${app.color}}Service Summary:{/${app.color}}`,
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: `    Total Services: ${app.services.length}`,
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: `    Region: ${app.region}`,
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
    }

    return { lines };
  },
};

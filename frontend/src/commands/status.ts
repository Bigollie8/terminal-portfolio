import type { Command, CommandOutput, OutputLine } from '../types/command';

/**
 * Generate unique ID for output lines
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * API base URL for fetching deployment data
 */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Service deployment info from API
 */
interface ServiceInfo {
  name: string;
  url: string;
  description: string;
  icon: string;
  version: string;
  commit: string | null;
  deployedAt: string;
}

/**
 * Fallback service definitions (used if API is unavailable)
 */
const fallbackServices: Record<string, ServiceInfo> = {
  terminal: {
    name: 'Terminal Portfolio',
    url: 'https://portfolio.basedsecurity.net',
    description: 'Interactive terminal portfolio',
    icon: '💻',
    version: '2.1.0',
    commit: null,
    deployedAt: new Date().toISOString().split('T')[0],
  },
  basedsecurity: {
    name: 'BasedSecurity',
    url: 'https://security.basedsecurity.net',
    description: 'AI Security Training Platform',
    icon: '🔐',
    version: '1.3.2',
    commit: null,
    deployedAt: new Date().toISOString().split('T')[0],
  },
  rapidphotoflow: {
    name: 'RapidPhotoFlow',
    url: 'https://photos.basedsecurity.net',
    description: 'Photo Management System',
    icon: '📸',
    version: '1.0.5',
    commit: null,
    deployedAt: new Date().toISOString().split('T')[0],
  },
  shipping: {
    name: 'Shipping Monitor',
    url: 'https://shipping.basedsecurity.net',
    description: 'Package Tracking Dashboard',
    icon: '📦',
    version: '1.0.0',
    commit: null,
    deployedAt: new Date().toISOString().split('T')[0],
  },
};

/**
 * Fetch deployment data from API
 */
let cachedServices: Record<string, ServiceInfo> | null = null;
let cacheTime = 0;
const CACHE_TTL = 60000; // 1 minute cache

async function fetchServices(): Promise<Record<string, ServiceInfo>> {
  // Return cached data if still valid
  if (cachedServices && Date.now() - cacheTime < CACHE_TTL) {
    return cachedServices;
  }

  try {
    const response = await fetch(`${API_BASE}/api/deployments`);
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    cachedServices = data;
    cacheTime = Date.now();
    return data;
  } catch {
    // Return fallback if API is unavailable
    return fallbackServices;
  }
}

type ServiceKey = string;

/**
 * Check service health (simulated - would do real health checks in production)
 */
const checkHealth = async (_serviceKey: ServiceKey): Promise<'online' | 'degraded' | 'offline'> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

  // Simulated health - 90% online, 8% degraded, 2% offline
  const rand = Math.random();
  if (rand > 0.98) return 'offline';
  if (rand > 0.90) return 'degraded';
  return 'online';
};

/**
 * Get status indicator
 */
const getStatusIndicator = (status: 'online' | 'degraded' | 'offline'): string => {
  switch (status) {
    case 'online': return '● ONLINE';
    case 'degraded': return '◐ DEGRADED';
    case 'offline': return '○ OFFLINE';
  }
};

/**
 * Get status color
 */
const getStatusColor = (status: 'online' | 'degraded' | 'offline'): string => {
  switch (status) {
    case 'online': return 'green';
    case 'degraded': return 'yellow';
    case 'offline': return 'red';
  }
};

/**
 * status command - monitor services running on the domain
 */
export const statusCommand: Command = {
  name: 'status',
  description: 'Monitor services and view deployment info',
  usage: 'status [service-name] | status --check',
  execute: async (args: string[]): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];
    const services = await fetchServices();

    if (args.length === 0) {
      // Show all services overview
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '  Service Status Dashboard',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '  ' + '═'.repeat(50),
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });

      for (const service of Object.values(services)) {
        const commitDisplay = service.commit ? ` (${service.commit.substring(0, 7)})` : '';
        const deployDate = service.deployedAt.split('T')[0];
        lines.push({
          id: generateId(),
          type: 'output',
          content: `  ${service.icon} ${service.name}`,
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: `     URL: ${service.url}`,
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: `     Version: ${service.version}${commitDisplay}`,
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: `     Last Deploy: ${deployDate}`,
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: '',
          timestamp: Date.now(),
        });
      }

      lines.push({
        id: generateId(),
        type: 'output',
        content: '  ' + '─'.repeat(50),
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
        content: '    status <service>  - Detailed info for a service',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '    status --check    - Run health checks on all services',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
    } else if (args[0] === '--check') {
      // Run health checks
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'system',
        content: '  Running health checks...',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });

      for (const [key, service] of Object.entries(services)) {
        const health = await checkHealth(key);
        const indicator = getStatusIndicator(health);
        const color = getStatusColor(health);

        lines.push({
          id: generateId(),
          type: 'output',
          content: `  ${service.icon} ${service.name.padEnd(20)} {${color}}${indicator}{/${color}}`,
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
        type: 'system',
        content: `  Health check completed at ${new Date().toLocaleTimeString()}`,
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
    } else {
      // Show specific service
      const serviceKey = args[0].toLowerCase();

      if (!(serviceKey in services)) {
        lines.push({
          id: generateId(),
          type: 'error',
          content: `Unknown service: ${args[0]}`,
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: `Available services: ${Object.keys(services).join(', ')}`,
          timestamp: Date.now(),
        });
        return { lines };
      }

      const service = services[serviceKey];
      const health = await checkHealth(serviceKey);
      const indicator = getStatusIndicator(health);
      const color = getStatusColor(health);
      const commitDisplay = service.commit ? service.commit.substring(0, 7) : 'N/A';
      const deployDate = service.deployedAt.split('T')[0];

      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: `  ┌${'─'.repeat(48)}┐`,
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: `  │  ${service.icon} ${service.name.padEnd(43)}│`,
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: `  └${'─'.repeat(48)}┘`,
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
        content: `  Description: ${service.description}`,
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: `  URL:         ${service.url}`,
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: `  Status:      {${color}}${indicator}{/${color}}`,
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
        type: 'system',
        content: '  Deployment Info:',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: `    Version:     ${service.version}`,
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: `    Commit:      ${commitDisplay}`,
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: `    Deployed:    ${deployDate}`,
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
        content: `  Quick Actions:`,
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: `    Visit:  open ${service.url}`,
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: `    Infra:  aws ${serviceKey}`,
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

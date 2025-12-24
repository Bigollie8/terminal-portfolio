import type { Command, CommandOutput, OutputLine } from '../types/command';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Store page load time
const pageLoadTime = Date.now();

/**
 * uptime command - shows time since page was loaded
 */
export const uptimeCommand: Command = {
  name: 'uptime',
  description: 'Show session uptime',
  usage: 'uptime',
  execute: async (): Promise<CommandOutput> => {
    const now = Date.now();
    const uptimeMs = now - pageLoadTime;
    const lines: OutputLine[] = [];

    const seconds = Math.floor(uptimeMs / 1000) % 60;
    const minutes = Math.floor(uptimeMs / (1000 * 60)) % 60;
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60)) % 24;
    const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));

    let uptimeStr = '';
    if (days > 0) uptimeStr += `${days} day${days !== 1 ? 's' : ''}, `;
    if (hours > 0 || days > 0) uptimeStr += `${hours} hour${hours !== 1 ? 's' : ''}, `;
    if (minutes > 0 || hours > 0 || days > 0) uptimeStr += `${minutes} minute${minutes !== 1 ? 's' : ''}, `;
    uptimeStr += `${seconds} second${seconds !== 1 ? 's' : ''}`;

    const loadTime = new Date(pageLoadTime);

    lines.push({
      id: generateId(),
      type: 'output',
      content: '',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: '  Terminal Session Statistics',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: '  ' + '─'.repeat(30),
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: `  Session started: ${loadTime.toLocaleString()}`,
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'system',
      content: `  Uptime: ${uptimeStr}`,
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: '',
      timestamp: Date.now(),
    });

    return { lines };
  },
};

import type { Command, CommandOutput, OutputLine } from '../types/command';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * time command - displays current date and time
 */
export const timeCommand: Command = {
  name: 'time',
  description: 'Display current date and time',
  usage: 'time',
  execute: async (): Promise<CommandOutput> => {
    const now = new Date();
    const lines: OutputLine[] = [];

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];

    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    lines.push({
      id: generateId(),
      type: 'output',
      content: '',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: `  ${dayName}, ${monthName} ${date}, ${year}`,
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'system',
      content: `  ${hours}:${minutes}:${seconds}`,
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
      content: `  Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
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

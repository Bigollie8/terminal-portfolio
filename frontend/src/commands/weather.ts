import type { Command, CommandOutput, OutputLine } from '../types/command';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const weatherTypes = [
  {
    name: 'Sunny',
    temp: '72°F / 22°C',
    ascii: [
      '    \\   /    ',
      '     .-.     ',
      '  ― (   ) ―  ',
      '     `-᾿     ',
      '    /   \\    ',
    ],
  },
  {
    name: 'Cloudy',
    temp: '65°F / 18°C',
    ascii: [
      '             ',
      '     .--.    ',
      '  .-(    ).  ',
      ' (___.__)__) ',
      '             ',
    ],
  },
  {
    name: 'Rainy',
    temp: '55°F / 13°C',
    ascii: [
      '     .-.     ',
      '    (   ).   ',
      '   (___(__)  ',
      '   ‚ʻ‚ʻ‚ʻ‚ʻ  ',
      '   ‚ʻ‚ʻ‚ʻ‚ʻ  ',
    ],
  },
  {
    name: 'Coding Weather',
    temp: '69°F / 21°C',
    ascii: [
      '   _____     ',
      '  |     |    ',
      '  | > _ |    ',
      '  |_____|    ',
      '   ║   ║     ',
    ],
  },
];

/**
 * weather command - displays ASCII weather
 */
export const weatherCommand: Command = {
  name: 'weather',
  description: 'Display current weather (simulated)',
  usage: 'weather',
  execute: async (): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];
    const weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    const location = 'Terminal City, TC';

    lines.push({
      id: generateId(),
      type: 'output',
      content: '',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: `  Weather for ${location}`,
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
      content: '',
      timestamp: Date.now(),
    });

    // ASCII art
    weather.ascii.forEach((line) => {
      lines.push({
        id: generateId(),
        type: 'output',
        content: `    ${line}`,
        timestamp: Date.now(),
      });
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
      content: `  Condition: ${weather.name}`,
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'system',
      content: `  Temperature: ${weather.temp}`,
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: '  Humidity: Optimal for coding',
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

import type { Command, CommandOutput, OutputLine } from '../types/command';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const STORAGE_KEY = 'terminal-theme';

const identityDisc = `
       ╭───────────────────╮
      ╱                     ╲
     ╱   ┌───────────────┐   ╲
    │    │  IDENTITY     │    │
    │    │  DISC         │    │
    │    │               │    │
    │    │  USER: %NAME% │    │
    │    │  CLASS: %CLASS% │    │
    │    │  STATUS: %STATUS% │    │
    │    │               │    │
    │    └───────────────┘    │
     ╲                       ╱
      ╲                     ╱
       ╰───────────────────╯
`;

/**
 * identity command - displays identity disc (Grid theme easter egg)
 */
export const identityCommand: Command = {
  name: 'identity',
  description: 'Display identity disc',
  usage: 'identity',
  execute: async (): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];

    // Check if Grid theme is active
    let isGridTheme = false;
    try {
      isGridTheme = localStorage.getItem(STORAGE_KEY) === 'the-grid';
    } catch {
      // Ignore localStorage errors
    }

    if (!isGridTheme) {
      lines.push({
        id: generateId(),
        type: 'error',
        content: 'ERROR: Identity disc not accessible.',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: 'Hint: You must be on The Grid to access your disc.',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: 'Try: theme the-grid',
        timestamp: Date.now(),
      });
      return { lines };
    }

    lines.push({
      id: generateId(),
      type: 'system',
      content: '',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'system',
      content: '  ══════════════════════════════════════',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'system',
      content: '          IDENTITY DISC ACCESSED        ',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'system',
      content: '  ══════════════════════════════════════',
      timestamp: Date.now(),
    });

    const discOutput = identityDisc
      .replace('%NAME%', 'USER     ')
      .replace('%CLASS%', 'PROGRAM')
      .replace('%STATUS%', 'ACTIVE ');

    discOutput.split('\n').forEach((line) => {
      if (line.trim()) {
        lines.push({
          id: generateId(),
          type: 'system',
          content: `  ${line}`,
          timestamp: Date.now(),
        });
      }
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
      content: '  ┌─────────────────────────────────────┐',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: '  │ DISC MEMORY:                        │',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: '  │  • Light cycle certified            │',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: '  │  • Disc wars training: COMPLETE     │',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: '  │  • Sector access: ALL               │',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: '  │  • Grid cycles: ' + Math.floor(Math.random() * 9000 + 1000) + '                 │',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: '  └─────────────────────────────────────┘',
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

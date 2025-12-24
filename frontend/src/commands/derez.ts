import type { Command, CommandOutput, OutputLine, CommandContext } from '../types/command';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const STORAGE_KEY = 'terminal-theme';

const derezChars = '░▒▓█▀▄▌▐│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌';

const CANVAS_HEIGHT = 10;
const CANVAS_WIDTH = 50;

const generateDerezLine = (width: number, intensity: number): string => {
  let line = '';
  for (let i = 0; i < width; i++) {
    if (Math.random() < intensity) {
      line += derezChars[Math.floor(Math.random() * derezChars.length)];
    } else {
      line += ' ';
    }
  }
  return line;
};

/**
 * derez command - derezzing animation (Grid theme easter egg)
 */
export const derezCommand: Command = {
  name: 'derez',
  description: 'Initiate derez sequence',
  usage: 'derez',
  execute: async (_args: string[], context: CommandContext): Promise<CommandOutput> => {
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
        content: 'ERROR: Cannot derez outside The Grid.',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: 'Hint: Enter The Grid first with "theme the-grid"',
        timestamp: Date.now(),
      });
      return { lines };
    }

    lines.push({
      id: generateId(),
      type: 'error',
      content: '⚠ WARNING: DEREZ SEQUENCE INITIATED ⚠',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: '',
      timestamp: Date.now(),
    });

    // Start animation after initial output
    setTimeout(() => {
      // Create canvas for derez animation
      const canvasIds = context.createGameCanvas(CANVAS_HEIGHT);
      let frame = 0;
      const maxFrames = 30;

      const animate = () => {
        const timer = setInterval(() => {
          if (frame >= maxFrames) {
            clearInterval(timer);
            context.addOutput([
              {
                id: generateId(),
                type: 'output',
                content: '',
                timestamp: Date.now(),
              },
              {
                id: generateId(),
                type: 'system',
                content: '  ╔════════════════════════════════════╗',
                timestamp: Date.now(),
              },
              {
                id: generateId(),
                type: 'system',
                content: '  ║     DEREZ SEQUENCE COMPLETE       ║',
                timestamp: Date.now(),
              },
              {
                id: generateId(),
                type: 'system',
                content: '  ║     Program terminated safely      ║',
                timestamp: Date.now(),
              },
              {
                id: generateId(),
                type: 'system',
                content: '  ╚════════════════════════════════════╝',
                timestamp: Date.now(),
              },
              {
                id: generateId(),
                type: 'output',
                content: '',
                timestamp: Date.now(),
              },
              {
                id: generateId(),
                type: 'output',
                content: '  Just kidding. You\'re still here.',
                timestamp: Date.now(),
              },
            ]);
            return;
          }

          // Calculate intensity - starts high, fades out
          const progress = frame / maxFrames;
          const intensity = progress < 0.7
            ? 0.3 + (progress * 0.7) // Build up
            : 1.0 - ((progress - 0.7) * 3); // Fade out

          // Update canvas with glitch effect
          const frameLines: OutputLine[] = canvasIds.map((id) => ({
            id,
            type: 'error' as const,
            content: generateDerezLine(CANVAS_WIDTH, Math.max(0, intensity)),
            timestamp: Date.now(),
          }));
          context.updateLines(frameLines);
          frame++;
        }, 80);
      };

      animate();
    }, 300);

    return { lines };
  },
};

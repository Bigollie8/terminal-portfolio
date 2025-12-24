import type { Command, CommandOutput, OutputLine, CommandContext } from '../types/command';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const matrixChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';

const CANVAS_HEIGHT = 15;
const CANVAS_WIDTH = 60;

interface Drop {
  x: number;
  y: number;
  speed: number;
  length: number;
}

/**
 * matrix command - displays falling matrix characters with proper animation
 */
export const matrixCommand: Command = {
  name: 'matrix',
  description: 'Enter the Matrix',
  usage: 'matrix',
  execute: async (_args: string[], context: CommandContext): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];
    const duration = 5000;
    const interval = 80;

    lines.push({
      id: generateId(),
      type: 'system',
      content: 'Wake up, Neo...',
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
      content: '  Press any key to exit',
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
      // Create the canvas
      const canvasIds = context.createGameCanvas(CANVAS_HEIGHT);

      // Initialize the character grid and drops
      const grid: string[][] = [];
      for (let y = 0; y < CANVAS_HEIGHT; y++) {
        grid[y] = [];
        for (let x = 0; x < CANVAS_WIDTH; x++) {
          grid[y][x] = ' ';
        }
      }

      // Create drops (falling streams)
      const drops: Drop[] = [];
      for (let x = 0; x < CANVAS_WIDTH; x += 2) {
        if (Math.random() > 0.5) {
          drops.push({
            x,
            y: Math.floor(Math.random() * -CANVAS_HEIGHT),
            speed: 1 + Math.floor(Math.random() * 2),
            length: 3 + Math.floor(Math.random() * 8),
          });
        }
      }

      let running = true;
      const startTime = Date.now();

      const update = () => {
        // Clear grid
        for (let y = 0; y < CANVAS_HEIGHT; y++) {
          for (let x = 0; x < CANVAS_WIDTH; x++) {
            grid[y][x] = ' ';
          }
        }

        // Update and render drops
        for (const drop of drops) {
          // Draw the drop trail
          for (let i = 0; i < drop.length; i++) {
            const y = drop.y - i;
            if (y >= 0 && y < CANVAS_HEIGHT && drop.x < CANVAS_WIDTH) {
              grid[y][drop.x] = matrixChars[Math.floor(Math.random() * matrixChars.length)];
            }
          }

          // Move drop down
          drop.y += drop.speed;

          // Reset drop if it goes off screen
          if (drop.y - drop.length > CANVAS_HEIGHT) {
            drop.y = Math.floor(Math.random() * -10);
            drop.speed = 1 + Math.floor(Math.random() * 2);
            drop.length = 3 + Math.floor(Math.random() * 8);
          }
        }

        // Occasionally add new drops
        if (Math.random() > 0.9 && drops.length < CANVAS_WIDTH / 2) {
          const x = Math.floor(Math.random() * CANVAS_WIDTH);
          drops.push({
            x,
            y: 0,
            speed: 1 + Math.floor(Math.random() * 2),
            length: 3 + Math.floor(Math.random() * 8),
          });
        }
      };

      const render = () => {
        const updatedLines: OutputLine[] = canvasIds.map((id, y) => ({
          id,
          type: 'output' as const,
          content: '  ' + grid[y].join(''),
          timestamp: Date.now(),
        }));
        context.updateLines(updatedLines);
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        running = false;
        e.preventDefault();
      };

      window.addEventListener('keydown', handleKeyDown);

      const animationLoop = setInterval(() => {
        if (!running || Date.now() - startTime > duration) {
          clearInterval(animationLoop);
          window.removeEventListener('keydown', handleKeyDown);
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
              content: 'The Matrix has you...',
              timestamp: Date.now(),
            },
          ]);
          return;
        }

        update();
        render();
      }, interval);
    }, 500);

    return { lines };
  },
};

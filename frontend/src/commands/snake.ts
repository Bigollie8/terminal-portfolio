import type { Command, CommandOutput, OutputLine, CommandContext } from '../types/command';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Grid dimensions (in game cells, not characters)
const WIDTH = 20;
const HEIGHT = 12;

interface Point {
  x: number;
  y: number;
}

interface GameState {
  snake: Point[];
  food: Point;
  direction: 'up' | 'down' | 'left' | 'right';
  nextDirection: 'up' | 'down' | 'left' | 'right';
  gameOver: boolean;
  score: number;
}

const createFood = (snake: Point[]): Point => {
  let food: Point;
  do {
    food = {
      x: Math.floor(Math.random() * (WIDTH - 2)) + 1,
      y: Math.floor(Math.random() * (HEIGHT - 2)) + 1,
    };
  } while (snake.some((s) => s.x === food.x && s.y === food.y));
  return food;
};

const renderGame = (state: GameState): string[] => {
  // Use 2 characters per cell horizontally to compensate for terminal aspect ratio
  const grid: string[][] = [];

  // Create empty grid
  for (let y = 0; y < HEIGHT; y++) {
    grid[y] = [];
    for (let x = 0; x < WIDTH; x++) {
      if (y === 0 || y === HEIGHT - 1) {
        grid[y][x] = '══'; // Double horizontal border
      } else if (x === 0 || x === WIDTH - 1) {
        grid[y][x] = '║ '; // Vertical border with space
      } else {
        grid[y][x] = '  '; // Empty cell (2 spaces)
      }
    }
  }

  // Corners (2 chars each)
  grid[0][0] = '╔═';
  grid[0][WIDTH - 1] = '═╗';
  grid[HEIGHT - 1][0] = '╚═';
  grid[HEIGHT - 1][WIDTH - 1] = '═╝';

  // Place food
  grid[state.food.y][state.food.x] = '◉ ';

  // Place snake
  state.snake.forEach((segment, index) => {
    if (segment.x > 0 && segment.x < WIDTH - 1 && segment.y > 0 && segment.y < HEIGHT - 1) {
      grid[segment.y][segment.x] = index === 0 ? '██' : '▓▓';
    }
  });

  return grid.map((row) => '  ' + row.join(''));
};

/**
 * snake command - play snake in the terminal
 */
export const snakeCommand: Command = {
  name: 'snake',
  description: 'Play snake game',
  usage: 'snake',
  execute: async (_args: string[], context: CommandContext): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];

    // Header
    lines.push({
      id: generateId(),
      type: 'system',
      content: '  ════════════════════════════════════════',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'system',
      content: '              SNAKE GAME',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'system',
      content: '  ════════════════════════════════════════',
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
      content: '  Controls: W/A/S/D or Arrow Keys',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: '  Press Q to quit',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: '',
      timestamp: Date.now(),
    });

    // Initialize game state
    const initialSnake: Point[] = [
      { x: 10, y: 6 },
      { x: 9, y: 6 },
      { x: 8, y: 6 },
    ];

    const state: GameState = {
      snake: initialSnake,
      food: createFood(initialSnake),
      direction: 'right',
      nextDirection: 'right',
      gameOver: false,
      score: 0,
    };

    // Start game after initial output is rendered
    setTimeout(() => {
      // Create game canvas - HEIGHT lines for game + 1 for score
      const canvasLineCount = HEIGHT + 1;
      const canvasIds = context.createGameCanvas(canvasLineCount);

      const updateGame = () => {
        if (state.gameOver) return;

        // Apply direction change
        state.direction = state.nextDirection;

        // Calculate new head position
        const head = { ...state.snake[0] };
        switch (state.direction) {
          case 'up':
            head.y--;
            break;
          case 'down':
            head.y++;
            break;
          case 'left':
            head.x--;
            break;
          case 'right':
            head.x++;
            break;
        }

        // Check wall collision
        if (head.x <= 0 || head.x >= WIDTH - 1 || head.y <= 0 || head.y >= HEIGHT - 1) {
          state.gameOver = true;
          return;
        }

        // Check self collision
        if (state.snake.some((s) => s.x === head.x && s.y === head.y)) {
          state.gameOver = true;
          return;
        }

        // Move snake
        state.snake.unshift(head);

        // Check food collision
        if (head.x === state.food.x && head.y === state.food.y) {
          state.score += 10;
          state.food = createFood(state.snake);
        } else {
          state.snake.pop();
        }
      };

      const render = () => {
        const gameLines = renderGame(state);
        gameLines.push(`  Score: ${state.score}`);

        // Update the canvas lines in place
        const updatedLines: OutputLine[] = canvasIds.map((id, index) => ({
          id,
          type: 'output' as const,
          content: gameLines[index] || '',
          timestamp: Date.now(),
        }));

        context.updateLines(updatedLines);
      };

      // Handle keyboard input
      const handleKeyDown = (e: KeyboardEvent) => {
        if (state.gameOver) return;

        switch (e.key.toLowerCase()) {
          case 'w':
          case 'arrowup':
            if (state.direction !== 'down') state.nextDirection = 'up';
            e.preventDefault();
            break;
          case 's':
          case 'arrowdown':
            if (state.direction !== 'up') state.nextDirection = 'down';
            e.preventDefault();
            break;
          case 'a':
          case 'arrowleft':
            if (state.direction !== 'right') state.nextDirection = 'left';
            e.preventDefault();
            break;
          case 'd':
          case 'arrowright':
            if (state.direction !== 'left') state.nextDirection = 'right';
            e.preventDefault();
            break;
          case 'q':
            state.gameOver = true;
            e.preventDefault();
            break;
        }
      };

      // Start game
      window.addEventListener('keydown', handleKeyDown);
      render();

      const gameLoop = setInterval(() => {
        updateGame();
        render();

        if (state.gameOver) {
          clearInterval(gameLoop);
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
              content: '  ════════════════════════════════════',
              timestamp: Date.now(),
            },
            {
              id: generateId(),
              type: 'system',
              content: '            GAME OVER!',
              timestamp: Date.now(),
            },
            {
              id: generateId(),
              type: 'system',
              content: `          Final Score: ${state.score}`,
              timestamp: Date.now(),
            },
            {
              id: generateId(),
              type: 'system',
              content: '  ════════════════════════════════════',
              timestamp: Date.now(),
            },
          ]);
        }
      }, 120);
    }, 100);

    return { lines };
  },
};

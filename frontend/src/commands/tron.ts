import type { Command, CommandOutput, OutputLine, CommandContext } from '../types/command';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const STORAGE_KEY = 'terminal-theme';

const GRID_WIDTH = 50;
const GRID_HEIGHT = 16;

// Trail point with direction info
interface TrailPoint {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

// Player config
const players = [
  { symbol: '●', name: 'CYAN', color: 'cyan' },
  { symbol: '●', name: 'ORANGE', color: 'orange' },
  { symbol: '●', name: 'GREEN', color: 'green' },
  { symbol: '●', name: 'PURPLE', color: 'purple' },
];

interface Cycle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  trail: TrailPoint[];
  alive: boolean;
  symbol: string;
  name: string;
  color: string;
}

/**
 * Get the appropriate box-drawing character based on entry and exit directions
 */
const getTrailChar = (
  prevDx: number | null,
  prevDy: number | null,
  currDx: number,
  currDy: number,
  nextDx: number | null,
  nextDy: number | null
): string => {
  // Determine connections: where does the trail come from and go to?
  // From direction (opposite of how we entered)
  const fromLeft = prevDx === 1;
  const fromRight = prevDx === -1;
  const fromTop = prevDy === 1;
  const fromBottom = prevDy === -1;

  // To direction (where we're going)
  const toLeft = nextDx === -1 || (nextDx === null && currDx === -1);
  const toRight = nextDx === 1 || (nextDx === null && currDx === 1);
  const toTop = nextDy === -1 || (nextDy === null && currDy === -1);
  const toBottom = nextDy === 1 || (nextDy === null && currDy === 1);

  const horizontal = (fromLeft || fromRight || toLeft || toRight);
  const vertical = (fromTop || fromBottom || toTop || toBottom);

  // If it's just horizontal or vertical, use straight lines
  if (horizontal && !vertical) return '─';
  if (vertical && !horizontal) return '│';

  // Corner pieces
  if ((fromLeft || toLeft) && (fromTop || toTop)) return '┘';
  if ((fromLeft || toLeft) && (fromBottom || toBottom)) return '┐';
  if ((fromRight || toRight) && (fromTop || toTop)) return '└';
  if ((fromRight || toRight) && (fromBottom || toBottom)) return '┌';

  // Fallback
  return '┼';
};

const tronQuotes = [
  '"The Grid. A digital frontier."',
  '"I fight for the Users."',
  '"It\'s all in the wrist."',
  '"End of Line."',
  '"Greetings, Program!"',
  '"This is the game now."',
];

const impossibleQuotes = [
  '"I am the ultimate program."',
  '"Perfection is not a goal. It is my nature."',
  '"You cannot defeat what never errs."',
  '"I have calculated every possibility."',
  '"The Grid bends to my will."',
  '"Survival is not a challenge. It is a certainty."',
];

/**
 * tron command - 4-player light cycle battle (Grid theme easter egg)
 * Use -impossible flag for near-perfect AI that survives as long as possible
 */
export const tronCommand: Command = {
  name: 'tron',
  description: 'Light cycle battle',
  usage: 'tron [-impossible]',
  execute: async (args: string[], context: CommandContext): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];
    const impossibleMode = args.includes('-impossible') || args.includes('--impossible');

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
        content: 'ERROR: Grid connection not established.',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: 'Hint: Access the Grid first with "theme the-grid"',
        timestamp: Date.now(),
      });
      return { lines };
    }

    lines.push({
      id: generateId(),
      type: 'system',
      content: '  ╔══════════════════════════════════════════════════╗',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'system',
      content: impossibleMode
        ? '  ║     ⚠ IMPOSSIBLE MODE - PERFECT AI ENABLED ⚠     ║'
        : '  ║          LIGHT CYCLE BATTLE ARENA               ║',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'system',
      content: '  ╚══════════════════════════════════════════════════╝',
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
      // Create canvas for the arena (GRID_HEIGHT) + status line (1)
      const canvasIds = context.createGameCanvas(GRID_HEIGHT + 1);

      // Initialize 4 cycles in corners
      const cycles: Cycle[] = [
        { ...players[0], x: 5, y: 3, dx: 1, dy: 0, trail: [], alive: true },
        { ...players[1], x: GRID_WIDTH - 6, y: 3, dx: -1, dy: 0, trail: [], alive: true },
        { ...players[2], x: 5, y: GRID_HEIGHT - 4, dx: 1, dy: 0, trail: [], alive: true },
        { ...players[3], x: GRID_WIDTH - 6, y: GRID_HEIGHT - 4, dx: -1, dy: 0, trail: [], alive: true },
      ];

      // Generate unique AI personalities for this game (impossible mode only)
      // Each AI gets slightly different weight preferences, creating varied but still optimal play
      const aiPersonalities = cycles.map(() => ({
        territoryWeight: 40 + Math.random() * 20,      // 40-60 (base: 50)
        survivalWeight: 80 + Math.random() * 40,       // 80-120 (base: 100)
        escapeRouteWeight: 20 + Math.random() * 20,    // 20-40 (base: 30)
        openSpaceWeight: 15 + Math.random() * 10,      // 15-25 (base: 20)
        lookAheadWeight: 10 + Math.random() * 10,      // 10-20 (base: 15)
        centerPreference: 20 + Math.random() * 20,     // 20-40 (base: 30)
        mobilityWeight: 30 + Math.random() * 20,       // 30-50 (base: 40)
        wallHugPreference: Math.random() < 0.5,        // 50% prefer wall hugging
        aggressiveness: Math.random() * 0.3,           // 0-0.3 willingness to take risks
      }));

      const render = () => {
        // Create empty grid with color info
        const grid: Array<Array<{ char: string; color?: string }>> = [];
        for (let y = 0; y < GRID_HEIGHT; y++) {
          grid[y] = [];
          for (let x = 0; x < GRID_WIDTH; x++) {
            if (y === 0) {
              grid[y][x] = { char: x === 0 ? '╔' : x === GRID_WIDTH - 1 ? '╗' : '═' };
            } else if (y === GRID_HEIGHT - 1) {
              grid[y][x] = { char: x === 0 ? '╚' : x === GRID_WIDTH - 1 ? '╝' : '═' };
            } else if (x === 0 || x === GRID_WIDTH - 1) {
              grid[y][x] = { char: '║' };
            } else {
              grid[y][x] = { char: ' ' };
            }
          }
        }

        // Draw trails with proper connections
        cycles.forEach((cycle) => {
          const trail = cycle.trail;
          for (let i = 0; i < trail.length; i++) {
            const pos = trail[i];
            if (pos.x > 0 && pos.x < GRID_WIDTH - 1 && pos.y > 0 && pos.y < GRID_HEIGHT - 1) {
              const prev = i > 0 ? trail[i - 1] : null;
              const next = i < trail.length - 1 ? trail[i + 1] : null;

              const char = getTrailChar(
                prev ? pos.x - prev.x : null,
                prev ? pos.y - prev.y : null,
                pos.dx,
                pos.dy,
                next ? next.x - pos.x : null,
                next ? next.y - pos.y : null
              );

              grid[pos.y][pos.x] = { char, color: cycle.color };
            }
          }
        });

        // Draw cycle heads
        cycles.forEach((cycle) => {
          if (cycle.alive && cycle.x > 0 && cycle.x < GRID_WIDTH - 1 && cycle.y > 0 && cycle.y < GRID_HEIGHT - 1) {
            grid[cycle.y][cycle.x] = { char: cycle.symbol, color: cycle.color };
          }
        });

        // Build output lines with color markers
        const outputLines = grid.map((row) => {
          let line = '  ';
          let currentColor: string | undefined = undefined;
          let coloredSegment = '';

          for (const cell of row) {
            if (cell.color !== currentColor) {
              // Flush current segment
              if (currentColor && coloredSegment) {
                line += `{${currentColor}}${coloredSegment}{/${currentColor}}`;
              } else {
                line += coloredSegment;
              }
              coloredSegment = cell.char;
              currentColor = cell.color;
            } else {
              coloredSegment += cell.char;
            }
          }

          // Flush remaining
          if (currentColor && coloredSegment) {
            line += `{${currentColor}}${coloredSegment}{/${currentColor}}`;
          } else {
            line += coloredSegment;
          }

          return line;
        });

        // Status line with colors
        const aliveCount = cycles.filter((c) => c.alive).length;
        const status = cycles.map((c) => {
          const indicator = c.alive ? '◉' : '×';
          return `{${c.color}}${c.name}:${indicator}{/${c.color}}`;
        }).join(' ');
        outputLines.push(`  ${status}`);

        const updatedLines: OutputLine[] = canvasIds.map((id, i) => ({
          id,
          type: 'output' as const,
          content: outputLines[i] || '',
          timestamp: Date.now(),
        }));
        context.updateLines(updatedLines);

        return aliveCount;
      };

      /**
       * Check if a position is blocked by wall or trail
       */
      const isBlocked = (x: number, y: number): boolean => {
        // Wall check
        if (x <= 0 || x >= GRID_WIDTH - 1 || y <= 0 || y >= GRID_HEIGHT - 1) {
          return true;
        }
        // Trail and head check
        for (const c of cycles) {
          if (c.trail.some((t) => t.x === x && t.y === y)) {
            return true;
          }
          if (c.alive && c.x === x && c.y === y) {
            return true;
          }
        }
        return false;
      };

      /**
       * Calculate open space available from a position using flood fill
       * Returns the number of reachable cells (limited to maxDepth for performance)
       */
      const calculateOpenSpace = (startX: number, startY: number, maxDepth: number = 50): number => {
        const visited = new Set<string>();
        const queue: Array<{ x: number; y: number; depth: number }> = [{ x: startX, y: startY, depth: 0 }];
        let count = 0;

        while (queue.length > 0 && count < maxDepth) {
          const current = queue.shift()!;
          const key = `${current.x},${current.y}`;

          if (visited.has(key)) continue;
          if (isBlocked(current.x, current.y)) continue;
          if (current.depth > maxDepth) continue;

          visited.add(key);
          count++;

          // Add neighbors
          const neighbors = [
            { x: current.x + 1, y: current.y },
            { x: current.x - 1, y: current.y },
            { x: current.x, y: current.y + 1 },
            { x: current.x, y: current.y - 1 },
          ];

          for (const n of neighbors) {
            const nKey = `${n.x},${n.y}`;
            if (!visited.has(nKey)) {
              queue.push({ x: n.x, y: n.y, depth: current.depth + 1 });
            }
          }
        }

        return count;
      };

      /**
       * Look ahead to see how many moves are available in a direction
       */
      const lookAhead = (x: number, y: number, dx: number, dy: number, depth: number): number => {
        let count = 0;
        let cx = x;
        let cy = y;

        for (let i = 0; i < depth; i++) {
          cx += dx;
          cy += dy;
          if (isBlocked(cx, cy)) break;
          count++;
        }

        return count;
      };

      /**
       * Calculate distance to nearest enemy
       */
      const distanceToNearestEnemy = (x: number, y: number, currentCycle: Cycle): number => {
        let minDist = Infinity;
        for (const c of cycles) {
          if (c !== currentCycle && c.alive) {
            const dist = Math.abs(c.x - x) + Math.abs(c.y - y);
            minDist = Math.min(minDist, dist);
          }
        }
        return minDist;
      };

      /**
       * IMPOSSIBLE MODE: Calculate Voronoi territory - cells reachable before any enemy
       * Returns count of cells this position "owns" (can reach first)
       */
      const calculateVoronoiTerritory = (startX: number, startY: number, currentCycle: Cycle): number => {
        // BFS from all alive cycles simultaneously to determine territory
        const ownership = new Map<string, { owner: Cycle; dist: number }>();
        const queues: Map<Cycle, Array<{ x: number; y: number; dist: number }>> = new Map();

        // Initialize queues for all alive cycles
        cycles.forEach((c) => {
          if (c.alive) {
            const startPos = c === currentCycle ? { x: startX, y: startY } : { x: c.x, y: c.y };
            queues.set(c, [{ ...startPos, dist: 0 }]);
          }
        });

        // Simultaneous BFS
        let hasProgress = true;
        while (hasProgress) {
          hasProgress = false;
          for (const [cycle, queue] of queues) {
            if (queue.length === 0) continue;

            const nextQueue: Array<{ x: number; y: number; dist: number }> = [];
            for (const pos of queue) {
              const key = `${pos.x},${pos.y}`;

              // Skip if blocked or already owned by someone closer
              if (isBlocked(pos.x, pos.y)) continue;
              const existing = ownership.get(key);
              if (existing && existing.dist <= pos.dist) continue;

              ownership.set(key, { owner: cycle, dist: pos.dist });
              hasProgress = true;

              // Add neighbors
              const neighbors = [
                { x: pos.x + 1, y: pos.y },
                { x: pos.x - 1, y: pos.y },
                { x: pos.x, y: pos.y + 1 },
                { x: pos.x, y: pos.y - 1 },
              ];

              for (const n of neighbors) {
                if (!isBlocked(n.x, n.y)) {
                  nextQueue.push({ ...n, dist: pos.dist + 1 });
                }
              }
            }
            queues.set(cycle, nextQueue);
          }
        }

        // Count cells owned by current cycle
        let territory = 0;
        for (const [, value] of ownership) {
          if (value.owner === currentCycle) territory++;
        }
        return territory;
      };

      /**
       * IMPOSSIBLE MODE: Detect if a move leads to a dead-end trap
       * Uses advanced chamber analysis
       */
      const detectTrap = (x: number, y: number, depth: number = 15): { isTrap: boolean; escapeRoutes: number } => {
        const visited = new Set<string>();
        const queue: Array<{ x: number; y: number; d: number }> = [{ x, y, d: 0 }];
        let escapeRoutes = 0;
        let totalCells = 0;

        while (queue.length > 0) {
          const pos = queue.shift()!;
          const key = `${pos.x},${pos.y}`;

          if (visited.has(key) || isBlocked(pos.x, pos.y) || pos.d > depth) continue;
          visited.add(key);
          totalCells++;

          // Count cells at the edge of our search (potential escape routes)
          if (pos.d === depth) {
            escapeRoutes++;
          }

          const neighbors = [
            { x: pos.x + 1, y: pos.y },
            { x: pos.x - 1, y: pos.y },
            { x: pos.x, y: pos.y + 1 },
            { x: pos.x, y: pos.y - 1 },
          ];

          for (const n of neighbors) {
            if (!visited.has(`${n.x},${n.y}`)) {
              queue.push({ ...n, d: pos.d + 1 });
            }
          }
        }

        // It's a trap if we can't reach the search depth (blocked in)
        return { isTrap: escapeRoutes === 0 && totalCells < depth * 2, escapeRoutes };
      };

      /**
       * IMPOSSIBLE MODE: Minimax lookahead to find optimal survival path
       */
      const minimaxSurvival = (
        x: number, y: number,
        dx: number, dy: number,
        depth: number,
        visited: Set<string>
      ): number => {
        if (depth === 0) return 1;

        const key = `${x},${y}`;
        if (visited.has(key) || isBlocked(x, y)) return 0;

        const newVisited = new Set(visited);
        newVisited.add(key);

        // Try all possible moves
        const moves = [
          { dx, dy },           // Straight
          { dx: -dy, dy: dx },  // Left
          { dx: dy, dy: -dx },  // Right
        ];

        let maxSurvival = 0;
        for (const move of moves) {
          const nx = x + move.dx;
          const ny = y + move.dy;
          const survival = minimaxSurvival(nx, ny, move.dx, move.dy, depth - 1, newVisited);
          maxSurvival = Math.max(maxSurvival, 1 + survival);
        }

        return maxSurvival;
      };

      /**
       * IMPOSSIBLE MODE: Wall-hugging algorithm for maximum survival in tight spaces
       */
      const getWallHugScore = (x: number, y: number, _dx: number, _dy: number): number => {
        let wallCount = 0;
        const checkPositions = [
          { x: x + 1, y },
          { x: x - 1, y },
          { x, y: y + 1 },
          { x, y: y - 1 },
        ];

        for (const pos of checkPositions) {
          if (isBlocked(pos.x, pos.y)) wallCount++;
        }

        // Prefer having exactly 1 wall adjacent (efficient path along edges)
        if (wallCount === 1) return 10;
        if (wallCount === 2) return 5;
        return 0;
      };

      const update = () => {
        cycles.forEach((cycle, cycleIndex) => {
          if (!cycle.alive) return;

          // Get this cycle's personality for varied but optimal play
          const personality = aiPersonalities[cycleIndex];

          // Add current position to trail with direction
          cycle.trail.push({ x: cycle.x, y: cycle.y, dx: cycle.dx, dy: cycle.dy });

          // Possible moves
          const possibleMoves = [
            { dx: cycle.dx, dy: cycle.dy, name: 'straight' },
            { dx: -cycle.dy, dy: cycle.dx, name: 'left' },
            { dx: cycle.dy, dy: -cycle.dx, name: 'right' },
          ];

          // Filter valid moves and score them
          const scoredMoves = possibleMoves
            .map((move) => {
              const nx = cycle.x + move.dx;
              const ny = cycle.y + move.dy;

              if (isBlocked(nx, ny)) {
                return { ...move, score: -Infinity, valid: false };
              }

              let score = 0;

              if (impossibleMode) {
                // ═══════════════════════════════════════════════════════
                // IMPOSSIBLE MODE: Near-perfect AI with unique personality
                // Each AI has slightly different priorities for variety
                // ═══════════════════════════════════════════════════════

                // Factor 1: Voronoi territory (weighted by personality)
                const territory = calculateVoronoiTerritory(nx, ny, cycle);
                score += territory * personality.territoryWeight;

                // Factor 2: Minimax survival lookahead (weighted by personality)
                const survivalDepth = minimaxSurvival(nx, ny, move.dx, move.dy, 8, new Set([`${cycle.x},${cycle.y}`]));
                score += survivalDepth * personality.survivalWeight;

                // Factor 3: Trap detection (CRITICAL - always heavily penalized)
                const trapAnalysis = detectTrap(nx, ny, 20);
                if (trapAnalysis.isTrap) {
                  score -= 10000; // Massive penalty for traps (never varies)
                }
                score += trapAnalysis.escapeRoutes * personality.escapeRouteWeight;

                // Factor 4: Deep flood fill analysis (weighted by personality)
                const openSpace = calculateOpenSpace(nx, ny, 100);
                score += openSpace * personality.openSpaceWeight;

                // Factor 5: Extended look-ahead (weighted by personality)
                const lookAheadDist = lookAhead(nx, ny, move.dx, move.dy, 20);
                score += lookAheadDist * personality.lookAheadWeight;

                // Factor 6: Wall-hugging (optional based on personality)
                if (personality.wallHugPreference) {
                  score += getWallHugScore(nx, ny, move.dx, move.dy) * 1.5;
                } else {
                  score += getWallHugScore(nx, ny, move.dx, move.dy) * 0.5;
                }

                // Factor 7: Center preference (weighted by personality)
                const centerDistX = Math.abs(nx - GRID_WIDTH / 2);
                const centerDistY = Math.abs(ny - GRID_HEIGHT / 2);
                score += (personality.centerPreference - centerDistX - centerDistY);

                // Factor 8: Future mobility (weighted by personality)
                let futureMoves = 0;
                if (!isBlocked(nx + move.dx, ny + move.dy)) futureMoves++;
                if (!isBlocked(nx - move.dy, ny + move.dx)) futureMoves++;
                if (!isBlocked(nx + move.dy, ny - move.dx)) futureMoves++;
                score += futureMoves * personality.mobilityWeight;

                // Factor 9: Slight straight preference for efficiency
                if (move.name === 'straight') score += 5;

              } else {
                // ═══════════════════════════════════════════════════════
                // NORMAL MODE: Standard AI
                // ═══════════════════════════════════════════════════════

                const openSpace = calculateOpenSpace(nx, ny, 30);
                score += openSpace * 10;

                const lookAheadDist = lookAhead(nx, ny, move.dx, move.dy, 10);
                score += lookAheadDist * 5;

                if (move.name === 'straight') score += 3;

                const centerDistX = Math.abs(nx - GRID_WIDTH / 2);
                const centerDistY = Math.abs(ny - GRID_HEIGHT / 2);
                score += 20 - (centerDistX + centerDistY) / 2;

                const enemyDist = distanceToNearestEnemy(nx, ny, cycle);
                if (enemyDist < 5) {
                  score -= (5 - enemyDist) * 2;
                }

                let futureMoves = 0;
                if (!isBlocked(nx + move.dx, ny + move.dy)) futureMoves++;
                if (!isBlocked(nx - move.dy, ny + move.dx)) futureMoves++;
                if (!isBlocked(nx + move.dy, ny - move.dx)) futureMoves++;
                if (futureMoves <= 1) score -= 20;
              }

              return { ...move, score, valid: true };
            })
            .filter((m) => m.valid);

          if (scoredMoves.length > 0) {
            scoredMoves.sort((a, b) => b.score - a.score);

            let selectedMove = scoredMoves[0];

            if (impossibleMode) {
              // IMPOSSIBLE MODE: Pick randomly among top-tier moves
              // This creates variety while still playing optimally
              const bestScore = scoredMoves[0].score;
              const threshold = Math.abs(bestScore) * 0.08; // Within 8% of best
              const topTierMoves = scoredMoves.filter(m => bestScore - m.score <= threshold);

              // Use personality's aggressiveness to sometimes pick riskier moves
              if (topTierMoves.length > 1 && Math.random() < personality.aggressiveness) {
                // Pick randomly from top tier (not always the absolute best)
                selectedMove = topTierMoves[Math.floor(Math.random() * topTierMoves.length)];
              } else {
                // Usually pick randomly between truly equivalent top moves
                const veryTopMoves = scoredMoves.filter(m => bestScore - m.score <= threshold * 0.3);
                selectedMove = veryTopMoves[Math.floor(Math.random() * veryTopMoves.length)];
              }
            } else {
              // NORMAL MODE: slight randomness for variety
              if (scoredMoves.length > 1 && Math.random() < 0.15) {
                if (scoredMoves[0].score - scoredMoves[1].score < 20) {
                  selectedMove = scoredMoves[1];
                }
              }
            }

            cycle.dx = selectedMove.dx;
            cycle.dy = selectedMove.dy;
            cycle.x += cycle.dx;
            cycle.y += cycle.dy;
          } else {
            cycle.alive = false;
          }
        });
      };

      // Initial render
      render();

      let frameCount = 0;
      const maxFrames = impossibleMode ? 500 : 200; // Extended for impossible mode

      const gameLoop = setInterval(() => {
        update();
        const aliveCount = render();
        frameCount++;

        // End game when one or zero players left, or max frames reached
        if (aliveCount <= 1 || frameCount >= maxFrames) {
          clearInterval(gameLoop);

          const winner = cycles.find((c) => c.alive);
          const quotes = impossibleMode ? impossibleQuotes : tronQuotes;
          const quote = quotes[Math.floor(Math.random() * quotes.length)];

          setTimeout(() => {
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
                content: winner
                  ? `  ★ {${winner.color}}${winner.name} WINS!{/${winner.color}} ★`
                  : '  ★ DRAW - ALL DEREZZED! ★',
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
                type: 'system',
                content: `  ${quote}`,
                timestamp: Date.now(),
              },
              {
                id: generateId(),
                type: 'output',
                content: '',
                timestamp: Date.now(),
              },
            ]);
          }, 500);
        }
      }, 100);
    }, 300);

    return { lines };
  },
};

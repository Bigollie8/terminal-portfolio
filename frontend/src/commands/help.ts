import type { Command, CommandOutput, OutputLine } from '../types/command';

/**
 * Generate unique ID for output lines
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create an output line
 */
const output = (content: string): OutputLine => ({
  id: generateId(),
  type: 'output',
  content,
  timestamp: Date.now(),
});

/**
 * Command categories with their commands
 */
const commandCategories: Array<{
  category: string;
  commands: Array<{ name: string; description: string }>;
}> = [
  {
    category: 'Portfolio',
    commands: [
      { name: 'whoami', description: 'About me' },
      { name: 'ls', description: 'List projects' },
      { name: 'cat', description: 'View project details' },
      { name: 'cd', description: 'Open project URL' },
      { name: 'contact', description: 'Contact info' },
    ],
  },
  {
    category: 'Social',
    commands: [
      { name: 'register', description: 'Create account' },
      { name: 'login', description: 'Log in' },
      { name: 'logout', description: 'Log out' },
      { name: 'finger', description: 'View profiles' },
      { name: 'who', description: 'Online users' },
      { name: 'mail', description: 'Private messages' },
      { name: 'wall', description: 'Public board' },
    ],
  },
  {
    category: 'Infrastructure',
    commands: [
      { name: 'aws', description: 'AWS resources' },
      { name: 'status', description: 'Service status' },
      { name: 'portal', description: 'Other apps' },
      { name: 'traceroute', description: 'Network trace' },
    ],
  },
  {
    category: 'Terminal',
    commands: [
      { name: 'help', description: 'Show help' },
      { name: 'clear', description: 'Clear screen' },
      { name: 'restart', description: 'Reload terminal' },
      { name: 'history', description: 'Command history' },
      { name: 'theme', description: 'Change theme' },
      { name: 'echo', description: 'Print text' },
    ],
  },
];

/**
 * Flat list of all commands for lookup
 */
const allCommands = commandCategories.flatMap((cat) => cat.commands);

const STORAGE_KEY = 'terminal-theme';

/**
 * Check if the Grid theme is active
 */
const isGridThemeActive = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'the-grid';
  } catch {
    return false;
  }
};

/**
 * Secret commands - hidden from regular help
 */
const secretCommands: Array<{ name: string; description: string; category: string }> = [
  // Fun commands
  { name: 'matrix', description: 'Enter the Matrix', category: 'Fun' },
  { name: 'hack', description: 'Hack the mainframe', category: 'Fun' },
  { name: 'sudo', description: 'Execute with super powers', category: 'Fun' },
  { name: 'rm', description: 'Remove files (try rm -rf /)', category: 'Fun' },
  // Games
  { name: 'snake', description: 'Play Snake game', category: 'Games' },
  { name: 'typingtest', description: 'Test your typing speed', category: 'Games' },
  // Utilities
  { name: 'time', description: 'Show current time', category: 'Utilities' },
  { name: 'uptime', description: 'Show session uptime', category: 'Utilities' },
  { name: 'weather', description: 'Show weather info', category: 'Utilities' },
  { name: 'calc', description: 'Calculator', category: 'Utilities' },
  { name: 'tree', description: 'Show directory tree', category: 'Utilities' },
];

/**
 * Tron-exclusive commands - only visible when Grid theme is active
 */
const tronCommands: Array<{ name: string; description: string; category: string }> = [
  { name: 'tron', description: 'Light cycle battle', category: 'The Grid' },
  { name: 'derez', description: 'Initiate derez sequence', category: 'The Grid' },
  { name: 'identity', description: 'Display identity disc', category: 'The Grid' },
];

/**
 * help command - displays available commands
 */
export const helpCommand: Command = {
  name: 'help',
  description: 'Show available commands',
  usage: 'help [command]',
  execute: async (args: string[]): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];

    // Check for -secret flag
    if (args.length > 0 && args[0].toLowerCase() === '-secret') {
      // Combine secret commands with tron commands if theme is active
      const isGridActive = isGridThemeActive();
      const allSecretCommands = isGridActive
        ? [...secretCommands, ...tronCommands]
        : secretCommands;

      lines.push(output(''));
      lines.push(output('  🤫 Secret Commands:'));
      lines.push(output('  ' + '='.repeat(40)));
      lines.push(output(''));

      // Group by category
      const categories = [...new Set(allSecretCommands.map((c) => c.category))];
      const maxLen = Math.max(...allSecretCommands.map((c) => c.name.length));

      for (const category of categories) {
        lines.push(output(`  [${category}]`));
        const cmds = allSecretCommands.filter((c) => c.category === category);
        for (const cmd of cmds) {
          const padding = ' '.repeat(maxLen - cmd.name.length);
          lines.push(output(`    ${cmd.name}${padding}  - ${cmd.description}`));
        }
        lines.push(output(''));
      }

      if (!isGridActive) {
        lines.push(output('  💡 Hint: More commands unlock with certain themes...'));
        lines.push(output(''));
      }

      lines.push(output('  Shh... keep these secret! 🤐'));
      lines.push(output(''));
      return { lines };
    }

    if (args.length > 0) {
      // Show help for specific command
      const cmdName = args[0].toLowerCase();
      const cmdInfo = allCommands.find((c) => c.name === cmdName);
      const secretCmdInfo = secretCommands.find((c) => c.name === cmdName);
      const tronCmdInfo = tronCommands.find((c) => c.name === cmdName);

      if (cmdInfo || secretCmdInfo || tronCmdInfo) {
        const info = cmdInfo || secretCmdInfo || tronCmdInfo!;
        lines.push(output(''));
        lines.push(output(`  ${info.name} - ${info.description}`));
        lines.push(output(''));

        // Add specific usage examples
        switch (cmdName) {
          case 'ls':
            lines.push(output('  Usage: ls [-l]'));
            lines.push(output(''));
            lines.push(output('  Options:'));
            lines.push(output('    -l    Show detailed list with descriptions'));
            break;
          case 'cat':
            lines.push(output('  Usage: cat <project-slug>'));
            lines.push(output(''));
            lines.push(output('  Example: cat terminal-portfolio'));
            break;
          case 'cd':
            lines.push(output('  Usage: cd <project-slug>'));
            lines.push(output(''));
            lines.push(output('  Navigates to the project URL in a new tab.'));
            lines.push(output('  Example: cd terminal-portfolio'));
            break;
          case 'theme':
            lines.push(output('  Usage: theme [theme-name]'));
            lines.push(output(''));
            lines.push(output('  Available themes: matrix, dracula, monokai, light'));
            lines.push(output('  Without argument, lists available themes.'));
            break;
          case 'echo':
            lines.push(output('  Usage: echo <text>'));
            lines.push(output(''));
            lines.push(output('  Prints the given text to the terminal.'));
            break;
          default:
            lines.push(output(`  Usage: ${info.name}`));
        }
        lines.push(output(''));
      } else {
        lines.push({
          id: generateId(),
          type: 'error',
          content: `Unknown command: ${cmdName}`,
          timestamp: Date.now(),
        });
      }
    } else {
      // Show all commands organized by category
      lines.push(output(''));
      lines.push(output('  ╔════════════════════════════════════════════════════════════╗'));
      lines.push(output('  ║                    Available Commands                      ║'));
      lines.push(output('  ╚════════════════════════════════════════════════════════════╝'));
      lines.push(output(''));

      // Display commands in a multi-column layout by category
      for (const category of commandCategories) {
        lines.push({
          id: generateId(),
          type: 'system',
          content: `  [${category.category}]`,
          timestamp: Date.now(),
        });

        // Find max length for this category
        const maxLen = Math.max(...category.commands.map((c) => c.name.length));

        for (const cmd of category.commands) {
          const padding = ' '.repeat(maxLen - cmd.name.length);
          lines.push(output(`    ${cmd.name}${padding}  ${cmd.description}`));
        }
        lines.push(output(''));
      }

      lines.push(output('  ─────────────────────────────────────────────────────────────'));
      lines.push(output("  Type 'help <command>' for details  •  'help -secret' for more"));
      lines.push(output(''));
    }

    return { lines };
  },
};

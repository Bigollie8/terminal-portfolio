import type { Command, CommandOutput, OutputLine } from '../types/command';
import type { Theme } from '../types/theme';
import {
  themes,
  getThemeNames,
  themeExists,
  isSecretTheme,
  saveCustomTheme,
  deleteCustomTheme,
  getCustomThemeNames,
  isCustomTheme,
  themeExistsWithCustom,
  getThemeWithCustom,
} from '../themes';
import { triggerThemeCreator } from '../utils/themeCreatorEvent';

/**
 * Generate unique ID for output lines
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Secret theme activation message for ENCOM/Tron theme
 */
const getSecretThemeMessage = (themeName: string): string[] => {
  if (themeName === 'the-grid') {
    return [
      '',
      '  ╔══════════════════════════════════════════════════════╗',
      '  ║                                                      ║',
      '  ║   ███████╗███╗   ██╗ ██████╗ ██████╗ ███╗   ███╗     ║',
      '  ║   ██╔════╝████╗  ██║██╔════╝██╔═══██╗████╗ ████║     ║',
      '  ║   █████╗  ██╔██╗ ██║██║     ██║   ██║██╔████╔██║     ║',
      '  ║   ██╔══╝  ██║╚██╗██║██║     ██║   ██║██║╚██╔╝██║     ║',
      '  ║   ███████╗██║ ╚████║╚██████╗╚██████╔╝██║ ╚═╝ ██║     ║',
      '  ║   ╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═════╝ ╚═╝     ╚═╝     ║',
      '  ║                                                      ║',
      '  ║              ENCOM OS 12 INITIALIZED                 ║',
      '  ║                                                      ║',
      '  ║        "The Grid. A digital frontier."               ║',
      '  ║                                                      ║',
      '  ╚══════════════════════════════════════════════════════╝',
      '',
    ];
  }
  return [];
};

/**
 * Validate hex color format
 */
const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

/**
 * Parse custom theme arguments
 * Format: theme -custom <name> <bg> <text> <prompt> <error> <link>
 */
const parseCustomThemeArgs = (args: string[]): { theme: Theme; error?: string } | { theme?: undefined; error: string } => {
  // args after "-custom": name bg text prompt error link
  if (args.length < 6) {
    return {
      error: 'Missing arguments. Usage: theme -custom <name> <bg> <text> <prompt> <error> <link>',
    };
  }

  const [name, bg, text, prompt, error, link] = args;

  // Validate name
  if (!/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(name)) {
    return {
      error: 'Theme name must start with a letter and contain only letters, numbers, hyphens, and underscores.',
    };
  }

  // Check if name conflicts with built-in themes
  if (themeExists(name.toLowerCase())) {
    return {
      error: `Cannot override built-in theme: ${name}`,
    };
  }

  // Validate colors
  const colors = { bg, text, prompt, error, link };
  for (const [colorName, colorValue] of Object.entries(colors)) {
    if (!isValidHexColor(colorValue)) {
      return {
        error: `Invalid ${colorName} color: ${colorValue}. Use hex format (e.g., #00ff00)`,
      };
    }
  }

  const theme: Theme = {
    name: name.toLowerCase(),
    displayName: name,
    colors: {
      background: bg,
      text: text,
      prompt: prompt,
      error: error,
      link: link,
      selection: `${text}33`, // Add 20% opacity to text color
      border: prompt,
    },
  };

  return { theme };
};

/**
 * theme command - change or list terminal themes
 */
export const themeCommand: Command = {
  name: 'theme',
  description: 'Change or list terminal themes',
  usage: 'theme [theme-name] | theme -custom <name> <bg> <text> <prompt> <error> <link> | theme -delete <name>',
  execute: async (args: string[], context): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];
    const availableThemes = getThemeNames();
    const customThemes = getCustomThemeNames();

    if (args.length === 0) {
      // List available themes
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '  Available Themes:',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '  ' + '='.repeat(30),
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });

      for (const themeName of availableThemes) {
        const theme = themes[themeName];
        lines.push({
          id: generateId(),
          type: 'output',
          content: `  ${theme.name.padEnd(12)} - ${theme.displayName}`,
          timestamp: Date.now(),
        });
      }

      // Show custom themes if any
      if (customThemes.length > 0) {
        lines.push({
          id: generateId(),
          type: 'output',
          content: '',
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: '  Custom Themes:',
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: '  ' + '-'.repeat(30),
          timestamp: Date.now(),
        });

        for (const themeName of customThemes) {
          const theme = getThemeWithCustom(themeName);
          if (theme) {
            lines.push({
              id: generateId(),
              type: 'output',
              content: `  ${theme.name.padEnd(12)} - ${theme.displayName} (custom)`,
              timestamp: Date.now(),
            });
          }
        }
      }

      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
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
        content: '    theme <name>                                    - Switch to a theme',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '    theme -custom <name> <bg> <text> <prompt> <error> <link>',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '                                                    - Create custom theme (hex colors)',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '    theme -delete <name>                            - Delete custom theme',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
    } else if (args[0] === '-custom') {
      // If no additional arguments, open the GUI theme creator
      if (args.length === 1) {
        const opened = triggerThemeCreator();
        if (opened) {
          lines.push({
            id: generateId(),
            type: 'system',
            content: 'Opening theme creator...',
            timestamp: Date.now(),
          });
        } else {
          lines.push({
            id: generateId(),
            type: 'output',
            content: 'Theme creator not available. Use command-line format:',
            timestamp: Date.now(),
          });
          lines.push({
            id: generateId(),
            type: 'output',
            content: '  theme -custom <name> <bg> <text> <prompt> <error> <link>',
            timestamp: Date.now(),
          });
          lines.push({
            id: generateId(),
            type: 'output',
            content: '  Example: theme -custom ocean #0a192f #8892b0 #64ffda #ff5555 #00d4ff',
            timestamp: Date.now(),
          });
        }
        return { lines };
      }

      // Create custom theme via command line
      const result = parseCustomThemeArgs(args.slice(1));

      if (result.error) {
        lines.push({
          id: generateId(),
          type: 'error',
          content: result.error,
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
          content: '  Example: theme -custom ocean #0a192f #8892b0 #64ffda #ff5555 #00d4ff',
          timestamp: Date.now(),
        });
      } else if (result.theme) {
        saveCustomTheme(result.theme);
        context.setTheme(result.theme.name);

        lines.push({
          id: generateId(),
          type: 'system',
          content: `Custom theme "${result.theme.displayName}" created and applied!`,
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
          content: '  Theme Colors:',
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: `    Background: ${result.theme.colors.background}`,
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: `    Text:       ${result.theme.colors.text}`,
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: `    Prompt:     ${result.theme.colors.prompt}`,
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: `    Error:      ${result.theme.colors.error}`,
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: `    Link:       ${result.theme.colors.link}`,
          timestamp: Date.now(),
        });
      }
    } else if (args[0] === '-delete') {
      // Delete custom theme
      if (args.length < 2) {
        lines.push({
          id: generateId(),
          type: 'error',
          content: 'Missing theme name. Usage: theme -delete <name>',
          timestamp: Date.now(),
        });
      } else {
        const themeName = args[1].toLowerCase();

        if (!isCustomTheme(themeName)) {
          lines.push({
            id: generateId(),
            type: 'error',
            content: `Theme "${themeName}" is not a custom theme or does not exist.`,
            timestamp: Date.now(),
          });
        } else {
          deleteCustomTheme(themeName);
          lines.push({
            id: generateId(),
            type: 'system',
            content: `Custom theme "${themeName}" deleted.`,
            timestamp: Date.now(),
          });

          // If current theme was deleted, switch to default
          lines.push({
            id: generateId(),
            type: 'output',
            content: 'Switching to default theme...',
            timestamp: Date.now(),
          });
          context.setTheme('matrix');
        }
      }
    } else {
      // Set theme
      const themeName = args[0].toLowerCase();

      if (themeExistsWithCustom(themeName)) {
        context.setTheme(themeName);
        const theme = getThemeWithCustom(themeName);

        if (!theme) {
          lines.push({
            id: generateId(),
            type: 'error',
            content: `Failed to load theme: ${themeName}`,
            timestamp: Date.now(),
          });
        } else if (isSecretTheme(themeName)) {
          // Check if it's a secret theme
          const secretMessage = getSecretThemeMessage(themeName);
          for (const line of secretMessage) {
            lines.push({
              id: generateId(),
              type: 'system',
              content: line,
              timestamp: Date.now(),
            });
          }
        } else if (isCustomTheme(themeName)) {
          lines.push({
            id: generateId(),
            type: 'system',
            content: `Theme changed to custom theme: ${theme.displayName}`,
            timestamp: Date.now(),
          });
        } else {
          lines.push({
            id: generateId(),
            type: 'system',
            content: `Theme changed to ${theme.displayName}.`,
            timestamp: Date.now(),
          });
        }
      } else {
        lines.push({
          id: generateId(),
          type: 'error',
          content: `Unknown theme: ${themeName}`,
          timestamp: Date.now(),
        });
        const allAvailable = [...availableThemes, ...customThemes];
        lines.push({
          id: generateId(),
          type: 'output',
          content: `Available themes: ${allAvailable.join(', ')}`,
          timestamp: Date.now(),
        });
      }
    }

    return { lines };
  },
};

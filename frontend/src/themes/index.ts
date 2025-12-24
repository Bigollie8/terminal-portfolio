import type { Theme } from '../types/theme';

/**
 * Theme definitions for the terminal
 *
 * Available themes:
 * - matrix: Classic green-on-black hacker aesthetic
 * - dracula: Popular dark theme with purple accents
 * - monokai: Warm dark theme from Sublime Text
 * - light: High contrast light theme
 */
export const themes: Record<string, Theme> = {
  matrix: {
    name: 'matrix',
    displayName: 'Matrix',
    colors: {
      background: '#0d0d0d',
      text: '#00ff00',
      prompt: '#00ff00',
      error: '#ff0000',
      link: '#00ffff',
      selection: 'rgba(0, 255, 0, 0.3)',
      border: '#00ff00',
    },
  },
  dracula: {
    name: 'dracula',
    displayName: 'Dracula',
    colors: {
      background: '#282a36',
      text: '#f8f8f2',
      prompt: '#50fa7b',
      error: '#ff5555',
      link: '#8be9fd',
      selection: 'rgba(68, 71, 90, 0.5)',
      border: '#6272a4',
    },
  },
  monokai: {
    name: 'monokai',
    displayName: 'Monokai',
    colors: {
      background: '#272822',
      text: '#f8f8f2',
      prompt: '#a6e22e',
      error: '#f92672',
      link: '#66d9ef',
      selection: 'rgba(73, 72, 62, 0.5)',
      border: '#75715e',
    },
  },
  light: {
    name: 'light',
    displayName: 'Light',
    colors: {
      background: '#fafafa',
      text: '#383a42',
      prompt: '#50a14f',
      error: '#e45649',
      link: '#0184bc',
      selection: 'rgba(0, 0, 0, 0.1)',
      border: '#d3d3d3',
    },
  },
};

/**
 * Secret themes - not shown in theme list, activated by secret codes
 */
export const secretThemes: Record<string, Theme> = {
  'the-grid': {
    name: 'the-grid',
    displayName: 'ENCOM OS 12',
    colors: {
      background: '#0c141f',
      text: '#6fc3df',
      prompt: '#00ffd2',
      error: '#df740c',
      link: '#14a3c7',
      selection: 'rgba(111, 195, 223, 0.3)',
      border: '#6fc3df',
    },
  },
};

/**
 * All themes combined (public + secret)
 */
export const allThemes: Record<string, Theme> = {
  ...themes,
  ...secretThemes,
};

/**
 * Get a theme by name (includes secret themes), defaulting to matrix if not found
 */
export const getTheme = (name: string): Theme => {
  return allThemes[name] || themes.matrix;
};

/**
 * Get all public theme names (excludes secret themes)
 */
export const getThemeNames = (): string[] => {
  return Object.keys(themes);
};

/**
 * Check if a theme exists (includes secret themes)
 */
export const themeExists = (name: string): boolean => {
  return name in allThemes;
};

/**
 * Check if a theme is a secret theme
 */
export const isSecretTheme = (name: string): boolean => {
  return name in secretThemes;
};

/**
 * Default theme name
 */
export const DEFAULT_THEME = 'matrix';

/**
 * Storage key for custom themes
 */
const CUSTOM_THEMES_KEY = 'terminal-custom-themes';

/**
 * Get custom themes from localStorage
 */
export const getCustomThemes = (): Record<string, Theme> => {
  try {
    const stored = localStorage.getItem(CUSTOM_THEMES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load custom themes:', e);
  }
  return {};
};

/**
 * Save a custom theme to localStorage
 */
export const saveCustomTheme = (theme: Theme): void => {
  try {
    const customThemes = getCustomThemes();
    customThemes[theme.name] = theme;
    localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(customThemes));
  } catch (e) {
    console.warn('Failed to save custom theme:', e);
  }
};

/**
 * Delete a custom theme from localStorage
 */
export const deleteCustomTheme = (name: string): boolean => {
  try {
    const customThemes = getCustomThemes();
    if (name in customThemes) {
      delete customThemes[name];
      localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(customThemes));
      return true;
    }
  } catch (e) {
    console.warn('Failed to delete custom theme:', e);
  }
  return false;
};

/**
 * Check if a theme is a custom theme
 */
export const isCustomTheme = (name: string): boolean => {
  const customThemes = getCustomThemes();
  return name in customThemes;
};

/**
 * Get a theme by name (includes built-in, secret, and custom themes)
 */
export const getThemeWithCustom = (name: string): Theme | undefined => {
  // Check built-in themes first
  if (name in allThemes) {
    return allThemes[name];
  }
  // Check custom themes
  const customThemes = getCustomThemes();
  if (name in customThemes) {
    return customThemes[name];
  }
  return undefined;
};

/**
 * Check if a theme exists (includes built-in, secret, and custom themes)
 */
export const themeExistsWithCustom = (name: string): boolean => {
  return name in allThemes || name in getCustomThemes();
};

/**
 * Get all theme names including custom themes
 */
export const getAllThemeNames = (): string[] => {
  const builtIn = Object.keys(themes);
  const custom = Object.keys(getCustomThemes());
  return [...builtIn, ...custom];
};

/**
 * Get custom theme names only
 */
export const getCustomThemeNames = (): string[] => {
  return Object.keys(getCustomThemes());
};

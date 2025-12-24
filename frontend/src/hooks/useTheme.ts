import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Theme } from '../types/theme';
import { getThemeWithCustom, getAllThemeNames, themeExistsWithCustom, DEFAULT_THEME, themes } from '../themes';

const STORAGE_KEY = 'terminal-theme';

/**
 * Return type for useTheme hook
 */
export interface UseThemeReturn {
  /** Current theme object */
  currentTheme: Theme;
  /** Current theme name */
  themeName: string;
  /** Set theme by name */
  setTheme: (name: string) => boolean;
  /** List of available theme names */
  availableThemes: string[];
  /** Check if a theme name is valid */
  isValidTheme: (name: string) => boolean;
}

/**
 * Hook for managing terminal theme with localStorage persistence
 */
export function useTheme(): UseThemeReturn {
  // Load theme preference from localStorage on mount
  const [themeName, setThemeName] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && themeExistsWithCustom(stored)) {
        return stored;
      }
    } catch (e) {
      console.warn('Failed to load theme from localStorage:', e);
    }
    return DEFAULT_THEME;
  });

  // Persist theme to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, themeName);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
  }, [themeName]);

  // Apply theme CSS variables to document
  useEffect(() => {
    const theme = getThemeWithCustom(themeName) || themes.matrix;
    const root = document.documentElement;

    root.style.setProperty('--terminal-bg', theme.colors.background);
    root.style.setProperty('--terminal-text', theme.colors.text);
    root.style.setProperty('--terminal-prompt', theme.colors.prompt);
    root.style.setProperty('--terminal-error', theme.colors.error);
    root.style.setProperty('--terminal-link', theme.colors.link);
    root.style.setProperty('--terminal-selection', theme.colors.selection);
    root.style.setProperty('--terminal-border', theme.colors.border);
  }, [themeName]);

  /**
   * Get the current theme object
   */
  const currentTheme = useMemo(() => getThemeWithCustom(themeName) || themes.matrix, [themeName]);

  /**
   * Get available theme names (includes custom themes)
   */
  const availableThemes = useMemo(() => getAllThemeNames(), []);

  /**
   * Check if a theme name is valid (includes secret and custom themes)
   */
  const isValidTheme = useCallback((name: string): boolean => {
    return themeExistsWithCustom(name);
  }, []);

  /**
   * Set theme by name
   * Returns true if successful, false if theme not found
   */
  const setTheme = useCallback((name: string): boolean => {
    const normalized = name.toLowerCase();
    if (!isValidTheme(normalized)) {
      return false;
    }
    setThemeName(normalized);
    return true;
  }, [isValidTheme]);

  return {
    currentTheme,
    themeName,
    setTheme,
    availableThemes,
    isValidTheme,
  };
}

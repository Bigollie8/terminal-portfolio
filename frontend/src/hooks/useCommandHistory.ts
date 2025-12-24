import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'terminal-command-history';
const MAX_HISTORY_SIZE = 100;

/**
 * Return type for useCommandHistory hook
 */
export interface UseCommandHistoryReturn {
  /** Array of past commands */
  history: string[];
  /** Current position in history (-1 means not navigating) */
  historyIndex: number;
  /** Add a new command to history */
  addToHistory: (command: string) => void;
  /** Navigate through history, returns the command at new position or null */
  navigateHistory: (direction: 'up' | 'down') => string | null;
  /** Reset the navigation index */
  resetIndex: () => void;
  /** Clear all history */
  clearHistory: () => void;
}

/**
 * Hook for managing command history with localStorage persistence
 * and arrow key navigation
 */
export function useCommandHistory(): UseCommandHistoryReturn {
  // Load history from localStorage on mount
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.slice(-MAX_HISTORY_SIZE);
        }
      }
    } catch (e) {
      console.warn('Failed to load command history from localStorage:', e);
    }
    return [];
  });

  // Current position in history for navigation (-1 = not navigating)
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Persist history to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save command history to localStorage:', e);
    }
  }, [history]);

  /**
   * Add a command to history
   * Skips empty commands and duplicates of the last command
   */
  const addToHistory = useCallback((command: string) => {
    const trimmed = command.trim();
    if (!trimmed) return;

    setHistory((prev) => {
      // Don't add if it's the same as the last command
      if (prev.length > 0 && prev[prev.length - 1] === trimmed) {
        return prev;
      }

      // Add command and limit size
      const updated = [...prev, trimmed];
      if (updated.length > MAX_HISTORY_SIZE) {
        return updated.slice(-MAX_HISTORY_SIZE);
      }
      return updated;
    });

    // Reset navigation index after adding
    setHistoryIndex(-1);
  }, []);

  /**
   * Navigate through history
   * Returns the command at the new position, or null if at bounds
   */
  const navigateHistory = useCallback(
    (direction: 'up' | 'down'): string | null => {
      if (history.length === 0) return null;

      let newIndex: number;

      if (direction === 'up') {
        // Going up (back in time)
        if (historyIndex === -1) {
          // Start from the most recent
          newIndex = history.length - 1;
        } else if (historyIndex > 0) {
          // Move back one
          newIndex = historyIndex - 1;
        } else {
          // Already at the oldest, stay there
          return history[0];
        }
      } else {
        // Going down (forward in time)
        if (historyIndex === -1) {
          // Not navigating, nothing to do
          return null;
        } else if (historyIndex < history.length - 1) {
          // Move forward one
          newIndex = historyIndex + 1;
        } else {
          // At the newest, exit navigation
          setHistoryIndex(-1);
          return '';
        }
      }

      setHistoryIndex(newIndex);
      return history[newIndex];
    },
    [history, historyIndex]
  );

  /**
   * Reset the navigation index (call when user starts typing)
   */
  const resetIndex = useCallback(() => {
    setHistoryIndex(-1);
  }, []);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear command history from localStorage:', e);
    }
  }, []);

  return {
    history,
    historyIndex,
    addToHistory,
    navigateHistory,
    resetIndex,
    clearHistory,
  };
}

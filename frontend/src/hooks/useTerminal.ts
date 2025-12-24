import { useState, useCallback, useRef, useEffect } from 'react';
import type { OutputLine } from '../types/command';
import { useCommandHistory } from './useCommandHistory';
import { useTheme } from './useTheme';
import { useCommands, createInputLine, createSystemLine } from './useCommands';
import { useTabComplete, type CompletionSuggestion } from './useTabComplete';
import { registerSetThemeCallback, unregisterSetThemeCallback } from '../utils/themeCreatorEvent';
import { authStorage } from '../services/auth';

/**
 * Default welcome message displayed on terminal load
 */
const DEFAULT_WELCOME_MESSAGE = [
  '',
  '  Welcome to the Terminal Portfolio!',
  '',
  "  Type 'help' to see available commands.",
  "  Use 'ls' to view projects or 'whoami' to learn about me.",
  '',
];

/**
 * Return type for useTerminal hook
 */
export interface UseTerminalReturn {
  /** All output lines to display */
  lines: OutputLine[];
  /** Current input value */
  input: string;
  /** Set the input value */
  setInput: (value: string) => void;
  /** Execute a command */
  executeCommand: (command: string) => Promise<void>;
  /** Clear the terminal */
  clearTerminal: () => void;
  /** Whether a command is currently being processed */
  isProcessing: boolean;
  /** Command history for navigation */
  history: string[];
  /** Navigate command history */
  navigateHistory: (direction: 'up' | 'down') => void;
  /** Theme management */
  theme: ReturnType<typeof useTheme>;
  /** Add output lines manually */
  addOutput: (newLines: OutputLine[]) => void;
  /** Update existing lines by ID (for animations/games) */
  updateLines: (updatedLines: OutputLine[]) => void;
  /** Create a game canvas with fixed line IDs */
  createGameCanvas: (lineCount: number) => string[];
  /** Tab complete the current input */
  tabComplete: () => void;
  /** Current autocomplete suggestions */
  suggestions: CompletionSuggestion[];
  /** Update suggestions for current input */
  updateSuggestions: (input: string) => Promise<void>;
}

/**
 * Generate unique ID for output lines
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Main terminal state management hook
 */
export function useTerminal(
  welcomeMessage: string[] = DEFAULT_WELCOME_MESSAGE
): UseTerminalReturn {
  // Initialize with welcome message
  const [lines, setLines] = useState<OutputLine[]>(() =>
    welcomeMessage.map((content) => ({
      id: generateId(),
      type: 'system' as const,
      content,
      timestamp: Date.now(),
    }))
  );

  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Ref to track if input changed during navigation
  const inputBeforeNavigation = useRef<string | null>(null);

  // Sub-hooks
  const commandHistory = useCommandHistory();
  const theme = useTheme();
  const { executeCommand: runCommand } = useCommands();
  const tabCompleteHook = useTabComplete();

  // Register setTheme callback for ThemeCreator
  useEffect(() => {
    registerSetThemeCallback(theme.setTheme);
    return () => unregisterSetThemeCallback();
  }, [theme.setTheme]);

  /**
   * Add output lines to the terminal
   */
  const addOutput = useCallback((newLines: OutputLine[]) => {
    setLines((prev) => [...prev, ...newLines]);
  }, []);

  /**
   * Update existing lines by their IDs (for animations/games)
   */
  const updateLines = useCallback((updatedLines: OutputLine[]) => {
    setLines((prev) => {
      const updateMap = new Map(updatedLines.map((line) => [line.id, line]));
      return prev.map((line) => updateMap.get(line.id) || line);
    });
  }, []);

  /**
   * Create a game canvas - adds placeholder lines and returns their IDs
   */
  const createGameCanvas = useCallback((lineCount: number): string[] => {
    const canvasLines: OutputLine[] = [];
    const ids: string[] = [];

    for (let i = 0; i < lineCount; i++) {
      const id = generateId();
      ids.push(id);
      canvasLines.push({
        id,
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
    }

    setLines((prev) => [...prev, ...canvasLines]);
    return ids;
  }, []);

  /**
   * Clear all terminal output
   */
  const clearTerminal = useCallback(() => {
    setLines([]);
  }, []);

  /**
   * Execute a command string
   */
  const executeCommand = useCallback(
    async (commandStr: string) => {
      const trimmedCommand = commandStr.trim();

      // Empty command - show a new prompt line like a normal terminal
      if (!trimmedCommand) {
        const user = authStorage.getUser();
        const username = user ? user.username : 'visitor';
        addOutput([createInputLine(`${username}@portfolio:~$`)]);
        return;
      }

      // Add command to history
      commandHistory.addToHistory(trimmedCommand);

      // Echo the input
      addOutput([createInputLine(`$ ${trimmedCommand}`)]);

      // Mark as processing
      setIsProcessing(true);

      try {
        // Build context for command execution
        const context = {
          setTheme: theme.setTheme,
          history: commandHistory.history,
          addOutput,
          updateLines,
          createGameCanvas,
        };

        // Execute the command
        const result = await runCommand(trimmedCommand, context);

        // Handle special results
        if (result.clear) {
          clearTerminal();
        } else if (result.lines.length > 0) {
          addOutput(result.lines);
        }

        // Handle redirect (for cd command)
        if (result.redirect) {
          addOutput([createSystemLine(`Redirecting to ${result.redirect}...`)]);
          // Delay redirect slightly so user can see the message
          setTimeout(() => {
            window.location.href = result.redirect!;
          }, 1000);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        addOutput([
          {
            id: generateId(),
            type: 'error',
            content: `Error: ${message}`,
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsProcessing(false);
      }
    },
    [addOutput, updateLines, createGameCanvas, clearTerminal, commandHistory, theme.setTheme, runCommand]
  );

  /**
   * Navigate through command history
   */
  const navigateHistory = useCallback(
    (direction: 'up' | 'down') => {
      // Save current input when starting navigation
      if (commandHistory.historyIndex === -1 && direction === 'up') {
        inputBeforeNavigation.current = input;
      }

      const result = commandHistory.navigateHistory(direction);

      if (result !== null) {
        setInput(result);
      } else if (direction === 'down' && commandHistory.historyIndex === -1) {
        // Restore original input when exiting navigation
        if (inputBeforeNavigation.current !== null) {
          setInput(inputBeforeNavigation.current);
          inputBeforeNavigation.current = null;
        }
      }
    },
    [commandHistory, input]
  );

  /**
   * Handle input changes (reset history navigation on typing)
   */
  const handleSetInput = useCallback(
    (value: string) => {
      setInput(value);
      // Reset history navigation when user types
      if (commandHistory.historyIndex !== -1) {
        commandHistory.resetIndex();
        inputBeforeNavigation.current = null;
      }
      // Reset tab completion when user types manually
      tabCompleteHook.resetCompletion();
    },
    [commandHistory, tabCompleteHook]
  );

  /**
   * Handle tab completion
   */
  const tabComplete = useCallback(async () => {
    const completion = await tabCompleteHook.getCompletion(input);
    if (completion) {
      setInput(completion);
    }
  }, [input, tabCompleteHook]);

  /**
   * Update suggestions for input
   */
  const updateSuggestions = useCallback(async (value: string) => {
    await tabCompleteHook.getSuggestions(value);
  }, [tabCompleteHook]);

  return {
    lines,
    input,
    setInput: handleSetInput,
    executeCommand,
    clearTerminal,
    isProcessing,
    history: commandHistory.history,
    navigateHistory,
    theme,
    addOutput,
    updateLines,
    createGameCanvas,
    tabComplete,
    suggestions: tabCompleteHook.suggestions,
    updateSuggestions,
  };
}

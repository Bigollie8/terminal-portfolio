import { useState, useCallback, useRef, useEffect } from 'react';
import { getCommandNames } from '../commands';
import {
  getCommandCompletion,
  getCompletionsForSource,
  preloadCompletionCache,
} from '../config/autocomplete';

/**
 * Completion suggestion with metadata
 */
export interface CompletionSuggestion {
  value: string;
  type: 'command' | 'argument' | 'flag' | 'subcommand';
}

/**
 * Return type for useTabComplete hook
 */
export interface UseTabCompleteReturn {
  /** Get the next tab completion for the current input */
  getCompletion: (input: string) => Promise<string | null>;
  /** Reset completion state (call when input changes manually) */
  resetCompletion: () => void;
  /** Get all available suggestions for current input */
  getSuggestions: (input: string) => Promise<CompletionSuggestion[]>;
  /** Current suggestions for display */
  suggestions: CompletionSuggestion[];
  /** Whether suggestions are loading */
  isLoading: boolean;
}

/**
 * Parse input into command and arguments
 */
function parseInput(input: string): { command: string; args: string[]; partial: string } {
  const trimmed = input.trimStart();
  const parts = trimmed.split(/\s+/);

  if (parts.length === 0 || trimmed === '') {
    return { command: '', args: [], partial: '' };
  }

  // Check if there's a trailing space (user is starting a new word)
  const hasTrailingSpace = input.endsWith(' ');

  if (parts.length === 1 && !hasTrailingSpace) {
    // Still typing the command
    return { command: '', args: [], partial: parts[0] };
  }

  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  if (hasTrailingSpace) {
    // User has typed a space, ready for next argument
    return { command, args, partial: '' };
  }

  // Last word is partial
  const partial = args.pop() || '';
  return { command, args, partial };
}

/**
 * Hook for tab completion functionality
 *
 * Supports:
 * - Command name completion (first word)
 * - Context-aware argument completion for all commands
 * - Cycling through multiple matches on repeated Tab presses
 * - Visual suggestions display
 */
export function useTabComplete(): UseTabCompleteReturn {
  // Track the original input before completion started
  const originalInput = useRef<string | null>(null);
  // Track current completion index for cycling
  const [completionIndex, setCompletionIndex] = useState(0);
  // Track current matches
  const currentMatches = useRef<string[]>([]);
  // Track current full completions (with command prefix)
  const currentFullCompletions = useRef<string[]>([]);
  // Suggestions for display
  const [suggestions, setSuggestions] = useState<CompletionSuggestion[]>([]);
  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Preload cache on mount
  useEffect(() => {
    preloadCompletionCache();
  }, []);

  /**
   * Get all possible completions for a command argument
   */
  const getArgumentCompletions = useCallback(
    async (command: string, args: string[], partial: string): Promise<string[]> => {
      const completionDef = getCommandCompletion(command);
      if (!completionDef) {
        return [];
      }

      const position = args.length;
      const allMatches: string[] = [];

      // Find all arg completions that match position or are position -1 (any)
      for (const argDef of completionDef.args) {
        if (argDef.position !== position && argDef.position !== -1) {
          continue;
        }

        // Check condition if present
        if (argDef.condition && !argDef.condition(args)) {
          continue;
        }

        const sourceCompletions = await getCompletionsForSource(argDef.source);
        const filtered = sourceCompletions.filter(val =>
          val.toLowerCase().startsWith(partial.toLowerCase())
        );
        allMatches.push(...filtered);
      }

      // Remove duplicates
      return [...new Set(allMatches)];
    },
    []
  );

  /**
   * Get all available suggestions for display
   */
  const getSuggestions = useCallback(
    async (input: string): Promise<CompletionSuggestion[]> => {
      const { command, args, partial } = parseInput(input);

      // If no command yet, suggest command names
      if (!command && partial === '') {
        // Don't show all commands when empty
        return [];
      }

      if (!command) {
        // Completing command name
        const commands = getCommandNames();
        const matches = commands
          .filter(cmd => cmd.toLowerCase().startsWith(partial.toLowerCase()))
          .slice(0, 10);
        return matches.map(m => ({ value: m, type: 'command' as const }));
      }

      // Completing argument
      const matches = await getArgumentCompletions(command, args, partial);
      return matches.slice(0, 10).map(m => ({
        value: m,
        type: m.startsWith('-') ? 'flag' as const : 'argument' as const,
      }));
    },
    [getArgumentCompletions]
  );

  /**
   * Get completions for the given input
   */
  const getCompletion = useCallback(
    async (input: string): Promise<string | null> => {
      const { command, args, partial } = parseInput(input);

      // Generate cache key based on current context
      const cacheKey = command
        ? `arg:${command}:${args.join(':')}:${partial}`
        : `cmd:${partial}`;

      // Check if this is a new completion or continuing cycle
      if (originalInput.current !== cacheKey) {
        // New completion - find matches
        originalInput.current = cacheKey;
        setIsLoading(true);

        try {
          let matches: string[];
          let fullCompletions: string[];

          if (!command) {
            // Completing command name
            const commands = getCommandNames();
            matches = commands.filter(cmd =>
              cmd.toLowerCase().startsWith(partial.toLowerCase())
            );
            fullCompletions = matches;
          } else {
            // Completing argument
            matches = await getArgumentCompletions(command, args, partial);
            // Build full completion strings
            const prefix = args.length > 0 ? `${command} ${args.join(' ')} ` : `${command} `;
            fullCompletions = matches.map(m => prefix + m);
          }

          currentMatches.current = matches;
          currentFullCompletions.current = fullCompletions;
          setCompletionIndex(0);

          // Update suggestions for display
          const suggestionType = !command ? 'command' : 'argument';
          setSuggestions(
            matches.slice(0, 10).map(m => ({
              value: m,
              type: m.startsWith('-') ? 'flag' : suggestionType,
            })) as CompletionSuggestion[]
          );

          if (matches.length === 0) {
            return null;
          }

          return fullCompletions[0];
        } finally {
          setIsLoading(false);
        }
      } else {
        // Continuing - cycle through matches
        if (currentMatches.current.length === 0) {
          return null;
        }

        const nextIndex = (completionIndex + 1) % currentMatches.current.length;
        setCompletionIndex(nextIndex);
        return currentFullCompletions.current[nextIndex];
      }
    },
    [completionIndex, getArgumentCompletions]
  );

  /**
   * Reset completion state
   */
  const resetCompletion = useCallback(() => {
    originalInput.current = null;
    currentMatches.current = [];
    currentFullCompletions.current = [];
    setCompletionIndex(0);
    setSuggestions([]);
  }, []);

  return {
    getCompletion,
    resetCompletion,
    getSuggestions,
    suggestions,
    isLoading,
  };
}

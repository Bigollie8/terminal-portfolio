import { useCallback } from 'react';
import type { Command, CommandContext, CommandOutput, OutputLine } from '../types/command';
import { commands, getCommand } from '../commands';
import { api } from '../services/api';

/**
 * Generate a unique ID for output lines
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create an output line
 */
export const createOutputLine = (
  content: string,
  type: OutputLine['type'] = 'output'
): OutputLine => ({
  id: generateId(),
  type,
  content,
  timestamp: Date.now(),
});

/**
 * Create an error output line
 */
export const createErrorLine = (message: string): OutputLine =>
  createOutputLine(message, 'error');

/**
 * Create a system output line
 */
export const createSystemLine = (message: string): OutputLine =>
  createOutputLine(message, 'system');

/**
 * Create an input echo line
 */
export const createInputLine = (command: string): OutputLine =>
  createOutputLine(command, 'input');

/**
 * Parse a command string into command name and arguments
 */
const parseCommand = (input: string): { name: string; args: string[] } => {
  const trimmed = input.trim();
  if (!trimmed) {
    return { name: '', args: [] };
  }

  // Split by whitespace, respecting quoted strings
  const parts: string[] = [];
  let current = '';
  let inQuote = false;
  let quoteChar = '';

  for (const char of trimmed) {
    if (!inQuote && (char === '"' || char === "'")) {
      inQuote = true;
      quoteChar = char;
    } else if (inQuote && char === quoteChar) {
      inQuote = false;
      quoteChar = '';
    } else if (!inQuote && /\s/.test(char)) {
      if (current) {
        parts.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }

  if (current) {
    parts.push(current);
  }

  const [name, ...args] = parts;
  return { name: name?.toLowerCase() || '', args };
};

/**
 * Return type for useCommands hook
 */
export interface UseCommandsReturn {
  /** Execute a command string and return output */
  executeCommand: (
    input: string,
    context: Omit<CommandContext, 'api'>
  ) => Promise<CommandOutput>;
  /** Get a command by name */
  getCommand: (name: string) => Command | undefined;
  /** Get all registered commands */
  getAllCommands: () => Command[];
  /** Check if a command exists */
  commandExists: (name: string) => boolean;
  /** Get command names for autocomplete */
  getCommandNames: () => string[];
}

/**
 * Hook for command registration and execution
 */
export function useCommands(): UseCommandsReturn {
  /**
   * Get all registered commands
   */
  const getAllCommands = useCallback((): Command[] => {
    return Array.from(commands.values());
  }, []);

  /**
   * Check if a command exists
   */
  const commandExists = useCallback((name: string): boolean => {
    return commands.has(name.toLowerCase());
  }, []);

  /**
   * Get all command names for autocomplete
   */
  const getCommandNames = useCallback((): string[] => {
    return Array.from(commands.keys());
  }, []);

  /**
   * Execute a command string
   */
  const executeCommand = useCallback(
    async (
      input: string,
      contextWithoutApi: Omit<CommandContext, 'api'>
    ): Promise<CommandOutput> => {
      const { name, args } = parseCommand(input);

      // Empty input
      if (!name) {
        return { lines: [] };
      }

      // Find command
      const command = getCommand(name);

      if (!command) {
        return {
          lines: [
            createErrorLine(`Command not found: ${name}`),
            createOutputLine("Type 'help' to see available commands."),
          ],
        };
      }

      // Build full context
      const context: CommandContext = {
        ...contextWithoutApi,
        api,
      };

      try {
        // Execute command
        const result = await command.execute(args, context);
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          lines: [createErrorLine(`Error executing '${name}': ${message}`)],
        };
      }
    },
    []
  );

  return {
    executeCommand,
    getCommand,
    getAllCommands,
    commandExists,
    getCommandNames,
  };
}

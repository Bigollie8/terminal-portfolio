import type { OutputLine, CommandOutput } from '@shared/types';
import type { api } from '../services/api';

/**
 * Context provided to command execution
 */
export interface CommandContext {
  /** API service for fetching data */
  api: typeof api;
  /** Function to change the terminal theme */
  setTheme: (theme: string) => void;
  /** Command history for the history command */
  history: string[];
  /** Function to add output lines to the terminal */
  addOutput: (lines: OutputLine[]) => void;
  /** Function to update existing lines by their IDs (for animations/games) */
  updateLines: (lines: OutputLine[]) => void;
  /** Create a game canvas - returns line IDs that can be updated in place */
  createGameCanvas: (lineCount: number) => string[];
}

/**
 * Command definition
 */
export interface Command {
  /** Command name (what users type) */
  name: string;
  /** Brief description shown in help */
  description: string;
  /** Usage example */
  usage: string;
  /** Command execution function */
  execute: (args: string[], context: CommandContext) => Promise<CommandOutput>;
}

// Re-export shared types for convenience
export type { OutputLine, CommandOutput };

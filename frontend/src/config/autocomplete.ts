/**
 * Autocomplete configuration for terminal commands
 *
 * This module defines completion rules for all commands including:
 * - Static options (flags, subcommands)
 * - Dynamic options (themes, users, projects)
 */

import { getCommandNames } from '../commands';
import { getAllThemeNames } from '../themes';
import { api } from '../services/api';

/**
 * Completion source type
 */
export type CompletionSource =
  | { type: 'static'; values: string[] }
  | { type: 'dynamic'; fetch: () => Promise<string[]> }
  | { type: 'commands' }  // All command names
  | { type: 'themes' }    // All theme names
  | { type: 'projects' }  // Project slugs
  | { type: 'users' };    // Registered users

/**
 * Argument completion definition
 */
export interface ArgCompletion {
  /** Position in args (0-based, -1 for any position) */
  position: number;
  /** Completion source */
  source: CompletionSource;
  /** Only complete if previous args match */
  condition?: (args: string[]) => boolean;
}

/**
 * Command completion definition
 */
export interface CommandCompletion {
  /** Command name */
  command: string;
  /** Argument completions */
  args: ArgCompletion[];
}

/**
 * Registry of command completions
 */
export const commandCompletions: CommandCompletion[] = [
  // help - complete with command names or -secret
  {
    command: 'help',
    args: [
      { position: 0, source: { type: 'static', values: ['-secret'] } },
      { position: 0, source: { type: 'commands' } },
    ],
  },

  // ls - complete with flags
  {
    command: 'ls',
    args: [
      { position: 0, source: { type: 'static', values: ['-l', '--long'] } },
    ],
  },

  // cat - complete with project slugs
  {
    command: 'cat',
    args: [
      { position: 0, source: { type: 'projects' } },
    ],
  },

  // cd - complete with project slugs and special dirs
  {
    command: 'cd',
    args: [
      { position: 0, source: { type: 'static', values: ['~', '-', '..'] } },
      { position: 0, source: { type: 'projects' } },
    ],
  },

  // theme - complete with theme names and flags
  {
    command: 'theme',
    args: [
      { position: 0, source: { type: 'static', values: ['-custom', '-delete'] } },
      { position: 0, source: { type: 'themes' } },
      // After -delete, complete with custom theme names
      {
        position: 1,
        source: { type: 'themes' },
        condition: (args) => args[0] === '-delete',
      },
    ],
  },

  // finger - complete with usernames and -bio flag
  {
    command: 'finger',
    args: [
      { position: 0, source: { type: 'static', values: ['-bio'] } },
      { position: 0, source: { type: 'users' } },
    ],
  },

  // mail - complete with subcommands and usernames
  {
    command: 'mail',
    args: [
      { position: 0, source: { type: 'static', values: ['inbox', 'send', 'read', 'sent'] } },
      // After "send", complete with usernames
      {
        position: 1,
        source: { type: 'users' },
        condition: (args) => args[0] === 'send',
      },
    ],
  },

  // wall - complete with subcommands
  {
    command: 'wall',
    args: [
      { position: 0, source: { type: 'static', values: ['post', 'delete'] } },
    ],
  },

  // history - complete with flags
  {
    command: 'history',
    args: [
      { position: 0, source: { type: 'static', values: ['-c', '--clear'] } },
    ],
  },

  // weather - complete with city examples
  {
    command: 'weather',
    args: [
      { position: 0, source: { type: 'static', values: ['new-york', 'london', 'tokyo', 'paris', 'sydney'] } },
    ],
  },

  // sudo - complete with commands (for fun)
  {
    command: 'sudo',
    args: [
      { position: 0, source: { type: 'commands' } },
    ],
  },

  // traceroute - complete with hosts
  {
    command: 'traceroute',
    args: [
      { position: 0, source: { type: 'static', values: ['api.basedsecurity.net', 'portfolio.basedsecurity.net', 'google.com'] } },
    ],
  },

  // portal - complete with portal names
  {
    command: 'portal',
    args: [
      { position: 0, source: { type: 'static', values: ['photos', 'status', 'shipping'] } },
    ],
  },
];

/**
 * Cache for dynamic completions
 */
interface CompletionCache {
  projects: string[];
  users: string[];
  themes: string[];
  lastFetch: {
    projects: number;
    users: number;
  };
}

const cache: CompletionCache = {
  projects: [],
  users: [],
  themes: [],
  lastFetch: {
    projects: 0,
    users: 0,
  },
};

const CACHE_TTL = 60000; // 1 minute

/**
 * Get completions for a source
 */
export async function getCompletionsForSource(source: CompletionSource): Promise<string[]> {
  switch (source.type) {
    case 'static':
      return source.values;

    case 'commands':
      return getCommandNames();

    case 'themes':
      // Themes can change at runtime with custom themes
      return getAllThemeNames();

    case 'projects': {
      const now = Date.now();
      if (cache.projects.length === 0 || now - cache.lastFetch.projects > CACHE_TTL) {
        try {
          cache.projects = await api.getProjectSlugs();
          cache.lastFetch.projects = now;
        } catch {
          // Keep stale cache on error
        }
      }
      return cache.projects;
    }

    case 'users': {
      const now = Date.now();
      if (cache.users.length === 0 || now - cache.lastFetch.users > CACHE_TTL) {
        try {
          const { users } = await api.getUsers();
          cache.users = users.map(u => u.username);
          cache.lastFetch.users = now;
        } catch {
          // Keep stale cache on error
        }
      }
      return cache.users;
    }

    case 'dynamic':
      return source.fetch();

    default:
      return [];
  }
}

/**
 * Get completion definition for a command
 */
export function getCommandCompletion(command: string): CommandCompletion | undefined {
  return commandCompletions.find(c => c.command === command.toLowerCase());
}

/**
 * Preload cache for faster initial completions
 */
export async function preloadCompletionCache(): Promise<void> {
  try {
    const [projects] = await Promise.all([
      api.getProjectSlugs(),
    ]);
    cache.projects = projects;
    cache.lastFetch.projects = Date.now();
  } catch {
    // Ignore errors
  }
}

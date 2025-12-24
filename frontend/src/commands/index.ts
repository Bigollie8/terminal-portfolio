import type { Command } from '../types/command';
import { helpCommand } from './help';
import { lsCommand } from './ls';
import { catCommand } from './cat';
import { cdCommand } from './cd';
import { clearCommand } from './clear';
import { whoamiCommand } from './whoami';
import { contactCommand } from './contact';
import { themeCommand } from './theme';
import { historyCommand } from './history';
import { echoCommand } from './echo';
import { matrixCommand } from './matrix';
import { hackCommand } from './hack';
import { sudoCommand } from './sudo';
import { rmCommand } from './rm';
import { snakeCommand } from './snake';
import { typingtestCommand } from './typingtest';
import { timeCommand } from './time';
import { uptimeCommand } from './uptime';
import { weatherCommand } from './weather';
import { calcCommand } from './calc';
import { treeCommand } from './tree';
import { tronCommand } from './tron';
import { derezCommand } from './derez';
import { identityCommand } from './identity';
import { awsCommand } from './aws';
import { statusCommand } from './status';
import { portalCommand } from './portal';
import { tracerouteCommand } from './traceroute';
import { registerCommand } from './register';
import { loginCommand } from './login';
import { logoutCommand } from './logout';
import { fingerCommand } from './finger';
import { whoCommand } from './who';
import { mailCommand } from './mail';
import { wallCommand } from './wall';
import { restartCommand } from './restart';

/**
 * Registry of all available commands
 */
export const commands: Map<string, Command> = new Map([
  ['help', helpCommand],
  ['ls', lsCommand],
  ['cat', catCommand],
  ['cd', cdCommand],
  ['clear', clearCommand],
  ['whoami', whoamiCommand],
  ['contact', contactCommand],
  ['theme', themeCommand],
  ['history', historyCommand],
  ['echo', echoCommand],
  // Fun commands
  ['matrix', matrixCommand],
  ['hack', hackCommand],
  ['sudo', sudoCommand],
  ['rm', rmCommand],
  // Games
  ['snake', snakeCommand],
  ['typingtest', typingtestCommand],
  // Utilities
  ['time', timeCommand],
  ['uptime', uptimeCommand],
  ['weather', weatherCommand],
  ['calc', calcCommand],
  ['tree', treeCommand],
  // Grid theme commands
  ['tron', tronCommand],
  ['derez', derezCommand],
  ['identity', identityCommand],
  // Infrastructure & Monitoring
  ['aws', awsCommand],
  ['status', statusCommand],
  ['portal', portalCommand],
  ['traceroute', tracerouteCommand],
  // Social & User commands
  ['register', registerCommand],
  ['login', loginCommand],
  ['logout', logoutCommand],
  ['finger', fingerCommand],
  ['who', whoCommand],
  ['mail', mailCommand],
  ['wall', wallCommand],
  ['restart', restartCommand],
]);

/**
 * Get a command by name (case-insensitive)
 */
export const getCommand = (name: string): Command | undefined => {
  return commands.get(name.toLowerCase());
};

/**
 * Check if a command exists
 */
export const hasCommand = (name: string): boolean => {
  return commands.has(name.toLowerCase());
};

/**
 * Get all command names
 */
export const getCommandNames = (): string[] => {
  return Array.from(commands.keys());
};

/**
 * Get all commands
 */
export const getAllCommands = (): Command[] => {
  return Array.from(commands.values());
};

// Re-export individual commands for direct import
export {
  helpCommand,
  lsCommand,
  catCommand,
  cdCommand,
  clearCommand,
  whoamiCommand,
  contactCommand,
  themeCommand,
  historyCommand,
  echoCommand,
  matrixCommand,
  hackCommand,
  sudoCommand,
  rmCommand,
  snakeCommand,
  typingtestCommand,
  timeCommand,
  uptimeCommand,
  weatherCommand,
  calcCommand,
  treeCommand,
  tronCommand,
  derezCommand,
  identityCommand,
  awsCommand,
  statusCommand,
  portalCommand,
  tracerouteCommand,
  registerCommand,
  loginCommand,
  logoutCommand,
  fingerCommand,
  whoCommand,
  mailCommand,
  wallCommand,
  restartCommand,
};

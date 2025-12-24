import type { Command, CommandOutput, OutputLine } from '../types/command';
import { authStorage } from '../services/auth';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * register command - Create a new user account
 *
 * Usage: register -u <username> -p <password>
 */
export const registerCommand: Command = {
  name: 'register',
  description: 'Create a new user account',
  usage: 'register -u <username> -p <password>',
  execute: async (args: string[], context): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];

    // Check if already logged in
    if (authStorage.isLoggedIn()) {
      lines.push({
        id: generateId(),
        type: 'error',
        content: `Already logged in as ${authStorage.getUser()?.username}. Use 'logout' first.`,
        timestamp: Date.now(),
      });
      return { lines };
    }

    // Parse -u and -p flags
    let username = '';
    let password = '';

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-u' && args[i + 1]) {
        username = args[i + 1];
        i++;
      } else if (args[i] === '-p' && args[i + 1]) {
        password = args[i + 1];
        i++;
      }
    }

    // Validate inputs
    if (!username || !password) {
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'system',
        content: '  Usage: register -u <username> -p <password>',
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
        content: '  Requirements:',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '    • Username: 3-20 characters, letters/numbers/underscores only',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '    • Password: 6+ characters',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
      return { lines };
    }

    try {
      const result = await context.api.register(username, password);

      // Save session
      authStorage.setSession(result.token, result.user);

      // Welcome message
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'system',
        content: '  ╔══════════════════════════════════════╗',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'system',
        content: '  ║     Welcome to Terminal Portfolio    ║',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'system',
        content: '  ╚══════════════════════════════════════╝',
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
        content: '  Account created successfully!',
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
        content: `  Username: ${result.user.username}`,
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '  Member since: just now',
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
        type: 'system',
        content: '  Quick tips:',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '    • See who\'s online: who',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '    • View user profiles: finger <username>',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '    • Send mail: mail send <user> <message>',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '    • Post to wall: wall <message>',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      lines.push({
        id: generateId(),
        type: 'error',
        content: `Error: ${message}`,
        timestamp: Date.now(),
      });
    }

    return { lines };
  },
};

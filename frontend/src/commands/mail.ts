import type { Command, CommandOutput, OutputLine } from '../types/command';
import { authStorage } from '../services/auth';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const formatTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

/**
 * mail command - Internal messaging system
 *
 * Usage:
 *   mail                           - Show inbox
 *   mail inbox                     - Show inbox
 *   mail send <user> <message>     - Send message
 *   mail read <id>                 - Read specific message
 *   mail sent                      - Show sent messages
 */
export const mailCommand: Command = {
  name: 'mail',
  description: 'Send and receive messages',
  usage: 'mail [inbox|send|read|sent]',
  execute: async (args: string[], context): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];

    // Check if logged in
    if (!authStorage.isLoggedIn()) {
      lines.push({
        id: generateId(),
        type: 'error',
        content: "You must be logged in to use mail. Use 'login' or 'register'.",
        timestamp: Date.now(),
      });
      return { lines };
    }

    const token = authStorage.getToken()!;
    const subcommand = args[0]?.toLowerCase() || 'inbox';

    try {
      switch (subcommand) {
        case 'inbox': {
          const { messages, unreadCount } = await context.api.getInbox(token);

          lines.push({
            id: generateId(),
            type: 'output',
            content: '',
            timestamp: Date.now(),
          });
          lines.push({
            id: generateId(),
            type: 'system',
            content: `  Inbox (${unreadCount} unread)`,
            timestamp: Date.now(),
          });
          lines.push({
            id: generateId(),
            type: 'output',
            content: '  ' + '─'.repeat(50),
            timestamp: Date.now(),
          });

          if (messages.length === 0) {
            lines.push({
              id: generateId(),
              type: 'output',
              content: '  No messages.',
              timestamp: Date.now(),
            });
          } else {
            for (const msg of messages.slice(0, 10)) {
              const readMarker = msg.read ? ' ' : '*';
              const preview = msg.content.substring(0, 30) + (msg.content.length > 30 ? '...' : '');
              lines.push({
                id: generateId(),
                type: msg.read ? 'output' : 'system',
                content: `  ${readMarker} [${msg.id}] from ${msg.senderUsername.padEnd(12)} ${formatTimeAgo(msg.createdAt)}`,
                timestamp: Date.now(),
              });
              lines.push({
                id: generateId(),
                type: 'output',
                content: `       ${preview}`,
                timestamp: Date.now(),
              });
            }
          }

          lines.push({
            id: generateId(),
            type: 'output',
            content: '',
            timestamp: Date.now(),
          });
          lines.push({
            id: generateId(),
            type: 'output',
            content: "  Use 'mail read <id>' to read a message",
            timestamp: Date.now(),
          });
          lines.push({
            id: generateId(),
            type: 'output',
            content: '',
            timestamp: Date.now(),
          });
          break;
        }

        case 'sent': {
          const { messages } = await context.api.getSentMessages(token);

          lines.push({
            id: generateId(),
            type: 'output',
            content: '',
            timestamp: Date.now(),
          });
          lines.push({
            id: generateId(),
            type: 'system',
            content: '  Sent Messages',
            timestamp: Date.now(),
          });
          lines.push({
            id: generateId(),
            type: 'output',
            content: '  ' + '─'.repeat(50),
            timestamp: Date.now(),
          });

          if (messages.length === 0) {
            lines.push({
              id: generateId(),
              type: 'output',
              content: '  No sent messages.',
              timestamp: Date.now(),
            });
          } else {
            for (const msg of messages.slice(0, 10)) {
              const preview = msg.content.substring(0, 30) + (msg.content.length > 30 ? '...' : '');
              lines.push({
                id: generateId(),
                type: 'output',
                content: `  [${msg.id}] to ${msg.recipientUsername.padEnd(12)} ${formatTimeAgo(msg.createdAt)}`,
                timestamp: Date.now(),
              });
              lines.push({
                id: generateId(),
                type: 'output',
                content: `       ${preview}`,
                timestamp: Date.now(),
              });
            }
          }

          lines.push({
            id: generateId(),
            type: 'output',
            content: '',
            timestamp: Date.now(),
          });
          break;
        }

        case 'read': {
          const messageId = parseInt(args[1], 10);

          if (isNaN(messageId)) {
            lines.push({
              id: generateId(),
              type: 'error',
              content: 'Usage: mail read <id>',
              timestamp: Date.now(),
            });
            return { lines };
          }

          const { message } = await context.api.getMessage(token, messageId);

          lines.push({
            id: generateId(),
            type: 'output',
            content: '',
            timestamp: Date.now(),
          });
          lines.push({
            id: generateId(),
            type: 'system',
            content: `  From: ${message.senderUsername}`,
            timestamp: Date.now(),
          });
          lines.push({
            id: generateId(),
            type: 'output',
            content: `  To:   ${message.recipientUsername}`,
            timestamp: Date.now(),
          });
          lines.push({
            id: generateId(),
            type: 'output',
            content: `  Date: ${formatTimeAgo(message.createdAt)}`,
            timestamp: Date.now(),
          });
          lines.push({
            id: generateId(),
            type: 'output',
            content: '  ' + '─'.repeat(40),
            timestamp: Date.now(),
          });
          lines.push({
            id: generateId(),
            type: 'output',
            content: '',
            timestamp: Date.now(),
          });

          // Split content into lines
          const contentLines = message.content.split('\n');
          for (const line of contentLines) {
            lines.push({
              id: generateId(),
              type: 'output',
              content: `  ${line}`,
              timestamp: Date.now(),
            });
          }

          lines.push({
            id: generateId(),
            type: 'output',
            content: '',
            timestamp: Date.now(),
          });
          break;
        }

        case 'send': {
          const recipient = args[1];
          const messageContent = args.slice(2).join(' ');

          if (!recipient || !messageContent) {
            lines.push({
              id: generateId(),
              type: 'error',
              content: 'Usage: mail send <username> <message>',
              timestamp: Date.now(),
            });
            return { lines };
          }

          await context.api.sendMessage(token, recipient, messageContent);

          lines.push({
            id: generateId(),
            type: 'output',
            content: '',
            timestamp: Date.now(),
          });
          lines.push({
            id: generateId(),
            type: 'system',
            content: `  Message sent to ${recipient}!`,
            timestamp: Date.now(),
          });
          lines.push({
            id: generateId(),
            type: 'output',
            content: '',
            timestamp: Date.now(),
          });
          break;
        }

        default:
          lines.push({
            id: generateId(),
            type: 'output',
            content: '',
            timestamp: Date.now(),
          });
          lines.push({
            id: generateId(),
            type: 'system',
            content: '  Mail Commands:',
            timestamp: Date.now(),
          });
          lines.push({
            id: generateId(),
            type: 'output',
            content: '    mail                        - Show inbox',
            timestamp: Date.now(),
          });
          lines.push({
            id: generateId(),
            type: 'output',
            content: '    mail send <user> <message>  - Send a message',
            timestamp: Date.now(),
          });
          lines.push({
            id: generateId(),
            type: 'output',
            content: '    mail read <id>              - Read a message',
            timestamp: Date.now(),
          });
          lines.push({
            id: generateId(),
            type: 'output',
            content: '    mail sent                   - Show sent messages',
            timestamp: Date.now(),
          });
          lines.push({
            id: generateId(),
            type: 'output',
            content: '',
            timestamp: Date.now(),
          });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process mail command';
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

import type { Command, CommandOutput, OutputLine } from '../types/command';

/**
 * Generate unique ID for output lines
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Portal destinations - apps that can be accessed
 */
const portals = {
  basedsecurity: {
    name: 'BasedSecurity',
    url: 'https://security.basedsecurity.net',
    description: 'AI Security Training Platform',
    icon: '🔐',
    returnParam: '?from=terminal',
  },
  photos: {
    name: 'RapidPhotoFlow',
    url: 'https://photos.basedsecurity.net',
    description: 'Photo Management System',
    icon: '📸',
    returnParam: '?from=terminal',
  },
  shipping: {
    name: 'Shipping Monitor',
    url: 'https://shipping.basedsecurity.net',
    description: 'Package Tracking Dashboard',
    icon: '📦',
    returnParam: '?from=terminal',
  },
  github: {
    name: 'GitHub',
    url: 'https://github.com/Bigollie8',
    description: 'Source Code Repository',
    icon: '🐙',
    returnParam: '',
  },
  linkedin: {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/oliverland/',
    description: 'Professional Network',
    icon: '💼',
    returnParam: '',
  },
};

type PortalKey = keyof typeof portals;

/**
 * ASCII art for portal animation
 */
const portalArt = [
  '        ╔═══════════════════╗',
  '       ╔╝                   ╚╗',
  '      ╔╝    ┌───────────┐    ╚╗',
  '     ╔╝     │ ENTERING  │     ╚╗',
  '    ╔╝      │  PORTAL   │      ╚╗',
  '   ╔╝       └───────────┘       ╚╗',
  '  ╔╝                             ╚╗',
  ' ╔╝    ░░▒▒▓▓████████▓▓▒▒░░      ╚╗',
  '╔╝   ░░▒▒▓▓██          ██▓▓▒▒░░   ╚╗',
  '║  ░░▒▒▓▓██    >>>>      ██▓▓▒▒░░  ║',
  '╚╗   ░░▒▒▓▓██          ██▓▓▒▒░░   ╔╝',
  ' ╚╗    ░░▒▒▓▓████████▓▓▒▒░░      ╔╝',
  '  ╚╗                             ╔╝',
  '   ╚╗                           ╔╝',
  '    ╚╗                         ╔╝',
  '     ╚╗                       ╔╝',
  '      ╚╗                     ╔╝',
  '       ╚╗                   ╔╝',
  '        ╚═══════════════════╝',
];

/**
 * Return button HTML for embedding in other applications
 */
const getReturnButtonCode = (): string[] => {
  return [
    '<!-- Terminal Return Button - Add to your app -->',
    '<style>',
    '  .terminal-return {',
    '    position: fixed;',
    '    bottom: 20px;',
    '    right: 20px;',
    '    background: #0a0a0a;',
    '    border: 2px solid #00ff00;',
    '    color: #00ff00;',
    '    padding: 12px 24px;',
    '    font-family: "Courier New", monospace;',
    '    font-size: 14px;',
    '    cursor: pointer;',
    '    transition: all 0.3s ease;',
    '    z-index: 9999;',
    '    box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);',
    '  }',
    '  .terminal-return:hover {',
    '    background: #00ff00;',
    '    color: #0a0a0a;',
    '    box-shadow: 0 0 20px rgba(0, 255, 0, 0.6);',
    '  }',
    '  .terminal-return::before {',
    '    content: "> ";',
    '  }',
    '</style>',
    '<a href="https://portfolio.basedsecurity.net" class="terminal-return">',
    '  Return to Terminal',
    '</a>',
  ];
};

/**
 * portal command - navigate between applications with terminal-themed integration
 */
export const portalCommand: Command = {
  name: 'portal',
  description: 'Navigate to other applications or get integration code',
  usage: 'portal [destination] | portal --list | portal --embed',
  execute: async (args: string[]): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];

    if (args.length === 0 || args[0] === '--list') {
      // List available portals
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'system',
        content: '  ╔══════════════════════════════════════════╗',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'system',
        content: '  ║         TERMINAL PORTAL NETWORK          ║',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'system',
        content: '  ╚══════════════════════════════════════════╝',
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
        content: '  Available Destinations:',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });

      for (const [key, portal] of Object.entries(portals)) {
        lines.push({
          id: generateId(),
          type: 'output',
          content: `    ${portal.icon} ${key.padEnd(15)} - ${portal.name}`,
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: `       ${portal.description}`,
          timestamp: Date.now(),
        });
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
        content: '  ' + '─'.repeat(44),
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '  Commands:',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '    portal <destination>  - Open portal to destination',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '    portal --embed        - Get return button code',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
    } else if (args[0] === '--embed') {
      // Show embed code
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'system',
        content: '  Terminal Return Button - Embed Code',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '  ' + '─'.repeat(44),
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
        content: '  Add this code to your applications to create a',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '  terminal-themed return button:',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });

      const embedCode = getReturnButtonCode();
      for (const codeLine of embedCode) {
        lines.push({
          id: generateId(),
          type: 'output',
          content: `  ${codeLine}`,
          timestamp: Date.now(),
        });
      }

      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'system',
        content: '  The button will appear in the bottom-right corner',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'system',
        content: '  with a glowing terminal-style effect.',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
    } else {
      // Open portal
      const destination = args[0].toLowerCase() as PortalKey;

      if (!(destination in portals)) {
        lines.push({
          id: generateId(),
          type: 'error',
          content: `Unknown destination: ${args[0]}`,
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: `Available: ${Object.keys(portals).join(', ')}`,
          timestamp: Date.now(),
        });
        return { lines };
      }

      const portal = portals[destination];

      // Show portal animation
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });

      for (const artLine of portalArt) {
        lines.push({
          id: generateId(),
          type: 'system',
          content: artLine,
          timestamp: Date.now(),
        });
      }

      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'system',
        content: `  ${portal.icon} Opening portal to ${portal.name}...`,
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: `  Destination: ${portal.url}`,
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });

      // Actually open the URL
      const fullUrl = portal.url + portal.returnParam;
      setTimeout(() => {
        window.open(fullUrl, '_blank');
      }, 500);

      lines.push({
        id: generateId(),
        type: 'system',
        content: '  Portal opened in new tab. Use return button to come back.',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
    }

    return { lines };
  },
};

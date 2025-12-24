import type { Command, CommandOutput, OutputLine } from '../types/command';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const treeStructure = `
  ~/portfolio
  ├── about/
  │   ├── bio.txt
  │   ├── skills.json
  │   └── contact.md
  ├── projects/
  │   ├── rapidphotoflow/
  │   │   ├── README.md
  │   │   ├── src/
  │   │   └── docs/
  │   └── basedsecurity/
  │       ├── README.md
  │       ├── api/
  │       └── frontend/
  ├── experience/
  │   ├── xcelerate.md
  │   └── envase.md
  ├── themes/
  │   ├── matrix.css
  │   ├── dracula.css
  │   ├── monokai.css
  │   ├── light.css
  │   └── .secret/
  │       └── the-grid.css
  └── .config/
      ├── terminal.json
      └── secrets.enc

  5 directories, 16 files
`;

/**
 * tree command - displays directory structure
 */
export const treeCommand: Command = {
  name: 'tree',
  description: 'Display directory structure',
  usage: 'tree',
  execute: async (): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];

    treeStructure.trim().split('\n').forEach((line) => {
      lines.push({
        id: generateId(),
        type: line.includes('.secret') || line.includes('the-grid') ? 'system' : 'output',
        content: line,
        timestamp: Date.now(),
      });
    });

    return { lines };
  },
};

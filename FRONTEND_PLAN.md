# Frontend Agent Plan - Terminal Portfolio

Build a terminal emulator UI in React + TypeScript that serves as an interactive portfolio homepage.

---

## Setup

```bash
cd C:\Users\bigol\repos\terminal-portfolio
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

---

## File Structure

Create this structure inside `frontend/src/`:

```
src/
├── components/
│   ├── Terminal/
│   │   ├── Terminal.tsx          # Main terminal container
│   │   ├── Terminal.module.css   # Terminal styling
│   │   ├── TerminalInput.tsx     # Input line with prompt
│   │   ├── TerminalOutput.tsx    # Output display area
│   │   └── TerminalLine.tsx      # Single output line
│   └── Prompt/
│       └── Prompt.tsx            # user@portfolio:~$ prompt
├── hooks/
│   ├── useTerminal.ts            # Terminal state management
│   ├── useCommandHistory.ts      # Arrow key history navigation
│   ├── useCommands.ts            # Command registration & execution
│   └── useTheme.ts               # Theme state & persistence
├── commands/
│   ├── index.ts                  # Command registry
│   ├── ls.ts                     # List projects
│   ├── cd.ts                     # Navigate to project
│   ├── cat.ts                    # View project details
│   ├── help.ts                   # Show available commands
│   ├── clear.ts                  # Clear terminal
│   ├── whoami.ts                 # About me info
│   ├── contact.ts                # Contact information
│   ├── theme.ts                  # Change terminal theme
│   └── history.ts                # Show command history
├── services/
│   └── api.ts                    # Backend API calls
├── themes/
│   └── index.ts                  # Theme definitions
├── types/
│   ├── command.ts                # Command types
│   ├── project.ts                # Project types
│   └── theme.ts                  # Theme types
├── App.tsx
├── main.tsx
└── index.css                     # Global styles, CSS variables
```

---

## Type Definitions

### types/command.ts
```typescript
export interface OutputLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp: number;
}

export interface CommandOutput {
  lines: OutputLine[];
  redirect?: string;  // URL for cd command
  clear?: boolean;    // For clear command
}

export interface CommandContext {
  api: typeof import('../services/api').api;
  setTheme: (theme: string) => void;
  history: string[];
  addOutput: (lines: OutputLine[]) => void;
}

export interface Command {
  name: string;
  description: string;
  usage: string;
  execute: (args: string[], context: CommandContext) => Promise<CommandOutput>;
}
```

### types/project.ts
```typescript
export interface Project {
  id: number;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  url: string;
  githubUrl?: string;
  techStack: string[];
  status: 'active' | 'archived' | 'wip';
  featured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}
```

### types/theme.ts
```typescript
export interface Theme {
  name: string;
  displayName: string;
  colors: {
    background: string;
    text: string;
    prompt: string;
    error: string;
    link: string;
    selection: string;
    border: string;
  };
}
```

---

## Core Implementation

### 1. Terminal.tsx - Main Container

```typescript
// Responsibilities:
// - Render terminal window (optional title bar)
// - Auto-scroll to bottom on new output
// - Click anywhere to focus input
// - Apply theme via CSS variables on container

interface TerminalProps {
  welcomeMessage?: string[];
}
```

Key behaviors:
- Use `useRef` for the container and input element
- `useEffect` to scroll to bottom when lines change
- Click handler on container to focus input
- Apply theme colors as inline CSS variables or class

### 2. TerminalInput.tsx - Input Line

```typescript
// Responsibilities:
// - Render prompt + input field
// - Handle Enter to submit command
// - Handle Arrow Up/Down for history
// - Handle Tab for completion (stretch goal)
```

Key behaviors:
- Invisible/styled input field
- `onKeyDown` handler for special keys
- Display cursor (blinking CSS animation)

### 3. useTerminal.ts - State Hook

```typescript
interface UseTerminalReturn {
  lines: OutputLine[];
  input: string;
  setInput: (value: string) => void;
  executeCommand: (command: string) => Promise<void>;
  clearTerminal: () => void;
  isProcessing: boolean;
}
```

### 4. useCommandHistory.ts - History Hook

```typescript
interface UseCommandHistoryReturn {
  history: string[];
  historyIndex: number;
  addToHistory: (command: string) => void;
  navigateHistory: (direction: 'up' | 'down') => string | null;
  resetIndex: () => void;
}
```

- Store in `localStorage` for persistence
- Limit to 100 entries
- Arrow up goes back, arrow down goes forward

### 5. useTheme.ts - Theme Hook

```typescript
interface UseThemeReturn {
  currentTheme: Theme;
  themeName: string;
  setTheme: (name: string) => void;
  availableThemes: string[];
}
```

- Store preference in `localStorage`
- Default to 'matrix' theme

---

## Commands Implementation

### commands/index.ts - Registry
```typescript
import { Command } from '../types/command';
import { helpCommand } from './help';
import { lsCommand } from './ls';
// ... other imports

export const commands: Map<string, Command> = new Map([
  ['help', helpCommand],
  ['ls', lsCommand],
  ['cd', cdCommand],
  ['cat', catCommand],
  ['clear', clearCommand],
  ['whoami', whoamiCommand],
  ['contact', contactCommand],
  ['theme', themeCommand],
  ['history', historyCommand],
  ['echo', echoCommand],
]);

export const getCommand = (name: string): Command | undefined => {
  return commands.get(name.toLowerCase());
};
```

### Command Implementations

#### help.ts
```typescript
// List all commands with descriptions
// Format as aligned table
```

#### ls.ts
```typescript
// No args: list project names in columns
// -l flag: detailed list with description, tech stack
// Fetch from API: GET /api/projects
```

#### cd.ts
```typescript
// Args: project slug
// Find project, get URL, set redirect in output
// Handle in useTerminal: if output.redirect, window.location.href = url
```

#### cat.ts
```typescript
// Args: project slug
// Fetch project details: GET /api/projects/:slug
// Display formatted output with all fields
```

#### clear.ts
```typescript
// Return { clear: true } in output
// useTerminal handles by clearing lines array
```

#### whoami.ts
```typescript
// Fetch: GET /api/about
// Display name, title, bio
// Optional: ASCII art
```

#### contact.ts
```typescript
// Fetch: GET /api/about
// Display email, social links
```

#### theme.ts
```typescript
// No args: list available themes
// With arg: set theme if valid, error if not
```

#### history.ts
```typescript
// Display numbered list of recent commands
// Use context.history
```

#### echo.ts
```typescript
// Return args joined as output
// Easter egg command
```

---

## API Service

### services/api.ts
```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = {
  async getProjects(): Promise<{ projects: Project[] }> {
    const res = await fetch(`${API_BASE}/api/projects`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async getProject(slug: string): Promise<{ project: Project }> {
    const res = await fetch(`${API_BASE}/api/projects/${slug}`);
    if (!res.ok) throw new Error('Project not found');
    return res.json();
  },

  async getAbout(): Promise<About> {
    const res = await fetch(`${API_BASE}/api/about`);
    if (!res.ok) throw new Error('Failed to fetch about');
    return res.json();
  },
};
```

**For development without backend**: Create mock data in `services/mockData.ts` and use that initially.

---

## Themes

### themes/index.ts
```typescript
import { Theme } from '../types/theme';

export const themes: Record<string, Theme> = {
  matrix: {
    name: 'matrix',
    displayName: 'Matrix',
    colors: {
      background: '#0d0d0d',
      text: '#00ff00',
      prompt: '#00ff00',
      error: '#ff0000',
      link: '#00ffff',
      selection: 'rgba(0, 255, 0, 0.3)',
      border: '#00ff00',
    },
  },
  dracula: {
    name: 'dracula',
    displayName: 'Dracula',
    colors: {
      background: '#282a36',
      text: '#f8f8f2',
      prompt: '#50fa7b',
      error: '#ff5555',
      link: '#8be9fd',
      selection: 'rgba(68, 71, 90, 0.5)',
      border: '#6272a4',
    },
  },
  monokai: {
    name: 'monokai',
    displayName: 'Monokai',
    colors: {
      background: '#272822',
      text: '#f8f8f2',
      prompt: '#a6e22e',
      error: '#f92672',
      link: '#66d9ef',
      selection: 'rgba(73, 72, 62, 0.5)',
      border: '#75715e',
    },
  },
  light: {
    name: 'light',
    displayName: 'Light',
    colors: {
      background: '#fafafa',
      text: '#383a42',
      prompt: '#50a14f',
      error: '#e45649',
      link: '#0184bc',
      selection: 'rgba(0, 0, 0, 0.1)',
      border: '#d3d3d3',
    },
  },
};
```

---

## Styling

### index.css - Global Styles
```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --terminal-bg: #0d0d0d;
  --terminal-text: #00ff00;
  --terminal-prompt: #00ff00;
  --terminal-error: #ff0000;
  --terminal-link: #00ffff;
  --terminal-selection: rgba(0, 255, 0, 0.3);
  --terminal-border: #00ff00;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}

body {
  font-family: var(--font-mono);
  background: #000;
  min-height: 100vh;
}

::selection {
  background: var(--terminal-selection);
}
```

### Terminal.module.css - Key Styles
```css
.terminal {
  background: var(--terminal-bg);
  color: var(--terminal-text);
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.4;
  padding: 1rem;
  min-height: 100vh;
  overflow-y: auto;
}

/* Optional CRT effect */
.terminal::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    transparent 50%,
    rgba(0, 0, 0, 0.1) 50%
  );
  background-size: 100% 4px;
  pointer-events: none;
  z-index: 1000;
}

.cursor {
  display: inline-block;
  width: 8px;
  height: 1.2em;
  background: var(--terminal-text);
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

.input {
  background: transparent;
  border: none;
  color: inherit;
  font: inherit;
  outline: none;
  width: 100%;
  caret-color: transparent;
}

.error {
  color: var(--terminal-error);
}

.link {
  color: var(--terminal-link);
  text-decoration: underline;
}
```

---

## Task Checklist

### Phase 1: Setup & Shell
- [ ] Create Vite project with React + TypeScript
- [ ] Set up file structure
- [ ] Create type definitions
- [ ] Build Terminal component (container only)
- [ ] Add basic CSS with theme variables
- [ ] Render welcome message

### Phase 2: Input & State
- [ ] Implement TerminalInput component
- [ ] Create useTerminal hook
- [ ] Create useCommandHistory hook
- [ ] Handle Enter key to "execute" (just echo for now)
- [ ] Handle Arrow keys for history

### Phase 3: Command System
- [ ] Create command registry
- [ ] Implement help command
- [ ] Implement clear command
- [ ] Implement echo command
- [ ] Implement history command

### Phase 4: API Commands
- [ ] Create API service (with mock data fallback)
- [ ] Implement ls command
- [ ] Implement cat command
- [ ] Implement cd command (with redirect)
- [ ] Implement whoami command
- [ ] Implement contact command

### Phase 5: Themes & Polish
- [ ] Create theme definitions
- [ ] Implement useTheme hook
- [ ] Implement theme command
- [ ] Add localStorage persistence
- [ ] Mobile responsive adjustments
- [ ] Loading states for API calls
- [ ] Error handling and display

### Stretch Goals
- [ ] Tab completion
- [ ] Scanline/CRT toggle
- [ ] Sound effects
- [ ] Easter egg commands

---

## Notes

- Start with mock data so you can develop without the backend running
- Keep components small and focused
- Test each command individually before moving on
- The `cd` command should show a "Redirecting to..." message briefly before redirect

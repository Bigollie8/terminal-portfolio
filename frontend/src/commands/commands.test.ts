import { describe, it, expect, vi, beforeEach } from 'vitest';
import { helpCommand } from './help';
import { clearCommand } from './clear';
import { echoCommand } from './echo';
import { historyCommand } from './history';
import { themeCommand } from './theme';
import { lsCommand } from './ls';
import { catCommand } from './cat';
import { cdCommand } from './cd';
import { whoamiCommand } from './whoami';
import { contactCommand } from './contact';
import type { CommandContext } from '../types/command';

// Mock API
const mockProjects = [
  {
    id: 1,
    name: 'Test Project',
    slug: 'test-project',
    description: 'A test project',
    url: 'https://test.com',
    techStack: ['React', 'TypeScript'],
    status: 'active' as const,
    featured: true,
    displayOrder: 1,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

const mockAbout = {
  name: 'Test User',
  title: 'Developer',
  bio: 'Test bio',
  email: 'test@test.com',
  github: 'https://github.com/test',
};

const createMockContext = (): CommandContext => ({
  api: {
    getProjects: vi.fn().mockResolvedValue({ projects: mockProjects }),
    getProject: vi.fn().mockImplementation((slug: string) => {
      const project = mockProjects.find((p) => p.slug === slug);
      if (!project) throw new Error(`Project not found: ${slug}`);
      return Promise.resolve({ project });
    }),
    getAbout: vi.fn().mockResolvedValue(mockAbout),
    getProjectSlugs: vi.fn().mockResolvedValue(['test-project']),
    // Auth API
    register: vi.fn().mockResolvedValue({ token: 'test-token', user: { id: 1, username: 'testuser' } }),
    login: vi.fn().mockResolvedValue({ token: 'test-token', user: { id: 1, username: 'testuser' } }),
    logout: vi.fn().mockResolvedValue(undefined),
    getMe: vi.fn().mockResolvedValue({ user: { id: 1, username: 'testuser' } }),
    // Users API
    getUsers: vi.fn().mockResolvedValue({ users: [] }),
    getUser: vi.fn().mockResolvedValue({ user: { id: 1, username: 'testuser' } }),
    getActiveUsers: vi.fn().mockResolvedValue({ users: [] }),
    updateBio: vi.fn().mockResolvedValue({ user: { id: 1, username: 'testuser' } }),
    // Messages API
    sendMessage: vi.fn().mockResolvedValue({ message: { id: 1 } }),
    getInbox: vi.fn().mockResolvedValue({ messages: [], unreadCount: 0 }),
    getSentMessages: vi.fn().mockResolvedValue({ messages: [] }),
    getMessage: vi.fn().mockResolvedValue({ message: { id: 1, content: 'test' } }),
    deleteMessage: vi.fn().mockResolvedValue(undefined),
    // Wall API
    getWall: vi.fn().mockResolvedValue({ posts: [] }),
    postToWall: vi.fn().mockResolvedValue({ post: { id: 1, content: 'test' } }),
    deleteWallPost: vi.fn().mockResolvedValue(undefined),
  },
  setTheme: vi.fn().mockReturnValue(true),
  history: ['ls', 'help'],
  addOutput: vi.fn(),
  updateLines: vi.fn(),
  createGameCanvas: vi.fn().mockReturnValue([]),
});

describe('Commands', () => {
  let context: CommandContext;

  beforeEach(() => {
    context = createMockContext();
  });

  describe('help', () => {
    it('should list all commands', async () => {
      const result = await helpCommand.execute([], context);

      expect(result.lines.length).toBeGreaterThan(0);
      const content = result.lines.map((l) => l.content).join('\n');
      expect(content).toContain('Available Commands');
      expect(content).toContain('help');
      expect(content).toContain('ls');
    });

    it('should show help for specific command', async () => {
      const result = await helpCommand.execute(['ls'], context);

      const content = result.lines.map((l) => l.content).join('\n');
      expect(content).toContain('ls');
      expect(content).toContain('-l');
    });

    it('should show error for unknown command', async () => {
      const result = await helpCommand.execute(['nonexistent'], context);

      expect(result.lines.some((l) => l.type === 'error')).toBe(true);
    });
  });

  describe('clear', () => {
    it('should return clear flag', async () => {
      const result = await clearCommand.execute([], context);

      expect(result.clear).toBe(true);
      expect(result.lines).toEqual([]);
    });
  });

  describe('echo', () => {
    it('should echo text', async () => {
      const result = await echoCommand.execute(['hello', 'world'], context);

      expect(result.lines[0].content).toBe('hello world');
    });

    it('should handle empty input', async () => {
      const result = await echoCommand.execute([], context);

      expect(result.lines[0].content).toBe('');
    });

    it('should handle easter egg', async () => {
      const result = await echoCommand.execute(['hello'], context);

      expect(result.lines[0].content).toBe('Hello, world!');
    });
  });

  describe('history', () => {
    it('should show command history', async () => {
      const result = await historyCommand.execute([], context);

      const content = result.lines.map((l) => l.content).join('\n');
      expect(content).toContain('ls');
      expect(content).toContain('help');
    });

    it('should show empty history message', async () => {
      context.history = [];
      const result = await historyCommand.execute([], context);

      const content = result.lines.map((l) => l.content).join('\n');
      expect(content).toContain('No commands in history');
    });
  });

  describe('theme', () => {
    it('should list available themes', async () => {
      const result = await themeCommand.execute([], context);

      const content = result.lines.map((l) => l.content).join('\n');
      expect(content).toContain('Available Themes');
      expect(content).toContain('matrix');
      expect(content).toContain('dracula');
    });

    it('should change theme', async () => {
      const result = await themeCommand.execute(['dracula'], context);

      expect(context.setTheme).toHaveBeenCalledWith('dracula');
      const content = result.lines.map((l) => l.content).join('\n');
      expect(content).toContain('Theme changed');
    });

    it('should show error for invalid theme', async () => {
      (context.setTheme as ReturnType<typeof vi.fn>).mockReturnValue(false);
      const result = await themeCommand.execute(['invalid'], context);

      expect(result.lines.some((l) => l.type === 'error')).toBe(true);
    });
  });

  describe('ls', () => {
    it('should list projects', async () => {
      const result = await lsCommand.execute([], context);

      const content = result.lines.map((l) => l.content).join('\n');
      expect(content).toContain('test-project');
    });

    it('should show detailed list with -l flag', async () => {
      const result = await lsCommand.execute(['-l'], context);

      const content = result.lines.map((l) => l.content).join('\n');
      expect(content).toContain('test-project');
      expect(content).toContain('A test project');
      expect(content).toContain('React');
    });
  });

  describe('cat', () => {
    it('should show project details', async () => {
      const result = await catCommand.execute(['test-project'], context);

      const content = result.lines.map((l) => l.content).join('\n');
      expect(content).toContain('Test Project');
      expect(content).toContain('A test project');
      expect(content).toContain('https://test.com');
    });

    it('should show error without arguments', async () => {
      const result = await catCommand.execute([], context);

      expect(result.lines.some((l) => l.type === 'error')).toBe(true);
    });

    it('should show error for unknown project', async () => {
      const result = await catCommand.execute(['unknown'], context);

      expect(result.lines.some((l) => l.type === 'error')).toBe(true);
    });
  });

  describe('cd', () => {
    it('should redirect to project URL', async () => {
      const result = await cdCommand.execute(['test-project'], context);

      expect(result.redirect).toBe('https://test.com');
    });

    it('should show error without arguments', async () => {
      const result = await cdCommand.execute([], context);

      expect(result.lines.some((l) => l.type === 'error')).toBe(true);
      expect(result.redirect).toBeUndefined();
    });

    it('should handle special directories', async () => {
      const result = await cdCommand.execute(['~'], context);

      const content = result.lines.map((l) => l.content).join('\n');
      expect(content).toContain('already home');
      expect(result.redirect).toBeUndefined();
    });
  });

  describe('whoami', () => {
    it('should show profile information', async () => {
      const result = await whoamiCommand.execute([], context);

      const content = result.lines.map((l) => l.content).join('\n');
      expect(content).toContain('Test User');
      expect(content).toContain('Developer');
      expect(content).toContain('Test bio');
    });
  });

  describe('contact', () => {
    it('should show contact information', async () => {
      const result = await contactCommand.execute([], context);

      const content = result.lines.map((l) => l.content).join('\n');
      expect(content).toContain('test@test.com');
      expect(content).toContain('github.com/test');
    });
  });
});

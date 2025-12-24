import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/utils';
import { Terminal } from './Terminal';

// Mock the API service
vi.mock('../../services/api', () => ({
  api: {
    getProjects: vi.fn().mockResolvedValue({
      projects: [
        {
          id: 1,
          name: 'Test Project',
          slug: 'test-project',
          description: 'A test project',
          url: 'https://test.com',
          techStack: ['React'],
          status: 'active',
          featured: false,
          displayOrder: 1,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ],
    }),
    getProject: vi.fn().mockResolvedValue({
      project: {
        id: 1,
        name: 'Test Project',
        slug: 'test-project',
        description: 'A test project',
        url: 'https://test.com',
        techStack: ['React'],
        status: 'active',
        featured: false,
        displayOrder: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    }),
    getAbout: vi.fn().mockResolvedValue({
      name: 'Test User',
      title: 'Developer',
      bio: 'Test bio',
      email: 'test@test.com',
    }),
    getProjectSlugs: vi.fn().mockResolvedValue(['test-project']),
  },
}));

describe('Terminal', () => {
  it('should render welcome message', () => {
    render(<Terminal welcomeMessage={['Welcome to test']} />);

    expect(screen.getByText('Welcome to test')).toBeInTheDocument();
  });

  it('should render input field', () => {
    render(<Terminal />);

    const input = screen.getByRole('textbox', { name: /terminal input/i });
    expect(input).toBeInTheDocument();
  });

  it('should render prompt', () => {
    render(<Terminal />);

    expect(screen.getByText('visitor')).toBeInTheDocument();
    expect(screen.getByText('portfolio')).toBeInTheDocument();
  });

  it('should execute commands on enter', async () => {
    render(<Terminal />);

    const input = screen.getByRole('textbox', { name: /terminal input/i });

    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText(/Available Commands/)).toBeInTheDocument();
    });
  });

  it('should show error for unknown commands', async () => {
    render(<Terminal />);

    const input = screen.getByRole('textbox', { name: /terminal input/i });

    fireEvent.change(input, { target: { value: 'unknowncommand' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText(/Command not found/)).toBeInTheDocument();
    });
  });

  it('should clear input after command execution', async () => {
    render(<Terminal />);

    const input = screen.getByRole('textbox', {
      name: /terminal input/i,
    }) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'echo test' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('should clear terminal with clear command', async () => {
    render(<Terminal welcomeMessage={['Test welcome']} />);

    expect(screen.getByText('Test welcome')).toBeInTheDocument();

    const input = screen.getByRole('textbox', { name: /terminal input/i });

    fireEvent.change(input, { target: { value: 'clear' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.queryByText('Test welcome')).not.toBeInTheDocument();
    });
  });

  it('should handle Ctrl+L to clear', async () => {
    render(<Terminal welcomeMessage={['Test welcome']} />);

    const input = screen.getByRole('textbox', { name: /terminal input/i });

    fireEvent.keyDown(input, { key: 'l', ctrlKey: true });

    await waitFor(() => {
      expect(screen.queryByText('Test welcome')).not.toBeInTheDocument();
    });
  });

  it('should handle Ctrl+C to clear input', () => {
    render(<Terminal />);

    const input = screen.getByRole('textbox', {
      name: /terminal input/i,
    }) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'some text' } });
    expect(input.value).toBe('some text');

    fireEvent.keyDown(input, { key: 'c', ctrlKey: true });
    expect(input.value).toBe('');
  });

  it('should render scanlines when enabled', () => {
    const { container } = render(<Terminal showScanlines={true} />);

    const scanlines = container.querySelector('[class*="scanlines"]');
    expect(scanlines).toBeInTheDocument();
  });

  it('should not render scanlines when disabled', () => {
    const { container } = render(<Terminal showScanlines={false} />);

    const scanlines = container.querySelector('[class*="scanlines"]');
    expect(scanlines).not.toBeInTheDocument();
  });
});

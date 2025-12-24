import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useCommandHistory } from './useCommandHistory';

describe('useCommandHistory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should start with empty history', () => {
    const { result } = renderHook(() => useCommandHistory());
    expect(result.current.history).toEqual([]);
    expect(result.current.historyIndex).toBe(-1);
  });

  it('should add commands to history', () => {
    const { result } = renderHook(() => useCommandHistory());

    act(() => {
      result.current.addToHistory('ls');
    });

    expect(result.current.history).toEqual(['ls']);

    act(() => {
      result.current.addToHistory('cat project');
    });

    expect(result.current.history).toEqual(['ls', 'cat project']);
  });

  it('should not add empty commands', () => {
    const { result } = renderHook(() => useCommandHistory());

    act(() => {
      result.current.addToHistory('');
      result.current.addToHistory('   ');
    });

    expect(result.current.history).toEqual([]);
  });

  it('should not add duplicate consecutive commands', () => {
    const { result } = renderHook(() => useCommandHistory());

    act(() => {
      result.current.addToHistory('ls');
      result.current.addToHistory('ls');
      result.current.addToHistory('ls');
    });

    expect(result.current.history).toEqual(['ls']);
  });

  it('should navigate history with arrow up', () => {
    const { result } = renderHook(() => useCommandHistory());

    act(() => {
      result.current.addToHistory('first');
      result.current.addToHistory('second');
      result.current.addToHistory('third');
    });

    let cmd: string | null;

    act(() => {
      cmd = result.current.navigateHistory('up');
    });

    expect(cmd!).toBe('third');
    expect(result.current.historyIndex).toBe(2);

    act(() => {
      cmd = result.current.navigateHistory('up');
    });

    expect(cmd!).toBe('second');
    expect(result.current.historyIndex).toBe(1);

    act(() => {
      cmd = result.current.navigateHistory('up');
    });

    expect(cmd!).toBe('first');
    expect(result.current.historyIndex).toBe(0);
  });

  it('should navigate history with arrow down', () => {
    const { result } = renderHook(() => useCommandHistory());

    act(() => {
      result.current.addToHistory('first');
      result.current.addToHistory('second');
    });

    // Go up twice
    act(() => {
      result.current.navigateHistory('up');
      result.current.navigateHistory('up');
    });

    expect(result.current.historyIndex).toBe(0);

    // Go down
    let cmd: string | null;
    act(() => {
      cmd = result.current.navigateHistory('down');
    });

    expect(cmd!).toBe('second');
    expect(result.current.historyIndex).toBe(1);

    // Go down again should exit navigation
    act(() => {
      cmd = result.current.navigateHistory('down');
    });

    expect(cmd!).toBe('');
    expect(result.current.historyIndex).toBe(-1);
  });

  it('should reset index', () => {
    const { result } = renderHook(() => useCommandHistory());

    act(() => {
      result.current.addToHistory('test');
      result.current.navigateHistory('up');
    });

    expect(result.current.historyIndex).toBe(0);

    act(() => {
      result.current.resetIndex();
    });

    expect(result.current.historyIndex).toBe(-1);
  });

  it('should persist history to localStorage', () => {
    const { result } = renderHook(() => useCommandHistory());

    act(() => {
      result.current.addToHistory('test-command');
    });

    const stored = localStorage.getItem('terminal-command-history');
    expect(stored).toBe(JSON.stringify(['test-command']));
  });

  it('should load history from localStorage', () => {
    localStorage.setItem(
      'terminal-command-history',
      JSON.stringify(['saved-command'])
    );

    const { result } = renderHook(() => useCommandHistory());
    expect(result.current.history).toEqual(['saved-command']);
  });

  it('should clear history', () => {
    const { result } = renderHook(() => useCommandHistory());

    act(() => {
      result.current.addToHistory('test');
      result.current.clearHistory();
    });

    expect(result.current.history).toEqual([]);
    expect(localStorage.getItem('terminal-command-history')).toBeNull();
  });
});

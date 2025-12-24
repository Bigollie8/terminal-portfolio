import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset CSS variables
    document.documentElement.style.cssText = '';
  });

  it('should start with default matrix theme', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.themeName).toBe('matrix');
    expect(result.current.currentTheme.name).toBe('matrix');
    expect(result.current.currentTheme.displayName).toBe('Matrix');
  });

  it('should list available themes', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.availableThemes).toContain('matrix');
    expect(result.current.availableThemes).toContain('dracula');
    expect(result.current.availableThemes).toContain('monokai');
    expect(result.current.availableThemes).toContain('light');
  });

  it('should change theme', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('dracula');
    });

    expect(result.current.themeName).toBe('dracula');
    expect(result.current.currentTheme.name).toBe('dracula');
  });

  it('should return false for invalid theme', () => {
    const { result } = renderHook(() => useTheme());

    let success: boolean;
    act(() => {
      success = result.current.setTheme('nonexistent');
    });

    expect(success!).toBe(false);
    expect(result.current.themeName).toBe('matrix');
  });

  it('should validate theme names', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.isValidTheme('matrix')).toBe(true);
    expect(result.current.isValidTheme('dracula')).toBe(true);
    expect(result.current.isValidTheme('invalid')).toBe(false);
  });

  it('should persist theme to localStorage', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('monokai');
    });

    expect(localStorage.getItem('terminal-theme')).toBe('monokai');
  });

  it('should load theme from localStorage', () => {
    localStorage.setItem('terminal-theme', 'light');

    const { result } = renderHook(() => useTheme());

    expect(result.current.themeName).toBe('light');
  });

  it('should apply CSS variables to document', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('dracula');
    });

    const root = document.documentElement;
    expect(root.style.getPropertyValue('--terminal-bg')).toBe('#282a36');
    expect(root.style.getPropertyValue('--terminal-text')).toBe('#f8f8f2');
  });

  it('should handle case-insensitive theme names', () => {
    const { result } = renderHook(() => useTheme());

    let success: boolean;
    act(() => {
      success = result.current.setTheme('DRACULA');
    });

    expect(success!).toBe(true);
    expect(result.current.themeName).toBe('dracula');
  });
});

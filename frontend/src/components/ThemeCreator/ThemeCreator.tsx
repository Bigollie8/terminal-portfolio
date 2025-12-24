import React, { useState, useCallback } from 'react';
import { useThemeCreator } from '../../context/ThemeCreatorContext';
import { saveCustomTheme } from '../../themes';
import { triggerSetTheme } from '../../utils/themeCreatorEvent';
import type { Theme } from '../../types/theme';
import styles from './ThemeCreator.module.css';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorInput: React.FC<ColorInputProps> = ({ label, value, onChange }) => (
  <div className={styles.colorRow}>
    <label className={styles.colorLabel}>{label}</label>
    <div className={styles.colorInputWrapper}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.colorPicker}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.colorText}
        placeholder="#000000"
        pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
      />
    </div>
  </div>
);

interface ThemeCreatorProps {
  onThemeCreated?: (themeName: string) => void;
}

export const ThemeCreator: React.FC<ThemeCreatorProps> = ({ onThemeCreated }) => {
  const { isOpen, closeThemeCreator } = useThemeCreator();

  const [themeName, setThemeName] = useState('');
  const [colors, setColors] = useState({
    background: '#0d0d0d',
    text: '#00ff00',
    prompt: '#00ff00',
    error: '#ff5555',
    link: '#00d4ff',
  });
  const [error, setError] = useState('');

  const updateColor = useCallback((key: keyof typeof colors) => (value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleCreate = useCallback(() => {
    // Validate name
    if (!themeName.trim()) {
      setError('Please enter a theme name');
      return;
    }

    if (!/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(themeName)) {
      setError('Name must start with a letter and contain only letters, numbers, hyphens, and underscores');
      return;
    }

    // Validate colors
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    for (const [key, value] of Object.entries(colors)) {
      if (!hexPattern.test(value)) {
        setError(`Invalid color format for ${key}: ${value}`);
        return;
      }
    }

    // Create theme
    const theme: Theme = {
      name: themeName.toLowerCase(),
      displayName: themeName,
      colors: {
        ...colors,
        selection: `${colors.text}33`,
        border: colors.prompt,
      },
    };

    try {
      saveCustomTheme(theme);
      triggerSetTheme(theme.name);
      onThemeCreated?.(theme.name);
      closeThemeCreator();
      // Reset form
      setThemeName('');
      setColors({
        background: '#0d0d0d',
        text: '#00ff00',
        prompt: '#00ff00',
        error: '#ff5555',
        link: '#00d4ff',
      });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create theme');
    }
  }, [themeName, colors, onThemeCreated, closeThemeCreator]);

  const handleCancel = useCallback(() => {
    closeThemeCreator();
    setError('');
  }, [closeThemeCreator]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div
        className={styles.modal}
        style={{
          '--preview-bg': colors.background,
          '--preview-text': colors.text,
          '--preview-prompt': colors.prompt,
          '--preview-error': colors.error,
          '--preview-link': colors.link,
        } as React.CSSProperties}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Create Custom Theme</h2>
          <button className={styles.closeBtn} onClick={handleCancel}>x</button>
        </div>

        <div className={styles.content}>
          <div className={styles.form}>
            <div className={styles.nameRow}>
              <label className={styles.nameLabel}>Theme Name</label>
              <input
                type="text"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                className={styles.nameInput}
                placeholder="my-theme"
              />
            </div>

            <div className={styles.colorSection}>
              <h3 className={styles.sectionTitle}>Colors</h3>
              <ColorInput label="Background" value={colors.background} onChange={updateColor('background')} />
              <ColorInput label="Text" value={colors.text} onChange={updateColor('text')} />
              <ColorInput label="Prompt" value={colors.prompt} onChange={updateColor('prompt')} />
              <ColorInput label="Error" value={colors.error} onChange={updateColor('error')} />
              <ColorInput label="Link" value={colors.link} onChange={updateColor('link')} />
            </div>

            {error && <div className={styles.error}>{error}</div>}
          </div>

          <div className={styles.preview}>
            <h3 className={styles.sectionTitle}>Preview</h3>
            <div className={styles.previewTerminal}>
              <div className={styles.previewLine}>
                <span className={styles.previewPrompt}>guest@terminal</span>
                <span className={styles.previewText}>:~$ </span>
                <span className={styles.previewText}>help</span>
              </div>
              <div className={styles.previewLine}>
                <span className={styles.previewText}>Available commands:</span>
              </div>
              <div className={styles.previewLine}>
                <span className={styles.previewLink}>  help</span>
                <span className={styles.previewText}> - Show this message</span>
              </div>
              <div className={styles.previewLine}>
                <span className={styles.previewError}>Error: Command not found</span>
              </div>
              <div className={styles.previewLine}>
                <span className={styles.previewPrompt}>guest@terminal</span>
                <span className={styles.previewText}>:~$ _</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={handleCancel}>
            Cancel
          </button>
          <button className={styles.createBtn} onClick={handleCreate}>
            Create Theme
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeCreator;

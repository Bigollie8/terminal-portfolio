import React, { useRef, useEffect, useCallback } from 'react';
import { Prompt } from '../Prompt';
import { authStorage } from '../../services/auth';
import styles from './Terminal.module.css';

/**
 * Props for TerminalInput component
 */
export interface TerminalInputProps {
  /** Current input value */
  value: string;
  /** Called when input value changes */
  onChange: (value: string) => void;
  /** Called when Enter is pressed */
  onSubmit: (value: string) => void;
  /** Called when Arrow Up is pressed (for history) */
  onHistoryUp: () => void;
  /** Called when Arrow Down is pressed (for history) */
  onHistoryDown: () => void;
  /** Called when Tab is pressed for auto-completion */
  onTabComplete?: () => void;
  /** Whether input is disabled (processing) */
  disabled?: boolean;
  /** Auto-focus the input */
  autoFocus?: boolean;
  /** Current theme name */
  themeName?: string;
  /** Whether suggestions are currently visible */
  suggestionsVisible?: boolean;
  /** Number of suggestions available */
  suggestionCount?: number;
  /** Called when navigating suggestions up */
  onSuggestionUp?: () => void;
  /** Called when navigating suggestions down */
  onSuggestionDown?: () => void;
  /** Called when selecting current suggestion */
  onSuggestionSelect?: () => void;
  /** Called when dismissing suggestions (Escape) */
  onSuggestionDismiss?: () => void;
}

/**
 * Terminal input line with prompt and blinking cursor
 */
export const TerminalInput: React.FC<TerminalInputProps> = ({
  value,
  onChange,
  onSubmit,
  onHistoryUp,
  onHistoryDown,
  onTabComplete,
  disabled = false,
  autoFocus = true,
  themeName,
  suggestionsVisible = false,
  suggestionCount = 0,
  onSuggestionUp,
  onSuggestionDown,
  onSuggestionSelect,
  onSuggestionDismiss,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount and after command execution completes
  useEffect(() => {
    if (autoFocus && !disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus, disabled]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      const hasSuggestions = suggestionsVisible && suggestionCount > 0;

      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (hasSuggestions && onSuggestionSelect) {
            // Select the highlighted suggestion
            onSuggestionSelect();
          } else {
            // Submit the command
            onSubmit(value);
            onChange('');
          }
          break;

        case 'Tab':
          e.preventDefault();
          if (onTabComplete) {
            onTabComplete();
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (hasSuggestions && onSuggestionUp) {
            // Navigate suggestions
            onSuggestionUp();
          } else {
            // Navigate history
            onHistoryUp();
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (hasSuggestions && onSuggestionDown) {
            // Navigate suggestions
            onSuggestionDown();
          } else {
            // Navigate history
            onHistoryDown();
          }
          break;

        case 'Escape':
          if (hasSuggestions && onSuggestionDismiss) {
            e.preventDefault();
            onSuggestionDismiss();
          }
          break;

        case 'c':
          if (e.ctrlKey) {
            e.preventDefault();
            onChange('');
            if (onSuggestionDismiss) {
              onSuggestionDismiss();
            }
          }
          break;

        case 'l':
          if (e.ctrlKey) {
            e.preventDefault();
            onSubmit('clear');
            onChange('');
          }
          break;
      }
    },
    [
      value,
      onChange,
      onSubmit,
      onHistoryUp,
      onHistoryDown,
      onTabComplete,
      disabled,
      suggestionsVisible,
      suggestionCount,
      onSuggestionUp,
      onSuggestionDown,
      onSuggestionSelect,
      onSuggestionDismiss,
    ]
  );

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled) {
        onChange(e.target.value);
      }
    },
    [onChange, disabled]
  );

  // Focus input when clicking anywhere in the input line
  const handleClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Get username from auth or use default based on theme
  const getUsername = () => {
    const user = authStorage.getUser();
    if (user) return user.username;
    return themeName === 'the-grid' ? 'user' : 'visitor';
  };

  return (
    <div className={styles.inputLine} onClick={handleClick}>
      <Prompt user={getUsername()} />
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={styles.input}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Terminal input"
        />
        <span className={styles.inputDisplay}>
          {value}
          <span className={`${styles.cursor} ${disabled ? styles.cursorHidden : ''}`}>
            &nbsp;
          </span>
        </span>
      </div>
    </div>
  );
};

export default TerminalInput;

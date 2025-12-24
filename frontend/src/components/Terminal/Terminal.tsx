import React, { useRef, useEffect, useCallback, useState } from 'react';
import { TerminalOutput } from './TerminalOutput';
import { TerminalInput } from './TerminalInput';
import { AutocompleteSuggestions } from './AutocompleteSuggestions';
import { useTerminal } from '../../hooks/useTerminal';
import styles from './Terminal.module.css';

/**
 * Props for Terminal component
 */
export interface TerminalProps {
  /** Custom welcome message lines */
  welcomeMessage?: string[];
  /** Whether to show CRT scanline effect */
  showScanlines?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Main terminal container component
 *
 * Features:
 * - Displays output history
 * - Command input with history navigation
 * - Auto-scroll to bottom on new output
 * - Click anywhere to focus input
 * - Theme support via CSS variables
 * - Optional CRT scanline effect
 * - Autocomplete with cycling through suggestions
 */
export const Terminal: React.FC<TerminalProps> = ({
  welcomeMessage,
  showScanlines = true,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  // Terminal state and commands
  const terminal = useTerminal(welcomeMessage);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminal.lines]);

  // Focus input when clicking anywhere in terminal
  const handleContainerClick = useCallback((_e: React.MouseEvent) => {
    // Don't focus if user is selecting text
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }

    // Find and focus the input
    const input = containerRef.current?.querySelector('input');
    if (input) {
      input.focus();
    }
  }, []);

  // Handle history navigation
  const handleHistoryUp = useCallback(() => {
    terminal.navigateHistory('up');
  }, [terminal]);

  const handleHistoryDown = useCallback(() => {
    terminal.navigateHistory('down');
  }, [terminal]);

  // Handle tab completion - cycles through suggestions
  const handleTabComplete = useCallback(async () => {
    if (terminal.suggestions.length === 0) {
      // First tab press - fetch suggestions and apply first one
      await terminal.tabComplete();
      setShowSuggestions(true);
      setSelectedSuggestionIndex(0);
    } else if (terminal.suggestions.length > 0) {
      // Subsequent tab presses - cycle through suggestions
      const nextIndex = (selectedSuggestionIndex + 1) % terminal.suggestions.length;
      setSelectedSuggestionIndex(nextIndex);

      // Apply the selected suggestion
      const suggestion = terminal.suggestions[nextIndex];
      if (suggestion) {
        applyCompletion(suggestion.value);
      }
      setShowSuggestions(true);
    }
  }, [terminal, selectedSuggestionIndex]);

  // Apply a completion value to the input
  const applyCompletion = useCallback((value: string) => {
    const parts = terminal.input.trim().split(/\s+/);
    let newInput: string;

    if (parts.length <= 1 && !terminal.input.includes(' ')) {
      // Completing command name
      newInput = value;
    } else {
      // Completing argument - replace last part or add new
      if (terminal.input.endsWith(' ')) {
        newInput = terminal.input + value;
      } else {
        parts[parts.length - 1] = value;
        newInput = parts.join(' ');
      }
    }

    terminal.setInput(newInput);
  }, [terminal]);

  // Handle input change - update suggestions
  const handleInputChange = useCallback((value: string) => {
    terminal.setInput(value);
    // Show suggestions when typing
    if (value.length > 0) {
      terminal.updateSuggestions(value);
      setShowSuggestions(true);
      setSelectedSuggestionIndex(0);
    } else {
      setShowSuggestions(false);
    }
  }, [terminal]);

  // Hide suggestions on submit
  const handleSubmitWithSuggestions = useCallback(
    async (command: string) => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(0);
      await terminal.executeCommand(command);
    },
    [terminal]
  );

  // Handle selecting a suggestion by clicking
  const handleSelectSuggestion = useCallback((suggestion: { value: string }) => {
    applyCompletion(suggestion.value);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(0);
  }, [applyCompletion]);

  // Navigate suggestions up (wraps around)
  const handleSuggestionUp = useCallback(() => {
    if (terminal.suggestions.length > 0) {
      setSelectedSuggestionIndex(prev =>
        prev <= 0 ? terminal.suggestions.length - 1 : prev - 1
      );
    }
  }, [terminal.suggestions.length]);

  // Navigate suggestions down (wraps around)
  const handleSuggestionDown = useCallback(() => {
    if (terminal.suggestions.length > 0) {
      setSelectedSuggestionIndex(prev =>
        prev >= terminal.suggestions.length - 1 ? 0 : prev + 1
      );
    }
  }, [terminal.suggestions.length]);

  // Select the currently highlighted suggestion
  const handleSuggestionSelect = useCallback(() => {
    const suggestion = terminal.suggestions[selectedSuggestionIndex];
    if (suggestion) {
      applyCompletion(suggestion.value);
    }
    setShowSuggestions(false);
    setSelectedSuggestionIndex(0);
  }, [terminal.suggestions, selectedSuggestionIndex, applyCompletion]);

  // Dismiss suggestions
  const handleSuggestionDismiss = useCallback(() => {
    setShowSuggestions(false);
    setSelectedSuggestionIndex(0);
  }, []);

  const suggestionsVisible = showSuggestions && terminal.suggestions.length > 0;

  return (
    <div
      ref={containerRef}
      className={`${styles.terminal} ${className || ''}`}
      onClick={handleContainerClick}
    >
      {showScanlines && <div className={styles.scanlines} aria-hidden="true" />}

      <div className={styles.content}>
        <TerminalOutput lines={terminal.lines} />

        <div className={styles.inputContainer}>
          <AutocompleteSuggestions
            suggestions={terminal.suggestions}
            selectedIndex={selectedSuggestionIndex}
            isVisible={suggestionsVisible}
            onSelect={handleSelectSuggestion}
          />
          <TerminalInput
            value={terminal.input}
            onChange={handleInputChange}
            onSubmit={handleSubmitWithSuggestions}
            onHistoryUp={handleHistoryUp}
            onHistoryDown={handleHistoryDown}
            onTabComplete={handleTabComplete}
            disabled={terminal.isProcessing}
            themeName={terminal.theme.themeName}
            suggestionsVisible={suggestionsVisible}
            suggestionCount={terminal.suggestions.length}
            onSuggestionUp={handleSuggestionUp}
            onSuggestionDown={handleSuggestionDown}
            onSuggestionSelect={handleSuggestionSelect}
            onSuggestionDismiss={handleSuggestionDismiss}
          />
        </div>

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Terminal;

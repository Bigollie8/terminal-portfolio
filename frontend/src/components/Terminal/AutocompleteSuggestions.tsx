import React from 'react';
import type { CompletionSuggestion } from '../../hooks/useTabComplete';
import styles from './Terminal.module.css';

export interface AutocompleteSuggestionsProps {
  suggestions: CompletionSuggestion[];
  selectedIndex: number;
  isVisible: boolean;
  onSelect?: (suggestion: CompletionSuggestion) => void;
}

/**
 * Visual autocomplete suggestions dropdown
 */
export const AutocompleteSuggestions: React.FC<AutocompleteSuggestionsProps> = ({
  suggestions,
  selectedIndex,
  isVisible,
  onSelect,
}) => {
  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={styles.suggestions}>
      {suggestions.map((suggestion, index) => (
        <div
          key={`${suggestion.value}-${index}`}
          className={`${styles.suggestionItem} ${index === selectedIndex ? styles.suggestionItemSelected : ''}`}
          onClick={() => onSelect?.(suggestion)}
        >
          <span className={styles.suggestionValue}>{suggestion.value}</span>
          <span className={`${styles.suggestionType} ${styles[`suggestionType${suggestion.type}`]}`}>
            {suggestion.type}
          </span>
        </div>
      ))}
      <div className={styles.suggestionHint}>
        Tab to cycle • ↑↓ to navigate • Enter to select • Esc to dismiss
      </div>
    </div>
  );
};

export default AutocompleteSuggestions;

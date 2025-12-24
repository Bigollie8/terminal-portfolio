import React from 'react';
import type { OutputLine } from '../../types/command';
import styles from './Terminal.module.css';

/**
 * Props for TerminalLine component
 */
export interface TerminalLineProps {
  /** The output line to display */
  line: OutputLine;
}

/**
 * Color map for inline color markers
 */
const colorMap: Record<string, string> = {
  cyan: styles.colorCyan,
  orange: styles.colorOrange,
  green: styles.colorGreen,
  purple: styles.colorPurple,
  red: styles.colorRed,
  yellow: styles.colorYellow,
};

/**
 * Parse content with color markers like {cyan}text{/cyan}
 */
const parseColoredContent = (content: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  const regex = /\{(\w+)\}(.*?)\{\/\1\}/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    const colorName = match[1];
    const coloredText = match[2];
    const colorClass = colorMap[colorName];

    if (colorClass) {
      parts.push(
        <span key={key++} className={colorClass}>
          {coloredText}
        </span>
      );
    } else {
      // Unknown color, render as plain text
      parts.push(coloredText);
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [content];
};

/**
 * Check if content has color markers
 */
const hasColorMarkers = (content: string): boolean => {
  return /\{\w+\}.*?\{\/\w+\}/.test(content);
};

/**
 * Single line of terminal output with appropriate styling based on type
 */
export const TerminalLine: React.FC<TerminalLineProps> = ({ line }) => {
  const getClassName = (): string => {
    switch (line.type) {
      case 'input':
        return styles.lineInput;
      case 'error':
        return styles.lineError;
      case 'system':
        return styles.lineSystem;
      case 'output':
      default:
        return styles.lineOutput;
    }
  };

  const content = hasColorMarkers(line.content)
    ? parseColoredContent(line.content)
    : line.content;

  return (
    <div className={`${styles.line} ${getClassName()}`}>
      <pre className={styles.lineContent}>{content}</pre>
    </div>
  );
};

export default TerminalLine;

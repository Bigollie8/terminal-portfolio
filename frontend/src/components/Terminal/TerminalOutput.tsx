import React from 'react';
import type { OutputLine } from '../../types/command';
import { TerminalLine } from './TerminalLine';
import styles from './Terminal.module.css';

/**
 * Props for TerminalOutput component
 */
export interface TerminalOutputProps {
  /** Array of output lines to display */
  lines: OutputLine[];
}

/**
 * Container for all terminal output lines
 */
export const TerminalOutput: React.FC<TerminalOutputProps> = ({ lines }) => {
  return (
    <div className={styles.output}>
      {lines.map((line) => (
        <TerminalLine key={line.id} line={line} />
      ))}
    </div>
  );
};

export default TerminalOutput;

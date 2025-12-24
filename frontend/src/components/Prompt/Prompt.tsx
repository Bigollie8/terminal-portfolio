import React from 'react';
import styles from './Prompt.module.css';

/**
 * Props for Prompt component
 */
export interface PromptProps {
  /** Username to display */
  user?: string;
  /** Host to display */
  host?: string;
  /** Current directory */
  path?: string;
  /** Custom className */
  className?: string;
}

/**
 * Terminal prompt component displaying user@host:path$
 */
export const Prompt: React.FC<PromptProps> = ({
  user = 'visitor',
  host = 'portfolio',
  path = '~',
  className,
}) => {
  return (
    <span className={`${styles.prompt} ${className || ''}`}>
      <span className={styles.user}>{user}</span>
      <span className={styles.separator}>@</span>
      <span className={styles.host}>{host}</span>
      <span className={styles.colon}>:</span>
      <span className={styles.path}>{path}</span>
      <span className={styles.dollar}>$ </span>
    </span>
  );
};

export default Prompt;

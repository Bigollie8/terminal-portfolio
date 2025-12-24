import React, { useState, useEffect, useCallback } from 'react';
import styles from './BootSequence.module.css';

interface BootSequenceProps {
  onComplete: () => void;
}

const STORAGE_KEY = 'terminal-theme';

// Standard boot sequence
const standardBootLines = [
  { text: 'BIOS v2.4.1 - Portfolio Systems Inc.', delay: 0 },
  { text: 'Checking memory... 640K OK', delay: 150 },
  { text: 'Detecting drives...', delay: 300 },
  { text: '  /dev/projects ... found', delay: 450 },
  { text: '  /dev/skills ... found', delay: 550 },
  { text: '  /dev/experience ... found', delay: 650 },
  { text: '', delay: 750 },
  { text: 'Loading kernel modules...', delay: 850 },
  { text: '  [OK] terminal-ui', delay: 950 },
  { text: '  [OK] command-parser', delay: 1050 },
  { text: '  [OK] theme-engine', delay: 1150 },
  { text: '', delay: 1250 },
  { text: 'Starting portfolio services...', delay: 1350 },
  { text: '', delay: 1500 },
];

// ENCOM/Tron boot sequence
const gridBootLines = [
  { text: 'ENCOM OS 12 - MASTER CONTROL PROGRAM', delay: 0 },
  { text: '', delay: 200 },
  { text: 'Initializing Grid connection...', delay: 400 },
  { text: '  [LINK] Sector 7G ... established', delay: 600 },
  { text: '  [LINK] Sector 11 ... established', delay: 750 },
  { text: '  [LINK] I/O Tower ... established', delay: 900 },
  { text: '', delay: 1000 },
  { text: 'Loading system programs...', delay: 1100 },
  { text: '  [EXEC] TRON.exe', delay: 1250 },
  { text: '  [EXEC] CLU.exe', delay: 1400 },
  { text: '  [EXEC] FLYNN.usr', delay: 1550 },
  { text: '', delay: 1650 },
  { text: 'Digitizing user...', delay: 1750 },
  { text: '', delay: 1900 },
];

const standardLogo = `
   ____  __    _____   ____________     __    ___    _   ______
  / __ \\/ /   /  _/ | / / ____/ __ \\   / /   /   |  / | / / __ \\
 / / / / /    / / | |/ / __/ / /_/ /  / /   / /| | /  |/ / / / /
/ /_/ / /____/ /  |   / /___/ _, _/  / /___/ ___ |/ /|  / /_/ /
\\____/_____/___/  |_/_____/_/ |_|  /_____/_/  |_/_/ |_/_____/
`;

const gridLogo = `
  ████████╗██╗  ██╗███████╗     ██████╗ ██████╗ ██╗██████╗
  ╚══██╔══╝██║  ██║██╔════╝    ██╔════╝ ██╔══██╗██║██╔══██╗
     ██║   ███████║█████╗      ██║  ███╗██████╔╝██║██║  ██║
     ██║   ██╔══██║██╔══╝      ██║   ██║██╔══██╗██║██║  ██║
     ██║   ██║  ██║███████╗    ╚██████╔╝██║  ██║██║██████╔╝
     ╚═╝   ╚═╝  ╚═╝╚══════╝     ╚═════╝ ╚═╝  ╚═╝╚═╝╚═════╝
`;

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  // Detect theme from localStorage
  const [isGridTheme] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'the-grid';
    } catch {
      return false;
    }
  });

  const bootLines = isGridTheme ? gridBootLines : standardBootLines;
  const logo = isGridTheme ? gridLogo : standardLogo;

  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [showLogo, setShowLogo] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Handle Enter key press
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' && showPrompt) {
      onComplete();
    }
  }, [showPrompt, onComplete]);

  // Handle touch/click for mobile users
  const handleTouchOrClick = useCallback(() => {
    if (showPrompt) {
      onComplete();
    }
  }, [showPrompt, onComplete]);

  // Listen for keydown
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);


  // Blinking cursor effect
  useEffect(() => {
    if (!showPrompt) return;
    const interval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 530);
    return () => clearInterval(interval);
  }, [showPrompt]);

  useEffect(() => {
    // Show boot lines one by one
    bootLines.forEach((line, index) => {
      setTimeout(() => {
        setVisibleLines(index + 1);
      }, line.delay);
    });

    // Show logo after boot lines
    setTimeout(() => {
      setShowLogo(true);
    }, 2000);

    // Start progress bar
    setTimeout(() => {
      setShowProgress(true);
    }, 2200);

    // Animate progress bar
    const progressStart = 2400;
    const progressDuration = 800;
    const steps = 20;

    for (let i = 0; i <= steps; i++) {
      setTimeout(() => {
        setProgress((i / steps) * 100);
      }, progressStart + (progressDuration / steps) * i);
    }

    // Show the "Press ENTER" prompt
    setTimeout(() => {
      setShowPrompt(true);
    }, 3400);
  }, [bootLines]);

  return (
    <div
      className={`${styles.bootContainer} ${isGridTheme ? styles.gridTheme : ''}`}
      onClick={handleTouchOrClick}
      onTouchEnd={handleTouchOrClick}
      role="button"
      tabIndex={0}
    >
      <div className={styles.bootContent}>
        {bootLines.slice(0, visibleLines).map((line, index) => (
          <div key={index} className={styles.bootLine}>
            {line.text.startsWith('  [OK]') ? (
              <>
                <span className={styles.ok}>  [OK]</span>
                {line.text.substring(6)}
              </>
            ) : line.text.startsWith('  [LINK]') ? (
              <>
                <span className={styles.link}>  [LINK]</span>
                {line.text.substring(8)}
              </>
            ) : line.text.startsWith('  [EXEC]') ? (
              <>
                <span className={styles.exec}>  [EXEC]</span>
                {line.text.substring(8)}
              </>
            ) : (
              line.text
            )}
          </div>
        ))}

        {showLogo && (
          <pre className={styles.logo}>{logo}</pre>
        )}

        {showProgress && (
          <div className={styles.progressContainer}>
            <div className={styles.progressLabel}>
              {isGridTheme ? 'Entering The Grid...' : 'Initializing terminal...'}
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className={styles.progressPercent}>{Math.round(progress)}%</div>
          </div>
        )}

        {showPrompt && (
          <div className={styles.enterPrompt}>
            {isGridTheme ? (
              <>
                <span className={styles.gridPromptText}>PRESS ENTER OR TAP TO ACCESS THE GRID</span>
                <span className={`${styles.cursor} ${cursorVisible ? '' : styles.cursorHidden}`}>_</span>
              </>
            ) : (
              <>
                <span>Press ENTER or tap to continue...</span>
                <span className={`${styles.cursor} ${cursorVisible ? '' : styles.cursorHidden}`}>_</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className={styles.scanlines} />
    </div>
  );
};

export default BootSequence;

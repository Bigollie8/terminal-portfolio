import type { Command, CommandOutput, OutputLine, CommandContext } from '../types/command';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const phrases = [
  'The quick brown fox jumps over the lazy dog',
  'Pack my box with five dozen liquor jugs',
  'How vexingly quick daft zebras jump',
  'The five boxing wizards jump quickly',
  'Sphinx of black quartz judge my vow',
  'Hello world this is a typing test',
  'Programming is the art of telling a computer what to do',
  'Code is like humor when you have to explain it its bad',
  'First solve the problem then write the code',
  'The best error message is the one that never shows up',
];

/**
 * typingtest command - test your typing speed with live feedback
 */
export const typingtestCommand: Command = {
  name: 'typingtest',
  description: 'Test your typing speed',
  usage: 'typingtest',
  execute: async (_args: string[], context: CommandContext): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];

    lines.push({
      id: generateId(),
      type: 'system',
      content: '  ═══════════════════════════════════════',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'system',
      content: '           TYPING SPEED TEST',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'system',
      content: '  ═══════════════════════════════════════',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: '',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: '  Type the following phrase:',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: '',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'system',
      content: `  "${phrase}"`,
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: '',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: '  Press ENTER when done, ESC to cancel.',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: '',
      timestamp: Date.now(),
    });

    // Track typing state
    let typed = '';
    let startTime: number | null = null;
    let completed = false;

    setTimeout(() => {
      // Create canvas for live display: typed text + timer
      const canvasIds = context.createGameCanvas(3);
      const inputLineId = canvasIds[0];
      const timerLineId = canvasIds[1];
      const cursorLineId = canvasIds[2];

      let timerInterval: ReturnType<typeof setInterval> | null = null;

      const updateDisplay = () => {
        // Show what's been typed with color coding
        let displayText = '  > ';
        for (let i = 0; i < typed.length; i++) {
          displayText += typed[i];
        }
        displayText += '█'; // cursor

        const elapsed = startTime ? ((Date.now() - startTime) / 1000).toFixed(1) : '0.0';

        context.updateLines([
          {
            id: inputLineId,
            type: 'output',
            content: displayText,
            timestamp: Date.now(),
          },
          {
            id: timerLineId,
            type: 'output',
            content: startTime ? `  Time: ${elapsed}s` : '  Timer starts on first keypress...',
            timestamp: Date.now(),
          },
          {
            id: cursorLineId,
            type: 'output',
            content: '',
            timestamp: Date.now(),
          },
        ]);
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (completed) return;

        // Ignore modifier keys
        if (e.ctrlKey || e.altKey || e.metaKey) return;

        if (e.key === 'Escape') {
          completed = true;
          if (timerInterval) clearInterval(timerInterval);
          window.removeEventListener('keydown', handleKeyDown);
          context.addOutput([{
            id: generateId(),
            type: 'error',
            content: '  Test cancelled.',
            timestamp: Date.now(),
          }]);
          e.preventDefault();
          return;
        }

        if (!startTime && e.key.length === 1) {
          startTime = Date.now();
          // Start timer display
          timerInterval = setInterval(updateDisplay, 100);
        }

        if (e.key === 'Enter' && typed.length > 0) {
          completed = true;
          if (timerInterval) clearInterval(timerInterval);
          const endTime = Date.now();
          const timeSeconds = (endTime - (startTime || endTime)) / 1000;
          const wordCount = phrase.split(' ').length;
          const wpm = Math.round((wordCount / timeSeconds) * 60);

          // Calculate accuracy
          let correct = 0;
          const minLen = Math.min(typed.length, phrase.length);
          for (let i = 0; i < minLen; i++) {
            if (typed[i] === phrase[i]) correct++;
          }
          const accuracy = Math.round((correct / phrase.length) * 100);

          window.removeEventListener('keydown', handleKeyDown);

          context.addOutput([
            {
              id: generateId(),
              type: 'output',
              content: '',
              timestamp: Date.now(),
            },
            {
              id: generateId(),
              type: 'system',
              content: '  ═══════ RESULTS ═══════',
              timestamp: Date.now(),
            },
            {
              id: generateId(),
              type: 'system',
              content: `  Time: ${timeSeconds.toFixed(2)} seconds`,
              timestamp: Date.now(),
            },
            {
              id: generateId(),
              type: 'system',
              content: `  Speed: ${wpm} WPM`,
              timestamp: Date.now(),
            },
            {
              id: generateId(),
              type: 'system',
              content: `  Accuracy: ${accuracy}%`,
              timestamp: Date.now(),
            },
            {
              id: generateId(),
              type: 'output',
              content: '',
              timestamp: Date.now(),
            },
            {
              id: generateId(),
              type: 'output',
              content: wpm >= 60 ? '  Excellent typing speed!' :
                       wpm >= 40 ? '  Good typing speed!' :
                       wpm >= 20 ? '  Keep practicing!' : '  Nice try! Practice makes perfect.',
              timestamp: Date.now(),
            },
          ]);
          e.preventDefault();
        } else if (e.key === 'Backspace') {
          typed = typed.slice(0, -1);
          updateDisplay();
          e.preventDefault();
        } else if (e.key.length === 1) {
          typed += e.key;
          updateDisplay();
          e.preventDefault();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      updateDisplay();

      // Cleanup after 2 minutes
      setTimeout(() => {
        if (!completed) {
          completed = true;
          if (timerInterval) clearInterval(timerInterval);
          window.removeEventListener('keydown', handleKeyDown);
          context.addOutput([{
            id: generateId(),
            type: 'error',
            content: '  Typing test timed out.',
            timestamp: Date.now(),
          }]);
        }
      }, 120000);
    }, 100);

    return { lines };
  },
};

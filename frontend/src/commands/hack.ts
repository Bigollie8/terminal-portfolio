import type { Command, CommandOutput, OutputLine, CommandContext } from '../types/command';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const hackSteps = [
  { message: 'Initializing hack sequence...', duration: 800 },
  { message: 'Bypassing firewall...', duration: 1200, hasProgress: true },
  { message: 'Accessing mainframe...', duration: 600 },
  { message: 'Decrypting password hash...', duration: 1500, hasProgress: true },
  { message: 'Injecting SQL payload...', duration: 400 },
  { message: 'Escalating privileges...', duration: 800, hasProgress: true },
  { message: 'Downloading secret files...', duration: 2000, hasProgress: true },
  { message: 'Covering tracks...', duration: 600 },
  { message: 'Planting backdoor...', duration: 500 },
];

/**
 * hack command - fake hacking sequence with animated progress
 */
export const hackCommand: Command = {
  name: 'hack',
  description: 'Hack the mainframe',
  usage: 'hack',
  execute: async (_args: string[], context: CommandContext): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];

    lines.push({
      id: generateId(),
      type: 'system',
      content: '> INITIATING HACK PROTOCOL v4.2.0',
      timestamp: Date.now(),
    });
    lines.push({
      id: generateId(),
      type: 'output',
      content: '',
      timestamp: Date.now(),
    });

    setTimeout(() => {
      // Create a 2-line canvas: current step + progress bar
      const canvasIds = context.createGameCanvas(2);
      const stepLineId = canvasIds[0];
      const progressLineId = canvasIds[1];

      let stepIndex = 0;

      const runStep = () => {
        if (stepIndex >= hackSteps.length) {
          // Final output
          context.updateLines([
            { id: stepLineId, type: 'system', content: 'ACCESS GRANTED', timestamp: Date.now() },
            { id: progressLineId, type: 'output', content: '', timestamp: Date.now() },
          ]);

          setTimeout(() => {
            context.addOutput([
              { id: generateId(), type: 'output', content: '', timestamp: Date.now() },
              { id: generateId(), type: 'output', content: 'Just kidding. This is a portfolio website.', timestamp: Date.now() },
              { id: generateId(), type: 'output', content: "Type 'help' to see actual commands.", timestamp: Date.now() },
            ]);
          }, 500);
          return;
        }

        const step = hackSteps[stepIndex];

        if (step.hasProgress) {
          // Animate progress bar
          let progress = 0;
          const progressInterval = setInterval(() => {
            const barWidth = 30;
            const filled = Math.floor((progress / 100) * barWidth);
            const empty = barWidth - filled;
            const bar = `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${progress}%`;

            context.updateLines([
              { id: stepLineId, type: 'output', content: `  ${step.message}`, timestamp: Date.now() },
              { id: progressLineId, type: 'system', content: `  ${bar}`, timestamp: Date.now() },
            ]);

            progress += Math.floor(Math.random() * 15) + 5;
            if (progress >= 100) {
              progress = 100;
              clearInterval(progressInterval);
              context.updateLines([
                { id: stepLineId, type: 'output', content: `  ${step.message} Done!`, timestamp: Date.now() },
                { id: progressLineId, type: 'system', content: `  [${'█'.repeat(30)}] 100%`, timestamp: Date.now() },
              ]);
              setTimeout(() => {
                stepIndex++;
                runStep();
              }, 200);
            }
          }, step.duration / 10);
        } else {
          // Simple step without progress
          context.updateLines([
            { id: stepLineId, type: 'output', content: `  ${step.message}`, timestamp: Date.now() },
            { id: progressLineId, type: 'output', content: '', timestamp: Date.now() },
          ]);

          setTimeout(() => {
            context.updateLines([
              { id: stepLineId, type: 'output', content: `  ${step.message} Done!`, timestamp: Date.now() },
              { id: progressLineId, type: 'output', content: '', timestamp: Date.now() },
            ]);
            setTimeout(() => {
              stepIndex++;
              runStep();
            }, 200);
          }, step.duration);
        }
      };

      runStep();
    }, 300);

    return { lines };
  },
};

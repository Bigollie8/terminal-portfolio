import type { Command, CommandOutput, OutputLine } from '../types/command';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Safely evaluate a math expression
 */
const safeEval = (expression: string): number | null => {
  // Only allow numbers, operators, parentheses, and spaces
  const sanitized = expression.replace(/\s/g, '');
  if (!/^[0-9+\-*/().%^]+$/.test(sanitized)) {
    return null;
  }

  try {
    // Replace ^ with ** for exponentiation
    const jsExpression = sanitized.replace(/\^/g, '**');
    // Use Function constructor for safer eval
    const result = new Function(`return ${jsExpression}`)();
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return result;
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * calc command - simple calculator
 */
export const calcCommand: Command = {
  name: 'calc',
  description: 'Calculate a math expression',
  usage: 'calc <expression>',
  execute: async (args: string[]): Promise<CommandOutput> => {
    const lines: OutputLine[] = [];
    const expression = args.join(' ');

    if (!expression) {
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '  Calculator - Supported operations:',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '  + - * / % ^ ()',
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
        content: '  Examples:',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '    calc 2 + 2',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '    calc (10 + 5) * 3',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '    calc 2 ^ 8',
        timestamp: Date.now(),
      });
      lines.push({
        id: generateId(),
        type: 'output',
        content: '',
        timestamp: Date.now(),
      });
    } else {
      const result = safeEval(expression);

      if (result !== null) {
        lines.push({
          id: generateId(),
          type: 'output',
          content: `  ${expression} = `,
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'system',
          content: `  ${result}`,
          timestamp: Date.now(),
        });
      } else {
        lines.push({
          id: generateId(),
          type: 'error',
          content: `  Error: Invalid expression '${expression}'`,
          timestamp: Date.now(),
        });
        lines.push({
          id: generateId(),
          type: 'output',
          content: '  Use only numbers and operators: + - * / % ^ ()',
          timestamp: Date.now(),
        });
      }
    }

    return { lines };
  },
};

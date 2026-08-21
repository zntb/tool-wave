type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
}

function formatEntry(entry: LogEntry): string {
  const parts = [
    `[${entry.timestamp}]`,
    `[${entry.level.toUpperCase()}]`,
    entry.context ? `[${entry.context}]` : '',
    entry.message,
  ].filter(Boolean);
  return parts.join(' ');
}

function log(
  level: LogLevel,
  message: string,
  context?: string,
  data?: unknown,
): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    data,
  };

  const formatted = formatEntry(entry);

  switch (level) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'debug':
      if (process.env.NODE_ENV === 'development') {
        console.debug(formatted);
      }
      break;
    default:
      console.log(formatted);
  }
}

export const logger = {
  debug: (message: string, context?: string, data?: unknown) =>
    log('debug', message, context, data),
  info: (message: string, context?: string, data?: unknown) =>
    log('info', message, context, data),
  warn: (message: string, context?: string, data?: unknown) =>
    log('warn', message, context, data),
  error: (message: string, context?: string, data?: unknown) =>
    log('error', message, context, data),
};

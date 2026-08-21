type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  context?: string
  data?: Record<string, unknown>
  timestamp: string
}

const LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[LOG_LEVEL]
}

function formatEntry(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`
  const context = entry.context ? ` [${entry.context}]` : ''
  const data = entry.data ? ` ${JSON.stringify(entry.data)}` : ''
  return `${prefix}${context} ${entry.message}${data}`
}

function createLogger(context?: string) {
  return {
    debug(message: string, data?: Record<string, unknown>) {
      if (!shouldLog('debug')) return
      const entry: LogEntry = {
        level: 'debug',
        message,
        context,
        data,
        timestamp: new Date().toISOString(),
      }
      console.debug(formatEntry(entry))
    },

    info(message: string, data?: Record<string, unknown>) {
      if (!shouldLog('info')) return
      const entry: LogEntry = {
        level: 'info',
        message,
        context,
        data,
        timestamp: new Date().toISOString(),
      }
      console.info(formatEntry(entry))
    },

    warn(message: string, data?: Record<string, unknown>) {
      if (!shouldLog('warn')) return
      const entry: LogEntry = {
        level: 'warn',
        message,
        context,
        data,
        timestamp: new Date().toISOString(),
      }
      console.warn(formatEntry(entry))
    },

    error(message: string, error?: unknown, data?: Record<string, unknown>) {
      if (!shouldLog('error')) return
      const entry: LogEntry = {
        level: 'error',
        message,
        context,
        data: {
          ...data,
          ...(error instanceof Error
            ? { error: error.message, stack: error.stack }
            : { error: String(error) }),
        },
        timestamp: new Date().toISOString(),
      }
      console.error(formatEntry(entry))
    },
  }
}

export const logger = createLogger()
export { createLogger }

export abstract class CLELogger {
  abstract debug(...args: any[]): void
  abstract info(...args: any[]): void
  abstract warn(...args: any[]): void
  abstract error(...args: any[]): void
}

// eslint-disable-next-line import/no-mutable-exports
export let logger = console as CLELogger

export function setCLELogger(newLogger: CLELogger) {
  logger = newLogger
}

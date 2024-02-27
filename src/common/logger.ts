export abstract class CLELogger {
  abstract debug(...args: any[]): void
  abstract info(...args: any[]): void
  abstract warn(...args: any[]): void
  abstract error(...args: any[]): void
  abstract log(...args: any[]): void
}

// eslint-disable-next-line import/no-mutable-exports
export let logger = console as CLELogger

export function setCLELogger(newLogger: CLELogger) {
  logger = newLogger
}

export class SilentLogger implements CLELogger {
  debug(..._args: any[]): void {}
  info(..._args: any[]): void {}
  warn(..._args: any[]): void {}
  error(..._args: any[]): void {}
  log(..._args: any[]): void {}
}

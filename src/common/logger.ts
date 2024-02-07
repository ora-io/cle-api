export abstract class CLELogger {
  abstract debug(...args: any[]): void
  abstract info(...args: any[]): void
  abstract warn(...args: any[]): void
  abstract error(...args: any[]): void
}

export class CLEConsoleLogger extends CLELogger {
  debug(...args: any[]) {
    console.debug(...args)
  }

  info(...args: any[]) {
    console.info(...args)
  }

  warn(...args: any[]) {
    console.warn(...args)
  }

  error(...args: any[]) {
    console.error(...args)
  }
}

// eslint-disable-next-line import/no-mutable-exports
export let logger = new CLEConsoleLogger()

export function setCLELogger(newLogger: CLELogger) {
  logger = newLogger
}

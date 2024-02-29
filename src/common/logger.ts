import type { CLELogger } from 'zkwasm-toolchain'
import { logger, setCLELogger } from 'zkwasm-toolchain'

export class SilentLogger implements CLELogger {
  debug(..._args: any[]): void {}
  info(..._args: any[]): void {}
  warn(..._args: any[]): void {}
  error(..._args: any[]): void {}
  log(..._args: any[]): void {}
  write(_msg: string): void {}
}

export {
  logger,
  setCLELogger,
  CLELogger,
}

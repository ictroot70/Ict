/* eslint-disable no-console */
import { captureMonitoringError, captureMonitoringWarning } from './monitoring/sentryTransport'

/**
 * Simple logger to control the output to the console
 *
 * In dev mode — everything is logged
 * In production - only errors
 *
 * Usage:
 * import { logger } from '@/shared/lib/logger'
 *
 * logger.log('[useAuthRestore] Attempting to restore...')
 * logger.warn('[baseQuery] Refresh token expired')
 * logger.error('[auth] Login failed:', error)
 */
const isDev = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args)
    }
  },

  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args)
    }

    captureMonitoringWarning(args)
  },

  error: (...args: unknown[]) => {
    console.error(...args)
    captureMonitoringError(args)
  },

  info: (...args: unknown[]) => {
    if (isDev) {
      console.info(...args)
    }
  },

  debug: (...args: unknown[]) => {
    if (isDev) {
      console.debug(...args)
    }
  },
}

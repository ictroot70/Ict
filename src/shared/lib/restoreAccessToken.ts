import { logger } from '@/shared/lib/logger'

import { refreshAccessToken } from './refresh-access-token'

/**
 * Restores access token via refresh token cookie
 *
 * Business logic is separated from the React hook
 * Pure async function – easy to test
 *
 * @returns {Object} result
 * @returns {string | null} result.accessToken - New access token or null
 * @returns {boolean} result.isAuthenticated - Is the token successfully restored
 */
export async function restoreAccessToken(): Promise<{
  accessToken: string | null
  isAuthenticated: boolean
}> {
  logger.log('[restoreAccessToken] Attempting to restore access token...')
  const result = await refreshAccessToken()

  if (result.isAuthenticated) {
    logger.log('[restoreAccessToken] Access token restored successfully')
  } else {
    logger.log('[restoreAccessToken] No valid refresh token')
  }

  return result
}

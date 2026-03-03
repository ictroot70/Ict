import { API_ROUTES } from '@/shared/api'
import { buildApiUrl } from '@/shared/api/get-api-base-url'
import { logger } from '@/shared/lib'

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
  try {
    logger.log('[restoreAccessToken] Attempting to restore access token...')

    const response = await fetch(buildApiUrl(API_ROUTES.AUTH.UPDATE_TOKENS), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()

      if (data.accessToken) {
        logger.log('[restoreAccessToken] Access token restored successfully')

        return { accessToken: data.accessToken, isAuthenticated: true }
      }

      throw new Error('No accessToken in response')
    }

    if (response.status === 401) {
      logger.log('[restoreAccessToken] No valid refresh token')

      return { accessToken: null, isAuthenticated: false }
    }

    throw new Error(`Unexpected response: ${response.status}`)
  } catch (error) {
    logger.error('[restoreAccessToken] Failed to restore auth:', error)

    return { accessToken: null, isAuthenticated: false }
  }
}

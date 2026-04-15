import { API_ROUTES, refreshAuthTokens } from '@/shared/api'
import { buildApiUrl } from '@/shared/api/get-api-base-url'
import { logger } from '@/shared/lib/logger'
import { isAuthForcedLoggedOut } from '@/shared/lib/storage'

type RestoreTokenError = {
  status?: number
}

async function requestRefresh(
  endpoint: typeof API_ROUTES.AUTH.UPDATE | typeof API_ROUTES.AUTH.UPDATE_TOKENS
) {
  const response = await fetch(buildApiUrl(endpoint), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (response.ok) {
    const data = (await response.json().catch(() => null)) as unknown

    return { data }
  }

  return { error: { status: response.status } satisfies RestoreTokenError }
}

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

    if (isAuthForcedLoggedOut()) {
      logger.log('[restoreAccessToken] Skipping restore due to forced local logout flag')

      return { accessToken: null, isAuthenticated: false }
    }

    const refreshResult = await refreshAuthTokens<RestoreTokenError>(requestRefresh)

    if (refreshResult.accessToken) {
      logger.log('[restoreAccessToken] Access token restored successfully')

      return { accessToken: refreshResult.accessToken, isAuthenticated: true }
    }

    if (refreshResult.status === 401) {
      logger.log('[restoreAccessToken] No valid refresh token')

      return { accessToken: null, isAuthenticated: false }
    }

    throw new Error(
      `Unexpected refresh response: ${
        refreshResult.status === null ? 'unknown status' : refreshResult.status
      }`
    )
  } catch (error) {
    logger.error('[restoreAccessToken] Failed to restore auth:', error)

    return { accessToken: null, isAuthenticated: false }
  }
}

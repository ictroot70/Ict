import { API_ROUTES } from '@/shared/api/api-routes'
import { buildApiUrl } from '@/shared/api/get-api-base-url'
import { logger } from '@/shared/lib/logger'
import { authTokenStorage } from '@/shared/lib/storage/auth-token'

interface AccessTokenResponse {
  accessToken: string
}

export type RefreshAccessTokenError =
  | { status: number; data: unknown }
  | { status: 'FETCH_ERROR'; error: string }

export type AccessTokenRefreshResult =
  | { accessToken: string; isAuthenticated: true }
  | { accessToken: null; isAuthenticated: false; error?: RefreshAccessTokenError }

let refreshRequest: Promise<AccessTokenRefreshResult> | null = null

const isAccessTokenResponse = (value: unknown): value is AccessTokenResponse =>
  typeof value === 'object' &&
  value !== null &&
  'accessToken' in value &&
  typeof value.accessToken === 'string' &&
  value.accessToken.length > 0

async function requestAccessTokenRefresh(): Promise<AccessTokenRefreshResult> {
  try {
    const refreshEndpoints = [
      API_ROUTES.AUTH.UPDATE_TOKENS,
      API_ROUTES.AUTH.GITHUB_UPDATE_TOKENS,
    ] as const

    for (const endpoint of refreshEndpoints) {
      const response = await fetch(buildApiUrl(endpoint), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data: unknown = await response.json()

        if (!isAccessTokenResponse(data)) {
          logger.error(`[refreshAccessToken] No accessToken in response from ${endpoint}`)

          return { accessToken: null, isAuthenticated: false }
        }

        authTokenStorage.setAccessToken(data.accessToken)

        return { accessToken: data.accessToken, isAuthenticated: true }
      }

      if (response.status !== 401) {
        logger.error(
          `[refreshAccessToken] Unexpected response from ${endpoint}: ${response.status}`
        )

        return {
          accessToken: null,
          isAuthenticated: false,
          error: {
            status: response.status,
            data: await response.json().catch(() => null),
          },
        }
      }
    }

    return { accessToken: null, isAuthenticated: false }
  } catch (error) {
    logger.error('[refreshAccessToken] Failed to refresh auth:', error)

    return {
      accessToken: null,
      isAuthenticated: false,
      error: {
        status: 'FETCH_ERROR',
        error: error instanceof Error ? error.message : 'Failed to refresh access token',
      },
    }
  }
}

export function refreshAccessToken(): Promise<AccessTokenRefreshResult> {
  if (refreshRequest) {
    return refreshRequest
  }

  refreshRequest = requestAccessTokenRefresh().finally(() => {
    refreshRequest = null
  })

  return refreshRequest
}

import { API_ROUTES } from '@/shared/api/api-routes'
import { buildApiUrl } from '@/shared/api/get-api-base-url'
import { logger } from '@/shared/lib/logger'
import { authTokenStorage } from '@/shared/lib/storage/auth-token'

interface AccessTokenResponse {
  accessToken: string
}

export interface AccessTokenRefreshResult {
  accessToken: string | null
  isAuthenticated: boolean
}

let refreshRequest: Promise<AccessTokenRefreshResult> | null = null

const isAccessTokenResponse = (value: unknown): value is AccessTokenResponse =>
  typeof value === 'object' &&
  value !== null &&
  'accessToken' in value &&
  typeof value.accessToken === 'string' &&
  value.accessToken.length > 0

async function requestAccessTokenRefresh(): Promise<AccessTokenRefreshResult> {
  try {
    const response = await fetch(buildApiUrl(API_ROUTES.AUTH.UPDATE_TOKENS), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return { accessToken: null, isAuthenticated: false }
    }

    const data: unknown = await response.json()

    if (!isAccessTokenResponse(data)) {
      logger.error('[refreshAccessToken] No accessToken in response')

      return { accessToken: null, isAuthenticated: false }
    }

    authTokenStorage.setAccessToken(data.accessToken)

    return { accessToken: data.accessToken, isAuthenticated: true }
  } catch (error) {
    logger.error('[refreshAccessToken] Failed to refresh auth:', error)

    return { accessToken: null, isAuthenticated: false }
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

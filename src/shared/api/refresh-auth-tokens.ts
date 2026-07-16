import { RefreshTokenResponse } from '@/shared/api/api.types'
import { API_ROUTES } from '@/shared/api/api-routes'

const FALLBACK_REFRESH_STATUSES = new Set([404, 405, 501])

type RefreshEndpoint = typeof API_ROUTES.AUTH.UPDATE | typeof API_ROUTES.AUTH.UPDATE_TOKENS

type RefreshRequestResult<TError> = {
  data?: unknown
  error?: TError
}

type RefreshRequest<TError> = (endpoint: RefreshEndpoint) => Promise<RefreshRequestResult<TError>>

export type RefreshAuthTokensResult<TError> = {
  accessToken: null | string
  error: null | TError
  status: null | number
  usedFallback: boolean
}

function isRefreshTokenResponse(data: unknown): data is RefreshTokenResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'accessToken' in data &&
    typeof (data as { accessToken?: unknown }).accessToken === 'string'
  )
}

function extractNumericStatus(error: unknown): null | number {
  if (!error || typeof error !== 'object' || !('status' in error)) {
    return null
  }

  const status = (error as { status?: unknown }).status

  return typeof status === 'number' ? status : null
}

async function requestSingleRefreshEndpoint<TError>(
  requestRefresh: RefreshRequest<TError>,
  endpoint: RefreshEndpoint
) {
  const result = await requestRefresh(endpoint)

  if (isRefreshTokenResponse(result.data)) {
    return {
      accessToken: result.data.accessToken,
      error: null,
      status: null,
    }
  }

  return {
    accessToken: null,
    error: result.error ?? null,
    status: extractNumericStatus(result.error),
  }
}

export function shouldFallbackToDeprecatedRefresh(status: null | number): boolean {
  return typeof status === 'number' && FALLBACK_REFRESH_STATUSES.has(status)
}

export async function refreshAuthTokens<TError>(
  requestRefresh: RefreshRequest<TError>
): Promise<RefreshAuthTokensResult<TError>> {
  const primaryResult = await requestSingleRefreshEndpoint(requestRefresh, API_ROUTES.AUTH.UPDATE)

  if (primaryResult.accessToken) {
    return { ...primaryResult, usedFallback: false }
  }

  if (!shouldFallbackToDeprecatedRefresh(primaryResult.status)) {
    return { ...primaryResult, usedFallback: false }
  }

  const fallbackResult = await requestSingleRefreshEndpoint(
    requestRefresh,
    API_ROUTES.AUTH.UPDATE_TOKENS
  )

  return { ...fallbackResult, usedFallback: true }
}

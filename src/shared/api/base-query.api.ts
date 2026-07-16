import { API_ROUTES } from '@/shared/api/api-routes'
import { getApiBaseUrl } from '@/shared/api/get-api-base-url'
import { refreshAuthTokens } from '@/shared/api/refresh-auth-tokens'
import { logout } from '@/shared/auth/authSlice'
import { isBrowser } from '@/shared/environment/is-browser'
import { logger } from '@/shared/lib/logger'
import { isAuthForcedLoggedOut } from '@/shared/lib/storage'
import { authTokenStorage } from '@/shared/lib/storage/auth-token'
import { BaseQueryFn, FetchArgs, FetchBaseQueryError, fetchBaseQuery } from '@reduxjs/toolkit/query'
import { Mutex } from 'async-mutex'

const mutex = new Mutex()

function isBlockedByForcedLogout(url: string): boolean {
  return (
    url === API_ROUTES.AUTH.ME ||
    url === API_ROUTES.AUTH.UPDATE ||
    url === API_ROUTES.AUTH.UPDATE_TOKENS
  )
}

const baseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),

  prepareHeaders: headers => {
    let token: null | string = null

    if (isBrowser()) {
      token = authTokenStorage.getAccessToken()
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    return headers
  },
})

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const url = typeof args === 'string' ? args : args.url
  const forcedLogoutActive = isBrowser() && isAuthForcedLoggedOut()

  logger.debug('[baseQuery] Making request to:', url)

  if (forcedLogoutActive && isBlockedByForcedLogout(url)) {
    authTokenStorage.clear()
    api.dispatch(logout())

    return { error: { status: 401, data: 'Forced local logout is active' } }
  }

  await mutex.waitForUnlock()
  let result = await baseQuery(args, api, extraOptions)

  logger.debug('[baseQuery] Request result:', result)
  if (result.error && result.error.status === 401) {
    if (forcedLogoutActive) {
      authTokenStorage.clear()
      api.dispatch(logout())

      return result
    }

    if (!mutex.isLocked()) {
      const release = await mutex.acquire()

      try {
        const refreshResult = await refreshAuthTokens<FetchBaseQueryError>(async endpoint => {
          return await baseQuery(
            { url: endpoint, method: 'POST', credentials: 'include' },
            api,
            extraOptions
          )
        })

        if (refreshResult.accessToken) {
          authTokenStorage.setAccessToken(refreshResult.accessToken)
          result = await baseQuery(args, api, extraOptions)
        } else {
          authTokenStorage.clear()
          api.dispatch(logout())

          if (refreshResult.error) {
            return { error: refreshResult.error }
          }

          return { error: { status: 401, data: 'Session expired' } }
        }
      } finally {
        release()
      }
    } else {
      await mutex.waitForUnlock()
      result = await baseQuery(args, api, extraOptions)
    }
  }

  return result
}

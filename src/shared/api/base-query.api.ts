import { getApiBaseUrl } from '@/shared/api/get-api-base-url'
import { logout } from '@/shared/auth/authSlice'
import { isBrowser } from '@/shared/environment/is-browser'
import { logger } from '@/shared/lib/logger'
import { refreshAccessToken } from '@/shared/lib/refresh-access-token'
import { authTokenStorage } from '@/shared/lib/storage/auth-token'
import { BaseQueryFn, FetchArgs, FetchBaseQueryError, fetchBaseQuery } from '@reduxjs/toolkit/query'
import { Mutex } from 'async-mutex'

const mutex = new Mutex()

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

  logger.debug('[baseQuery] Making request to:', url)
  await mutex.waitForUnlock()
  const accessTokenBeforeRequest = authTokenStorage.getAccessToken()
  let result = await baseQuery(args, api, extraOptions)

  logger.debug('[baseQuery] Request result:', result)
  if (result.error && result.error.status === 401) {
    if (authTokenStorage.getAccessToken() !== accessTokenBeforeRequest) {
      result = await baseQuery(args, api, extraOptions)
    } else if (!mutex.isLocked()) {
      const release = await mutex.acquire()

      try {
        const refreshResult = await refreshAccessToken()

        if (refreshResult.isAuthenticated) {
          result = await baseQuery(args, api, extraOptions)
        } else {
          authTokenStorage.clear()
          api.dispatch(logout())

          return { error: { status: 401, data: 'Session expired' } }
        }
      } finally {
        release()
      }
    } else {
      await mutex.waitForUnlock()

      if (authTokenStorage.hasToken()) {
        result = await baseQuery(args, api, extraOptions)
      } else {
        return { error: { status: 401, data: 'Session expired' } }
      }
    }
  }

  return result
}

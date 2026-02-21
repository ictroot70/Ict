import { RefreshTokenResponse } from '@/shared/api/api.types'
import { API_ROUTES } from '@/shared/api/api-routes'
import { isBrowser } from '@/shared/environment/is-browser'
import { authTokenStorage } from '@/shared/lib/storage/auth-token'
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  QueryReturnValue,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query'
import { Mutex } from 'async-mutex'

const mutex = new Mutex()
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: headers => {
    let token

    if (isBrowser()) {
      token = authTokenStorage.getAccessToken()
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    return headers
  },
})

function isRefreshTokenResponse(data: unknown): data is RefreshTokenResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'accessToken' in data &&
    typeof (data as any).accessToken === 'string'
  )
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const url = typeof args === 'string' ? args : args.url

  console.log('Making request to:', url)
  await mutex.waitForUnlock()
  let result = await baseQuery(args, api, extraOptions)

  console.log('Request result:', result)
  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire()

      try {
        const refreshResult = (await baseQuery(
          { url: API_ROUTES.AUTH.UPDATE_TOKENS, method: 'POST', credentials: 'include' },
          api,
          extraOptions
        )) as QueryReturnValue<unknown, FetchBaseQueryError>

        if (isRefreshTokenResponse(refreshResult.data)) {
          authTokenStorage.setAccessToken(refreshResult.data.accessToken)
          result = await baseQuery(args, api, extraOptions)
        } else {
          authTokenStorage.clear()
          console.warn('Invalid refresh token. Logging out.')

          return refreshResult.error
            ? { error: refreshResult.error }
            : { error: { status: 401, data: 'Unauthorized' } }
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

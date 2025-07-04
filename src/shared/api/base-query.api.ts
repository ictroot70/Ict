import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  QueryReturnValue,
} from '@reduxjs/toolkit/query'
import { fetchBaseQuery } from '@reduxjs/toolkit/query'
import { Mutex } from 'async-mutex'
import { RefreshTokenResponse } from '@/shared/api/api.types'
import { isBrowser } from '@/shared/environment/is-browser'
import { authTokenStorage } from '@/shared/lib/storage/auth-token'

const mutex = new Mutex()
const baseQuery = fetchBaseQuery({
  baseUrl: 'https://inctagram.work/api',
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
  await mutex.waitForUnlock()
  let result = await baseQuery(args, api, extraOptions)
  console.log(result)
  if (result.error && result.error.status === 401) {
    // checking whether the mutex is locked
    if (!mutex.isLocked()) {
      const release = await mutex.acquire()
      try {
        const refreshResult = (await baseQuery(
          { url: '/v1/auth/update-tokens', method: 'POST', credentials: 'include' },
          api,
          extraOptions
        )) as QueryReturnValue<unknown, FetchBaseQueryError>
        // console.log('refreshResult', refreshResult)

        if (isRefreshTokenResponse(refreshResult.data)) {
          authTokenStorage.setAccessToken(refreshResult.data.accessToken)
          // retry the initial query
          result = await baseQuery(args, api, extraOptions)

          console.log(result)
        } else {
          authTokenStorage.clear()
          // Можно сделать logout, редирект, или показать сообщение
          console.warn('Invalid refresh token. Logging out.')
          return refreshResult.error
            ? { error: refreshResult.error }
            : { error: { status: 401, data: 'Unauthorized' } }
        }
      } finally {
        // release must be called once the mutex should be released again.
        release()
      }
    } else {
      // wait until the mutex is available without locking it
      await mutex.waitForUnlock()
      result = await baseQuery(args, api, extraOptions)
    }
  }
  return result
}

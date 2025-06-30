import { createApi } from '@reduxjs/toolkit/query/react'
import {
  GetPublicUsers,
  LoginRequest,
  MeResponse,
  RefreshTokenResponse,
} from '@/services/ict.types'
import { baseQueryWithReauth } from '@/services/ict.base-query'
import { authTokenStorage } from '@/utils/storage'

export const ictApi = createApi({
  reducerPath: 'ictApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Me'],
  endpoints: builder => ({
    getPublicUsers: builder.query<GetPublicUsers, void>({
      query: () => {
        return {
          url: '/v1/public-user',
        }
      },
    }),
    login: builder.mutation<RefreshTokenResponse, LoginRequest>({
      query: body => ({
        url: '/v1/auth/login',
        method: 'POST',
        body,
        credentials: 'include',
      }),

      invalidatesTags: ['Me'],
    }),
    me: builder.query<MeResponse, void>({
      query: () => {
        return {
          url: '/v1/auth/me',
        }
      },
      providesTags: ['Me'],
      transformResponse: (user: MeResponse) => {
        return user
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => {
        return {
          url: '/v1/auth/logout',
          method: 'POST',
          credentials: 'include',
        }
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          authTokenStorage.removeAccessToken()
          dispatch(ictApi.util.invalidateTags(['Me']))
          dispatch(ictApi.util.resetApiState())
        } catch (error) {
          console.error('Logout failed:', error)
        }
      },
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetPublicUsersQuery,
  useLoginMutation,
  useMeQuery,
  useLazyMeQuery,
  useLogoutMutation,
} = ictApi

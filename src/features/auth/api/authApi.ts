import { createApi } from '@reduxjs/toolkit/query/react'
import { authTokenStorage } from '@/shared/lib/storage/auth-token'
import { baseQueryWithReauth } from '@/shared/api/base-query.api'
import { LoginRequest, MeResponse, RefreshTokenResponse } from '@/shared/api/api.types'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Me'],
  endpoints: builder => ({
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
          dispatch(authApi.util.invalidateTags(['Me']))
          dispatch(authApi.util.resetApiState())
        } catch (error) {
          console.error('Logout failed:', error)
        }
      },
    }),
    signup: builder.mutation<
        { message?: string },
        { userName: string; email: string; password: string; baseUrl: string }
    >({
      query: (body) => ({
        url: 'v1/auth/registration',
        method: 'POST',
        body,
      }),
    }),
    confirmRegistration: builder.mutation<any, { confirmationCode: string }>({
      query: (body) => ({
        url: 'v1/auth/registration-confirmation',
        method: 'POST',
        body,
      }),
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useLoginMutation, useMeQuery, useLazyMeQuery, useLogoutMutation, useSignupMutation, useConfirmRegistrationMutation } = authApi

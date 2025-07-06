import { createApi } from '@reduxjs/toolkit/query/react'
import { authTokenStorage } from '@/shared/lib/storage/auth-token'
import { baseQueryWithReauth } from '@/shared/api/base-query.api'
import {
  LoginRequest,
  MeResponse,
  RefreshTokenResponse,
  PasswordRecoveryResendingRequest,
  PasswordRecoveryRequest,
  CheckRecoveryCodeRequest,
  NewPasswordRequest,
} from '@/shared/api/api.types'

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
    passwordRecoveryResending: builder.mutation<void, PasswordRecoveryResendingRequest>({
      query: body => {
        return {
          url: '/v1/auth/password-recovery-resending',
          method: 'POST',
          body,
        }
      },
    }),
    passwordRecovery: builder.mutation<void, PasswordRecoveryRequest>({
      query: body => ({
        url: `/v1/auth/password-recovery`,
        method: 'POST',
        body,
      }),
    }),
    checkRecoveryCode: builder.mutation<void, CheckRecoveryCodeRequest>({
      query: body => ({
        url: `/v1/auth/check-recovery-code`,
        method: 'POST',
        body,
      }),
    }),
    newPassword: builder.mutation<void, NewPasswordRequest>({
      query: body => ({
        url: `/v1/auth/new-password`,
        method: 'POST',
        body,
      }),
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useLoginMutation,
  useMeQuery,
  useLazyMeQuery,
  useLogoutMutation,
  usePasswordRecoveryResendingMutation,
  usePasswordRecoveryMutation,
  useCheckRecoveryCodeMutation,
  useNewPasswordMutation,
} = authApi

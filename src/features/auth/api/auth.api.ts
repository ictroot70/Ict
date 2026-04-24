import {
  API_ROUTES,
  baseQueryWithReauth,
  CheckRecoveryCodeRequest,
  LoginRequest,
  MeResponse,
  NewPasswordRequest,
  PasswordRecoveryRequest,
  PasswordRecoveryResendingRequest,
  RefreshTokenResponse,
} from '@/shared/api'
import { baseApi } from '@/shared/api/base-api'
import { authTokenStorage } from '@/shared/lib'
import { createApi } from '@reduxjs/toolkit/query/react'

export const authApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation<RefreshTokenResponse, LoginRequest>({
      query: body => ({
        url: API_ROUTES.AUTH.LOGIN,
        method: 'POST',
        body,
        credentials: 'include',
      }),

      invalidatesTags: ['Me'],
    }),
    me: builder.query<MeResponse, void>({
      query: () => {
        return {
          url: API_ROUTES.AUTH.ME,
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
          url: API_ROUTES.AUTH.LOGOUT,
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
      query: body => ({
        url: API_ROUTES.AUTH.REGISTRATION,
        method: 'POST',
        body,
      }),
    }),
    confirmRegistration: builder.mutation<any, { confirmationCode: string }>({
      query: body => ({
        url: API_ROUTES.AUTH.REGISTRATION_CONFIRMATION,
        method: 'POST',
        body,
      }),
    }),
    resendEmailVerification: builder.mutation<void, { email: string; baseUrl: string }>({
      query: body => ({
        url: API_ROUTES.AUTH.REGISTRATION_EMAIL_RESENDING,
        method: 'POST',
        body,
      }),
    }),
    passwordRecoveryResending: builder.mutation<void, PasswordRecoveryResendingRequest>({
      query: body => {
        return {
          url: API_ROUTES.AUTH.PASSWORD_RECOVERY_RESENDING,
          method: 'POST',
          body,
        }
      },
    }),
    passwordRecovery: builder.mutation<void, PasswordRecoveryRequest>({
      query: body => ({
        url: API_ROUTES.AUTH.PASSWORD_RECOVERY,
        method: 'POST',
        body,
      }),
    }),
    checkRecoveryCode: builder.mutation<void, CheckRecoveryCodeRequest>({
      query: body => ({
        url: API_ROUTES.AUTH.CHECK_RECOVERY_CODE,
        method: 'POST',
        body,
      }),
    }),
    newPassword: builder.mutation<void, NewPasswordRequest>({
      query: body => ({
        url: API_ROUTES.AUTH.NEW_PASSWORD,
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useMeQuery,
  useLogoutMutation,
  useSignupMutation,
  useConfirmRegistrationMutation,
  useResendEmailVerificationMutation,
  usePasswordRecoveryResendingMutation,
  usePasswordRecoveryMutation,
  useCheckRecoveryCodeMutation,
  useNewPasswordMutation,
} = authApi

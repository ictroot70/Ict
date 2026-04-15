import {
  API_ROUTES,
  CheckRecoveryCodeRequest,
  CheckRecoveryCodeResponse,
  LoginRequest,
  MeResponse,
  NewPasswordRequest,
  PasswordRecoveryRequest,
  PasswordRecoveryResendingRequest,
  RefreshTokenResponse,
} from '@/shared/api'
import { baseApi } from '@/shared/api/base-api'
import { logout, setAuthenticated } from '@/shared/auth/authSlice'
import { authTokenStorage, logger } from '@/shared/lib'
import {
  clearAuthForcedLogout,
  clearAuthSessionHint,
  markAuthForcedLogout,
  markAuthSessionHint,
} from '@/shared/lib/storage'
import { jwtDecode } from 'jwt-decode'

export const authApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation<RefreshTokenResponse, LoginRequest>({
      query: body => ({
        url: API_ROUTES.AUTH.LOGIN,
        method: 'POST',
        body,
        credentials: 'include',
      }),

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled

          if (data.accessToken) {
            let userId: number | undefined

            try {
              const decoded = jwtDecode<{ userId?: number }>(data.accessToken)

              userId = typeof decoded.userId === 'number' ? decoded.userId : undefined
            } catch (decodeError) {
              logger.warn('[login] Failed to decode userId from accessToken:', decodeError)
            }

            authTokenStorage.setAccessToken(data.accessToken)
            clearAuthForcedLogout()
            markAuthSessionHint(userId)
            dispatch(setAuthenticated())
            dispatch(authApi.util.invalidateTags(['Me']))
          }
        } catch (error) {
          logger.error('[login] Failed:', error)
        }
      },
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
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled

          markAuthSessionHint(data.userId)
          dispatch(setAuthenticated())
        } catch (error) {
          clearAuthSessionHint()
          dispatch(logout())
        }
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
        const performClientLogoutCleanup = ({
          markForcedLogout = false,
        }: {
          markForcedLogout?: boolean
        } = {}) => {
          authTokenStorage.clear()
          clearAuthSessionHint()
          if (markForcedLogout) {
            markAuthForcedLogout()
          } else {
            clearAuthForcedLogout()
          }
          dispatch(logout())
          dispatch(authApi.util.invalidateTags(['Me']))
          dispatch(authApi.util.resetApiState())
        }

        try {
          await queryFulfilled

          performClientLogoutCleanup()
        } catch (error) {
          logger.warn('[logout] Server logout failed, applying local cleanup:', error)
          performClientLogoutCleanup({ markForcedLogout: true })
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
    confirmRegistration: builder.mutation<unknown, { confirmationCode: string }>({
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
    checkRecoveryCode: builder.mutation<CheckRecoveryCodeResponse, CheckRecoveryCodeRequest>({
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

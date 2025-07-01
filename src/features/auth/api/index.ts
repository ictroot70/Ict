const AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL + 'v1/auth/'

type RequestOptions = {
  method?: string
  headers?: Record<string, string>
  credentials?: RequestCredentials
  body?: Object
}

const authApi = async (endpoint: string, options: RequestOptions = {}): Promise<Response> => {
  const defaultOptions: RequestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
  }

  const finalOptions = {
    ...defaultOptions,
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  }

  return fetch(`${AUTH_API_BASE_URL}${endpoint}`, finalOptions)
}

export type PasswordRecoveryArgs = {
  email: string
  recaptcha: string
  baseUrl: string
}

export type PasswordRecoveryResendingArgs = {
  email: string
  baseUrl: string
}

export type CheckRecoveryCodeArgs = {
  recoveryCode: string
}

export type NewPasswordArgs = {
  newPassword: string
  recoveryCode: string
}

export const passwordRecovery = (body: PasswordRecoveryArgs) => {
  return authApi('password-recovery', { body })
}

export const passwordRecoveryResending = (body: PasswordRecoveryResendingArgs) => {
  return authApi('password-recovery-resending', { body })
}

export const checkRecoveryCode = (body: CheckRecoveryCodeArgs) => {
  return authApi('check-recovery-code', { body })
}

export const newPassword = (body: NewPasswordArgs) => {
  return authApi('new-password', { body })
}

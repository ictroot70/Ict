export interface LoginRequest {
  email: string
  password: string
}

export interface RefreshTokenResponse {
  accessToken: string
}

export interface FieldError {
  message: string
  field: string
}

export interface BadRequestResponse {
  statusCode: number
  messages: FieldError[]
  error: string
}

export interface MeResponse {
  id: string
  email: string
  name: string
  isBlocked: boolean
}

export interface PasswordRecoveryResendingRequest {
  email: string
  baseUrl: string
}

export interface PasswordRecoveryRequest {
  email: string
  recaptcha: string
  baseUrl: string
}

export interface CheckRecoveryCodeRequest {
  recoveryCode: string
}

export interface NewPasswordRequest {
  newPassword: string
  recoveryCode: string
}

export interface ApiErrorResponse {
  statusCode: number
  messages: Array<{
    message: string
    field: string
  }>
  error: string
}

export type RegistrationErrorResponse = {
  statusCode: number
  messages: {
    message: string
    field: string
  }[]
  error: string
}

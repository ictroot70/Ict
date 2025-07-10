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

export type RegistrationErrorResponse = {
  statusCode: number
  messages: {
    message: string
    field: string
  }[]
  error: string
}
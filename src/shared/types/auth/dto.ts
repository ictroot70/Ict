export interface RegisterInputDto {
  userName: string
  email: string
  password: string
  baseUrl?: string
}

export interface LoginInputDto {
  email: string
  password: string
}

export interface ConfirmationCodeInputDto {
  confirmationCode: string
}

export interface RegistrationEmailResendingInputDto {
  email: string
  baseUrl?: string
}

export interface TokenTypeSwaggerDto {
  accessToken: string
}

export interface PasswordRecoveryInputDto {
  email: string
  recaptcha: string
  baseUrl?: string
}

export interface PasswordRecoveryResendingInputDto {
  email: string
  baseUrl?: string
}

export interface PasswordRecoveryCodeInputDto {
  recoveryCode: string
}

export interface PasswordRecoveryViewDto {
  email: string
}

export interface NewPasswordInputDto {
  newPassword: string
  recoveryCode: string
}

export interface FieldError {
  message: string
  field: string
}

export interface ApiErrorResultDto {
  statusCode: number
  messages: FieldError[]
  error: string
}

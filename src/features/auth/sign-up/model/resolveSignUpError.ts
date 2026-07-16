import { REGISTRATION_MESSAGES } from '@/shared/constant'

type ApiMessage = {
  field?: string
  message?: string
}

type SignUpApiError = {
  status?: number
  data?: {
    messages?: ApiMessage[]
  }
}

export type SignUpFieldError = {
  field: 'email' | 'password' | 'username'
  message: string
}

type SignUpErrorResolution = {
  fieldErrors: SignUpFieldError[]
  serverError: string
  toastMessage: string
}

const DEFAULT_REGISTRATION_ERROR = 'Registration failed'
const FIELD_ERROR_TOAST = 'Please check highlighted fields.'

export function resolveSignUpError(error: unknown): SignUpErrorResolution {
  const apiError = (error ?? {}) as SignUpApiError
  const status = apiError.status
  const messages = Array.isArray(apiError.data?.messages) ? apiError.data.messages : []

  if (status === 400 && messages.length > 0) {
    const fieldErrors = messages.reduce<SignUpFieldError[]>((acc, message) => {
      if (message.field === 'userName' || message.field === 'username') {
        acc.push({
          field: 'username',
          message: REGISTRATION_MESSAGES.USERNAME_EXISTS,
        })

        return acc
      }

      if (message.field === 'email') {
        acc.push({
          field: 'email',
          message: REGISTRATION_MESSAGES.EMAIL_EXISTS,
        })

        return acc
      }

      if (message.field === 'password') {
        acc.push({
          field: 'password',
          message: message.message || DEFAULT_REGISTRATION_ERROR,
        })
      }

      return acc
    }, [])

    return {
      fieldErrors,
      serverError: '',
      toastMessage: fieldErrors.length > 0 ? FIELD_ERROR_TOAST : DEFAULT_REGISTRATION_ERROR,
    }
  }

  if (status === 429) {
    const serverError = 'Too many requests. Please wait a moment and try again.'

    return {
      fieldErrors: [],
      serverError,
      toastMessage: serverError,
    }
  }

  const serverError = `Registration failed. Server returned status: ${status || 'unknown'}`

  return {
    fieldErrors: [],
    serverError,
    toastMessage: serverError,
  }
}

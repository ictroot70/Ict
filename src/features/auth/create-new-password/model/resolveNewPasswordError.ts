type ApiMessage = {
  field?: string
  message?: string
}

type NewPasswordApiError = {
  status?: number
  data?: {
    messages?: ApiMessage[] | string
  }
}

export type NewPasswordFieldError = {
  field: 'password'
  message: string
}

type NewPasswordErrorResolution = {
  fieldErrors: NewPasswordFieldError[]
  toastMessage: string
  shouldRedirectToEmailExpired: boolean
}

const DEFAULT_NEW_PASSWORD_ERROR =
  'Password change failed. Please try again or request a new reset link.'
const EXPIRED_LINK_MESSAGE =
  'The recovery link is invalid or expired. Please request a new reset link.'
const PASSWORD_COMPLEXITY_MESSAGE =
  'Password must include lowercase, uppercase, digit, and special character.'

function normalizePasswordMessage(rawMessage: string): string {
  const normalized = rawMessage.trim()
  const lower = normalized.toLowerCase()

  if (
    lower.includes('latin letters') ||
    lower.includes('special characters') ||
    lower.includes('must contain')
  ) {
    return PASSWORD_COMPLEXITY_MESSAGE
  }

  return normalized
}

function isExpiredRecoverySignal(field: string | undefined, message: string): boolean {
  const normalizedField = (field || '').toLowerCase()
  const normalizedMessage = message.toLowerCase()

  return (
    normalizedField.includes('recovery') ||
    normalizedField.includes('code') ||
    normalizedMessage.includes('recovery code') ||
    normalizedMessage.includes('expired') ||
    normalizedMessage.includes('invalid link')
  )
}

export function resolveNewPasswordError(error: unknown): NewPasswordErrorResolution {
  const apiError = (error ?? {}) as NewPasswordApiError
  const status = apiError.status
  const rawMessages = apiError.data?.messages
  const messages = Array.isArray(rawMessages) ? rawMessages : []

  let shouldRedirectToEmailExpired = status === 404 || status === 410
  const fieldErrors: NewPasswordFieldError[] = []

  for (const item of messages) {
    const field = item?.field
    const message = typeof item?.message === 'string' ? item.message : ''

    if (!message) {
      continue
    }

    if (isExpiredRecoverySignal(field, message)) {
      shouldRedirectToEmailExpired = true
    }

    if (field === 'newPassword' || field === 'password') {
      fieldErrors.push({
        field: 'password',
        message: normalizePasswordMessage(message),
      })
    }
  }

  if (shouldRedirectToEmailExpired) {
    return {
      fieldErrors: [],
      toastMessage: EXPIRED_LINK_MESSAGE,
      shouldRedirectToEmailExpired: true,
    }
  }

  if (fieldErrors.length > 0) {
    return {
      fieldErrors,
      toastMessage: fieldErrors[0].message,
      shouldRedirectToEmailExpired: false,
    }
  }

  if (typeof rawMessages === 'string' && rawMessages.trim()) {
    return {
      fieldErrors: [],
      toastMessage: rawMessages.trim(),
      shouldRedirectToEmailExpired: false,
    }
  }

  const firstMessage = messages.find(item => typeof item?.message === 'string')?.message

  return {
    fieldErrors: [],
    toastMessage: firstMessage?.trim() || DEFAULT_NEW_PASSWORD_ERROR,
    shouldRedirectToEmailExpired: false,
  }
}

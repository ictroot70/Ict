export type PaymentErrorCode = 'bad_request' | 'not_found' | 'conflict' | 'unknown'

type ErrorWithStatus = {
  status?: number | string
}

const paymentErrorMessages: Record<PaymentErrorCode, string> = {
  bad_request: 'Invalid payment request. Please try again.',
  not_found: 'Selected subscription plan was not found.',
  conflict: 'This subscription is already active.',
  unknown: 'Transaction failed, please try again.',
}

export function getPaymentErrorMessage(code: PaymentErrorCode): string {
  return paymentErrorMessages[code]
}

export function getErrorStatus(error: unknown): number | null {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as ErrorWithStatus).status

    return typeof status === 'number' ? status : null
  }

  return null
}

export function mapStatusToErrorCode(status: number | null): PaymentErrorCode {
  if (status === 400) {
    return 'bad_request'
  }
  if (status === 404) {
    return 'not_found'
  }
  if (status === 409) {
    return 'conflict'
  }

  return 'unknown'
}

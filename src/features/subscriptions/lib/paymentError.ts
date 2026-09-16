type ErrorCode = 'bad_request' | 'unauthorized' | 'not_found' | 'conflict' | 'unknown'

type ErrorWithStatus = {
  status?: number | string
}

const paymentErrorMessages: Record<ErrorCode, string> = {
  bad_request: 'Invalid payment request. Please try again.',
  unauthorized: 'Session expired. Please sign in again.',
  not_found: 'Selected subscription plan was not found.',
  conflict: 'This subscription is already active.',
  unknown: 'Transaction failed, please try again.',
}

export function getErrorStatus(error: unknown): number | null {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as ErrorWithStatus).status

    if (typeof status === 'number') {
      return status
    }
    if (typeof status === 'string') {
      return Number(status) || null
    }
  }

  return null
}

const statusToCodeMap: Record<number, ErrorCode> = {
  400: 'bad_request',
  401: 'unauthorized',
  404: 'not_found',
  409: 'conflict',
}

export function mapStatusToErrorCode(status: number | null): ErrorCode {
  if (!status) {
    return 'unknown'
  }

  return statusToCodeMap[status] ?? 'unknown'
}

export function getPaymentErrorMessage(error: unknown): string {
  const status = getErrorStatus(error)
  const code = mapStatusToErrorCode(status)

  return paymentErrorMessages[code]
}

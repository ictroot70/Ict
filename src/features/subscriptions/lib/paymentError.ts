export type PaymentErrorCode = 'bad_request' | 'unauthorized' | 'not_found' | 'conflict' | 'unknown'

type ErrorWithStatus = {
  status?: number | string
}

export function getErrorStatus(error: unknown): number | null {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as ErrorWithStatus).status

    return typeof status === 'number' ? status : null
  }

  return null
}

export function mapStatusToErrorCode(status: number | null): PaymentErrorCode {
  if (status === 400) return 'bad_request'
  if (status === 401) return 'unauthorized'
  if (status === 404) return 'not_found'
  if (status === 409) return 'conflict'

  return 'unknown'
}

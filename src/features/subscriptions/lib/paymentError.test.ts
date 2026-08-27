import { describe, expect, it } from 'vitest'

import { getErrorStatus, mapStatusToErrorCode } from './paymentError'

describe('paymentError', () => {
  it('maps statuses to payment error codes', () => {
    expect(mapStatusToErrorCode(400)).toBe('bad_request')
    expect(mapStatusToErrorCode(401)).toBe('unauthorized')
    expect(mapStatusToErrorCode(404)).toBe('not_found')
    expect(mapStatusToErrorCode(409)).toBe('conflict')
    expect(mapStatusToErrorCode(500)).toBe('unknown')
    expect(mapStatusToErrorCode(null)).toBe('unknown')
  })

  it('extracts numeric status from error-like objects', () => {
    expect(getErrorStatus({ status: 400 })).toBe(400)
    expect(getErrorStatus({ status: '400' })).toBe(400)
    expect(getErrorStatus({})).toBeNull()
    expect(getErrorStatus(null)).toBeNull()
  })
})

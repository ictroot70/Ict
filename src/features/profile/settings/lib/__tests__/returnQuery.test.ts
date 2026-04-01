import { describe, expect, it } from 'vitest'
import { parsePaymentReturn } from '../returnQuery'

describe('parsePaymentReturn', () => {
  it('returns "success" when success=true', () => {
    expect(parsePaymentReturn(new URLSearchParams('success=true'))).toBe('success')
  })

  it('returns "failed" when success=false', () => {
    expect(parsePaymentReturn(new URLSearchParams('success=false'))).toBe('failed')
  })

  it('returns null when no success param', () => {
    expect(parsePaymentReturn(new URLSearchParams(''))).toBeNull()
  })

  it('returns null for unknown value', () => {
    expect(parsePaymentReturn(new URLSearchParams('success=maybe'))).toBeNull()
  })
})

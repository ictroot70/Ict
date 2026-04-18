import { describe, expect, it } from 'vitest'

import { resolveProfileSsrFailureMode } from './profile-ssr'

describe('resolveProfileSsrFailureMode', () => {
  it('returns not_found for 404 errors', () => {
    expect(resolveProfileSsrFailureMode({ status: 404 })).toBe('not_found')
  })

  it('returns recovery for non-404 errors', () => {
    expect(resolveProfileSsrFailureMode({ status: 500 })).toBe('recovery')
    expect(resolveProfileSsrFailureMode({ status: 401 })).toBe('recovery')
  })

  it('returns recovery for unknown errors', () => {
    expect(resolveProfileSsrFailureMode(new Error('network failed'))).toBe('recovery')
    expect(resolveProfileSsrFailureMode(null)).toBe('recovery')
  })
})

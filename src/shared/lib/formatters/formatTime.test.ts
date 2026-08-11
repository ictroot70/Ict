import { describe, expect, it } from 'vitest'

import { formatTime } from './formatTime'

describe('formatTime', () => {
  it('formats a valid date as hours and minutes', () => {
    const date = new Date(2026, 7, 4, 12, 34)

    expect(formatTime(date.toISOString())).toBe('12:34 PM')
  })

  it.each([null, '', 'not-a-date'])('returns an empty string for %s', value => {
    expect(formatTime(value)).toBe('')
  })
})

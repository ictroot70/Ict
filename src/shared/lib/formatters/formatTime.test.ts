import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { formatDialogueActivity, formatTime } from './formatTime'

describe('formatTime', () => {
  it('formats a valid date as hours and minutes', () => {
    const date = new Date(2026, 7, 4, 12, 34)

    expect(formatTime(date.toISOString())).toBe('12:34 PM')
  })

  it.each([null, '', 'not-a-date'])('returns an empty string for %s', value => {
    expect(formatTime(value)).toBe('')
  })
})

describe('formatDialogueActivity', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 7, 11, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns time for activity within 24 hours', () => {
    const date = new Date(2026, 7, 11, 9, 24)

    expect(formatDialogueActivity(date.toISOString())).toBe('09:24 AM')
  })

  it('returns a date label for activity older than 24 hours', () => {
    const date = new Date(2026, 7, 9, 9, 24)

    expect(formatDialogueActivity(date.toISOString())).toMatch(/Aug/)
  })
})

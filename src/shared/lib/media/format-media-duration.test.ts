import { describe, expect, it } from 'vitest'

import { formatMediaDuration } from './format-media-duration'

describe('formatMediaDuration', () => {
  it.each([
    [0, '0:00'],
    [9, '0:09'],
    [60, '1:00'],
    [125.9, '2:05'],
    [-5, '0:00'],
  ])('formats %s seconds as %s', (value, expected) => {
    expect(formatMediaDuration(value)).toBe(expected)
  })

  it('pads minutes when requested by the voice-message design', () => {
    expect(formatMediaDuration(151, true)).toBe('02:31')
    expect(formatMediaDuration(15, true)).toBe('00:15')
  })
})

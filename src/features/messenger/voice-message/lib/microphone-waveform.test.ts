import { describe, expect, it } from 'vitest'

import { createSilentWaveform, getMicrophoneBarHeight } from './microphone-waveform'

describe('microphone waveform', () => {
  it('renders minimum-height bars for silence', () => {
    expect(getMicrophoneBarHeight(new Uint8Array(256).fill(128))).toBe(8)
    expect(createSilentWaveform()).toHaveLength(112)
    expect(new Set(createSilentWaveform())).toEqual(new Set([8]))
  })

  it('renders high bars for a loud signal', () => {
    const samples = Uint8Array.from({ length: 256 }, (_, index) => (index % 2 === 0 ? 0 : 255))

    expect(getMicrophoneBarHeight(samples)).toBe(100)
  })
})

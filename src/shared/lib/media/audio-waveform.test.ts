import { describe, expect, it } from 'vitest'

import {
  AUDIO_WAVEFORM_BAR_COUNT,
  AUDIO_WAVEFORM_MIN_BAR_HEIGHT,
  createSilentAudioWaveform,
  getAudioWaveformBarHeights,
} from './audio-waveform'

describe('audio waveform', () => {
  it('creates a silent waveform with the messenger bar contract', () => {
    expect(createSilentAudioWaveform()).toHaveLength(AUDIO_WAVEFORM_BAR_COUNT)
    expect(new Set(createSilentAudioWaveform())).toEqual(new Set([AUDIO_WAVEFORM_MIN_BAR_HEIGHT]))
  })

  it('builds deterministic RMS-based bars from audio samples', () => {
    const samples = new Float32Array([0, 0, 0, 0, 0.2, -0.2, 0.2, -0.2, 0.8, -0.8, 0.8, -0.8])

    const bars = getAudioWaveformBarHeights(samples, 3)

    expect(bars).toEqual([12, 42, 100])
  })

  it('keeps silence at the minimum bar height', () => {
    expect(getAudioWaveformBarHeights(new Float32Array(12), 3)).toEqual([
      AUDIO_WAVEFORM_MIN_BAR_HEIGHT,
      AUDIO_WAVEFORM_MIN_BAR_HEIGHT,
      AUDIO_WAVEFORM_MIN_BAR_HEIGHT,
    ])
  })
})

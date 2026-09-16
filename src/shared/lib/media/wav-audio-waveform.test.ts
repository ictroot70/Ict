import { describe, expect, it } from 'vitest'

import { getAudioWaveformBarHeights } from './audio-waveform'
import { getAudioWaveformFromPcm16Wav, getPcm16WavSamples } from './wav-audio-waveform'

const createPcm16WavBuffer = (samples: readonly number[], channels = 1) => {
  const bytesPerSample = 2
  const sampleRate = 16_000
  const dataSize = samples.length * bytesPerSample
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)
  const writeText = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index))
    }
  }

  writeText(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeText(8, 'WAVE')
  writeText(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * channels * bytesPerSample, true)
  view.setUint16(32, channels * bytesPerSample, true)
  view.setUint16(34, 16, true)
  writeText(36, 'data')
  view.setUint32(40, dataSize, true)

  samples.forEach((sample, index) => {
    view.setInt16(44 + index * bytesPerSample, sample, true)
  })

  return buffer
}

describe('wav audio waveform', () => {
  it('extracts PCM16 samples from a WAV buffer', () => {
    const samples = getPcm16WavSamples(createPcm16WavBuffer([0, 16_384, -16_384]))

    expect(Array.from(samples ?? [])).toEqual([0, 0.5, -0.5])
  })

  it('builds the same waveform as the shared sample algorithm', () => {
    const sourceSamples = [0, 0, 0, 0, 8192, -8192, 8192, -8192]
    const expectedSamples = new Float32Array(sourceSamples.map(sample => sample / 32768))

    expect(getAudioWaveformFromPcm16Wav(createPcm16WavBuffer(sourceSamples), 2)).toEqual(
      getAudioWaveformBarHeights(expectedSamples, 2)
    )
  })

  it('rejects non-WAV buffers', () => {
    expect(getAudioWaveformFromPcm16Wav(new ArrayBuffer(12))).toBeNull()
  })
})

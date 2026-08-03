import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createVoiceFile,
  encodePcm16Wav,
  getSupportedRecordingFormat,
  isVoiceFileWithinSizeLimit,
  MAX_VOICE_SIZE_BYTES,
  normalizeVoiceRecording,
  NORMALIZED_VOICE_SAMPLE_RATE,
} from './voice-recorder'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('voice recorder helpers', () => {
  it('selects the first recording format supported by the browser', () => {
    vi.stubGlobal('MediaRecorder', {
      isTypeSupported: vi.fn((mimeType: string) => mimeType === 'audio/ogg;codecs=opus'),
    })

    expect(getSupportedRecordingFormat()).toEqual({
      mimeType: 'audio/ogg;codecs=opus',
      extension: 'ogg',
    })
  })

  it.each([
    ['audio/aac', 'aac'],
    ['audio/mp4', 'm4a'],
    ['audio/mpeg', 'mp3'],
    ['audio/ogg', 'ogg'],
    ['audio/wav', 'wav'],
    ['audio/webm', 'webm'],
  ])('accepts Swagger recording format %s', (mimeType, extension) => {
    vi.stubGlobal('MediaRecorder', {
      isTypeSupported: vi.fn((candidate: string) => candidate === mimeType),
    })

    expect(getSupportedRecordingFormat()).toEqual({ mimeType, extension })
  })

  it('returns null when MediaRecorder is unavailable', () => {
    vi.stubGlobal('MediaRecorder', undefined)

    expect(getSupportedRecordingFormat()).toBeNull()
  })

  it('creates a voice file with the selected MIME type and extension', () => {
    vi.spyOn(Date, 'now').mockReturnValue(123)

    const file = createVoiceFile([new Blob(['voice'])], {
      mimeType: 'audio/webm',
      extension: 'webm',
    })

    expect(file.name).toBe('voice-message-123.webm')
    expect(file.type).toBe('audio/webm')
    expect(file.size).toBe(5)
  })

  it('rejects a file larger than 3 MB', () => {
    const validFile = new File([new Uint8Array(MAX_VOICE_SIZE_BYTES)], 'valid.webm')
    const oversizedFile = new File([new Uint8Array(MAX_VOICE_SIZE_BYTES + 1)], 'oversized.webm')

    expect(isVoiceFileWithinSizeLimit(validFile)).toBe(true)
    expect(isVoiceFileWithinSizeLimit(oversizedFile)).toBe(false)
  })

  it('writes a PCM WAV header with explicit duration metadata', () => {
    const samples = new Float32Array(NORMALIZED_VOICE_SAMPLE_RATE * 2)
    const wav = encodePcm16Wav(samples, NORMALIZED_VOICE_SAMPLE_RATE)
    const view = new DataView(wav)
    const readText = (offset: number, length: number) =>
      Array.from({ length }, (_, index) => String.fromCharCode(view.getUint8(offset + index))).join(
        ''
      )

    expect(readText(0, 4)).toBe('RIFF')
    expect(readText(8, 4)).toBe('WAVE')
    expect(readText(36, 4)).toBe('data')
    expect(view.getUint16(22, true)).toBe(1)
    expect(view.getUint32(24, true)).toBe(NORMALIZED_VOICE_SAMPLE_RATE)
    expect(view.getUint16(34, true)).toBe(16)
    expect(view.getUint32(40, true)).toBe(samples.length * 2)
    expect(wav.byteLength).toBe(44 + samples.length * 2)
  })

  it('keeps a normalized 60-second recording below the 3 MB limit', () => {
    const minuteOfSamples = new Float32Array(NORMALIZED_VOICE_SAMPLE_RATE * 60)
    const wav = encodePcm16Wav(minuteOfSamples, NORMALIZED_VOICE_SAMPLE_RATE)

    expect(wav.byteLength).toBeLessThan(MAX_VOICE_SIZE_BYTES)
  })

  it('normalizes a browser recording to a mono WAV file', async () => {
    const close = vi.fn().mockResolvedValue(undefined)
    const decodeAudioData = vi.fn().mockResolvedValue({
      length: 4,
      numberOfChannels: 2,
      sampleRate: 48_000,
      getChannelData: (channel: number) =>
        channel === 0 ? new Float32Array([0, 0.5, -0.5, 1]) : new Float32Array([0, -0.5, 0.5, -1]),
    })

    vi.stubGlobal(
      'AudioContext',
      class {
        close = close
        decodeAudioData = decodeAudioData
      }
    )

    const file = await normalizeVoiceRecording([new Blob(['source audio'])], {
      mimeType: 'audio/webm;codecs=opus',
      extension: 'webm',
    })

    expect(decodeAudioData).toHaveBeenCalledOnce()
    expect(close).toHaveBeenCalledOnce()
    expect(file.name).toMatch(/\.wav$/)
    expect(file.type).toBe('audio/wav')
    expect(file.size).toBeGreaterThan(44)
  })
})

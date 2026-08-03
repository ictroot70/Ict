import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useVoiceMessageDraft } from './useVoiceMessageDraft'

const sendVoiceMessage = vi.fn()
const { decodedWaveform, normalizeVoiceRecordingMock, createAudioWaveformFromBlobMock } =
  vi.hoisted(() => ({
    decodedWaveform: Array.from({ length: 112 }, (_, index) => 8 + (index % 24)),
    normalizeVoiceRecordingMock: vi.fn(
      async () => new File(['normalized voice'], 'voice-message.wav', { type: 'audio/wav' })
    ),
    createAudioWaveformFromBlobMock: vi.fn(),
  }))

vi.mock('@/entities/messenger', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/messenger')>()),
  useSendVoiceMessageMutation: () => [sendVoiceMessage],
}))

vi.mock('../lib/voice-recorder', async importOriginal => ({
  ...(await importOriginal<typeof import('../lib/voice-recorder')>()),
  normalizeVoiceRecording: normalizeVoiceRecordingMock,
}))

vi.mock('@/shared/lib', async importOriginal => ({
  ...(await importOriginal<typeof import('@/shared/lib')>()),
  createAudioWaveformFromBlob: createAudioWaveformFromBlobMock,
}))

class MediaRecorderMock extends EventTarget {
  static instances: MediaRecorderMock[] = []
  static isTypeSupported = vi.fn(() => true)

  state: 'inactive' | 'paused' | 'recording' = 'inactive'
  start = vi.fn(() => {
    this.state = 'recording'
  })
  stop = vi.fn(() => {
    this.state = 'inactive'
    this.dispatchEvent(new Event('stop'))
  })

  constructor() {
    super()
    MediaRecorderMock.instances.push(this)
  }
}

const trackStop = vi.fn()
const stream = {
  getTracks: () => [{ stop: trackStop }],
} as unknown as MediaStream

const setMediaDevices = (getUserMedia: ReturnType<typeof vi.fn>) => {
  vi.stubGlobal('navigator', {
    mediaDevices: { getUserMedia },
  })
}

describe('useVoiceMessageDraft', () => {
  beforeEach(() => {
    MediaRecorderMock.instances = []
    MediaRecorderMock.isTypeSupported.mockClear()
    trackStop.mockClear()
    sendVoiceMessage.mockReset()
    normalizeVoiceRecordingMock.mockClear()
    createAudioWaveformFromBlobMock.mockResolvedValue(decodedWaveform)
    createAudioWaveformFromBlobMock.mockClear()
    vi.stubGlobal('MediaRecorder', MediaRecorderMock)
    let objectUrlIndex = 0

    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => `blob:voice-${++objectUrlIndex}`),
      revokeObjectURL: vi.fn(),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('reports an unsupported browser without requesting permission', async () => {
    const getUserMedia = vi.fn()

    vi.stubGlobal('MediaRecorder', undefined)
    setMediaDevices(getUserMedia)

    const { result } = renderHook(() => useVoiceMessageDraft({ receiverId: 7, senderId: 1 }))

    await act(() => result.current.startRecording())

    expect(result.current.error).toBe('unsupported')
    expect(getUserMedia).not.toHaveBeenCalled()
  })

  it('reports denied microphone permission', async () => {
    const getUserMedia = vi
      .fn()
      .mockRejectedValue(new DOMException('Permission denied', 'NotAllowedError'))

    setMediaDevices(getUserMedia)

    const { result } = renderHook(() => useVoiceMessageDraft({ receiverId: 7, senderId: 1 }))

    await act(() => result.current.startRecording())

    expect(result.current.status).toBe('idle')
    expect(result.current.error).toBe('permissionDenied')
  })

  it('stops the active stream and recorder when the draft is discarded', async () => {
    setMediaDevices(vi.fn().mockResolvedValue(stream))

    const { result } = renderHook(() => useVoiceMessageDraft({ receiverId: 7, senderId: 1 }))

    await act(() => result.current.startRecording())

    expect(result.current.status).toBe('recording')

    act(() => result.current.discard())

    expect(MediaRecorderMock.instances[0].stop).toHaveBeenCalledOnce()
    expect(trackStop).toHaveBeenCalledOnce()
    expect(result.current.status).toBe('idle')
  })

  it('automatically stops recording after 60 seconds', async () => {
    vi.useFakeTimers()
    setMediaDevices(vi.fn().mockResolvedValue(stream))

    const { result, unmount } = renderHook(() =>
      useVoiceMessageDraft({ receiverId: 7, senderId: 1 })
    )

    await act(() => result.current.startRecording())

    await act(async () => {
      vi.advanceTimersByTime(60_000)
      await Promise.resolve()
    })

    expect(MediaRecorderMock.instances[0].stop).toHaveBeenCalledOnce()
    expect(normalizeVoiceRecordingMock).toHaveBeenCalledOnce()
    expect(result.current.duration).toBe(60)
    expect(result.current.status).toBe('preview')
    expect(result.current.waveform).toEqual(decodedWaveform)
    unmount()
  })

  it('adds an optimistic voice message before the upload finishes', async () => {
    setMediaDevices(vi.fn().mockResolvedValue(stream))
    const onSendStarted = vi.fn()
    const onSent = vi.fn()
    let resolveUpload: ((message: unknown) => void) | undefined

    sendVoiceMessage.mockReturnValue({
      unwrap: () =>
        new Promise(resolve => {
          resolveUpload = resolve
        }),
    })

    const { result } = renderHook(() =>
      useVoiceMessageDraft({
        receiverId: 7,
        senderId: 1,
        onSendStarted,
        onSent,
      })
    )

    await act(() => result.current.startRecording())
    act(() => MediaRecorderMock.instances[0].stop())
    await waitFor(() => expect(result.current.status).toBe('preview'))

    act(() => {
      void result.current.send()
    })

    expect(onSendStarted).toHaveBeenCalledOnce()
    expect(onSendStarted.mock.calls[0][0]).toMatchObject({
      ownerId: 1,
      receiverId: 7,
      messageType: 'VOICE',
      mediaContent: {
        fileType: 'voice',
        fileUrl: 'blob:voice-2',
      },
    })
    expect(onSent).not.toHaveBeenCalled()
    expect(result.current.status).toBe('idle')
    expect(onSendStarted.mock.calls[0][1]).toEqual(decodedWaveform)

    await act(async () => {
      resolveUpload?.({
        ...onSendStarted.mock.calls[0][0],
        id: 100,
        mediaContent: {
          ...onSendStarted.mock.calls[0][0].mediaContent,
          fileUrl: 'https://example.com/voice.wav',
        },
      })
      await Promise.resolve()
    })

    expect(onSent).toHaveBeenCalledWith(expect.objectContaining({ id: 100 }), expect.any(Number))
    expect(result.current.status).toBe('idle')
  })
})

import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MessageStatus } from '../model'
import { VoiceMessageBody } from './VoiceMessageBody'

const { playerState, useAudioWaveformMock } = vi.hoisted(() => ({
  playerState: {
    currentTime: 0,
    duration: 151,
    isPlaying: false,
    progress: 0,
  },
  useAudioWaveformMock: vi.fn(() => null),
}))
const togglePlayback = vi.fn()

vi.mock('@/shared/hooks', () => ({
  useAudioWaveform: useAudioWaveformMock,
  useAudioPlayer: () => ({
    audioRef: { current: null },
    togglePlayback,
    ...playerState,
  }),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('VoiceMessageBody', () => {
  beforeEach(() => {
    playerState.currentTime = 0
    playerState.duration = 151
    playerState.isPlaying = false
    playerState.progress = 0
    togglePlayback.mockClear()
    useAudioWaveformMock.mockClear()
  })

  it('renders the idle design with total duration and delivery metadata', () => {
    render(
      <VoiceMessageBody
        source={'voice.wav'}
        timestamp={'12:53'}
        isIncoming={false}
        status={MessageStatus.READ}
      />
    )

    expect(screen.getByRole('button', { name: 'playMessage' })).toBeTruthy()
    expect(screen.getByText('02:31')).toBeTruthy()
    expect(screen.getByText('12:53')).toBeTruthy()
    expect(screen.getByLabelText('Read')).toBeTruthy()
  })

  it('renders the playback design with current and total duration', () => {
    playerState.currentTime = 101
    playerState.isPlaying = true
    playerState.progress = 101 / 151

    render(
      <VoiceMessageBody
        source={'voice.wav'}
        timestamp={'12:53'}
        isIncoming={false}
        status={MessageStatus.RECEIVED}
      />
    )

    expect(screen.getByRole('button', { name: 'pauseMessage' })).toBeTruthy()
    expect(screen.getByText('1:41 / 02:31')).toBeTruthy()
    expect(screen.getByLabelText('Delivered')).toBeTruthy()
  })

  it('decodes the server waveform when a sent message already has a local fallback', () => {
    render(
      <VoiceMessageBody
        source={'https://example.com/voice.wav'}
        timestamp={'12:53'}
        isIncoming={false}
        waveform={[10, 20, 30]}
      />
    )

    expect(useAudioWaveformMock).toHaveBeenCalledWith('https://example.com/voice.wav')
  })

  it('keeps an optimistic blob waveform local', () => {
    render(
      <VoiceMessageBody
        source={'blob:voice-message'}
        timestamp={'12:53'}
        isIncoming={false}
        waveform={[10, 20, 30]}
      />
    )

    expect(useAudioWaveformMock).toHaveBeenCalledWith('')
  })
})

import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { VoiceMessagePlayer } from './VoiceMessagePlayer'

const { togglePlayback, useAudioPlayerMock } = vi.hoisted(() => ({
  togglePlayback: vi.fn(),
  useAudioPlayerMock: vi.fn(),
}))

vi.mock('@/shared/hooks', () => ({
  useAudioWaveform: () => null,
  useAudioPlayer: useAudioPlayerMock,
}))

describe('VoiceMessagePlayer', () => {
  beforeEach(() => {
    togglePlayback.mockClear()
    useAudioPlayerMock.mockReturnValue({
      audioRef: { current: null },
      currentTime: 0,
      duration: 10,
      isPlaying: false,
      progress: 0,
      togglePlayback,
    })
  })

  it('uses local playback control when it is unmanaged', () => {
    render(
      <VoiceMessagePlayer
        source={'voice.wav'}
        playLabel={'Play voice'}
        pauseLabel={'Pause voice'}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Play voice' }))

    expect(togglePlayback).toHaveBeenCalledOnce()
  })

  it('requests parent playback start instead of playing locally when it is controlled and idle', () => {
    const onPlaybackStart = vi.fn()

    render(
      <VoiceMessagePlayer
        source={'voice.wav'}
        playLabel={'Play voice'}
        pauseLabel={'Pause voice'}
        isPlaybackRequested={false}
        onPlaybackStart={onPlaybackStart}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Play voice' }))

    expect(onPlaybackStart).toHaveBeenCalledOnce()
    expect(togglePlayback).not.toHaveBeenCalled()
  })

  it('requests parent playback pause instead of pausing locally when it is controlled and active', () => {
    const onPlaybackPause = vi.fn()

    useAudioPlayerMock.mockReturnValueOnce({
      audioRef: { current: null },
      currentTime: 1,
      duration: 10,
      isPlaying: true,
      progress: 0.1,
      togglePlayback,
    })

    render(
      <VoiceMessagePlayer
        source={'voice.wav'}
        playLabel={'Play voice'}
        pauseLabel={'Pause voice'}
        isPlaybackRequested
        onPlaybackPause={onPlaybackPause}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Pause voice' }))

    expect(onPlaybackPause).toHaveBeenCalledOnce()
    expect(togglePlayback).not.toHaveBeenCalled()
  })
})

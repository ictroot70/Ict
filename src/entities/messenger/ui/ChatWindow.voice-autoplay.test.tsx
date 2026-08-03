import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MediaFileType, MessageStatus, MessageType, type MessageViewModel } from '../model'
import { ChatWindow } from './ChatWindow'

interface MockVoiceMessageBodyProps {
  source: string
  isPlaybackRequested?: boolean
  onPlaybackEnded?: () => void
  onPlaybackPause?: () => void
  onPlaybackStart?: () => void
}

const { playVoiceTransitionToneMock, voiceBodyPropsBySource } = vi.hoisted(() => ({
  playVoiceTransitionToneMock: vi.fn(() => Promise.resolve()),
  voiceBodyPropsBySource: new Map<string, MockVoiceMessageBodyProps>(),
}))

vi.mock('../lib/play-voice-transition-tone', () => ({
  playVoiceTransitionTone: playVoiceTransitionToneMock,
}))

vi.mock('./MessageComposer', async () => {
  const React = await import('react')

  return {
    MessageComposer: () => React.createElement('div', { 'data-testid': 'message-composer' }),
  }
})

vi.mock('./VoiceMessageBody', async () => {
  const React = await import('react')

  return {
    VoiceMessageBody: (props: MockVoiceMessageBodyProps) => {
      voiceBodyPropsBySource.set(props.source, props)

      return React.createElement('div', {
        'data-playing': props.isPlaybackRequested ? 'true' : 'false',
        'data-testid': props.source,
      })
    },
  }
})

const createVoiceMessage = (
  id: number,
  createdAt: string,
  ownerId: number,
  receiverId: number
): MessageViewModel => ({
  id,
  ownerId,
  receiverId,
  messageText: null,
  mediaContent: {
    fileType: MediaFileType.VOICE,
    fileSize: 1024,
    fileUrl: `https://example.com/voice-${id}.wav`,
  },
  status: MessageStatus.SENT,
  messageType: MessageType.VOICE,
  createdAt,
  updatedAt: createdAt,
})

const createTextMessage = (id: number, createdAt: string): MessageViewModel => ({
  id,
  ownerId: 1,
  receiverId: 2,
  messageText: 'Text breaks the voice chain',
  mediaContent: null,
  status: MessageStatus.SENT,
  messageType: MessageType.TEXT,
  createdAt,
  updatedAt: createdAt,
})

describe('ChatWindow voice autoplay', () => {
  beforeEach(() => {
    voiceBodyPropsBySource.clear()
    playVoiceTransitionToneMock.mockClear()
    playVoiceTransitionToneMock.mockResolvedValue(undefined)
  })

  it('plays a transition tone before starting the next adjacent voice message', async () => {
    const firstVoice = createVoiceMessage(1, '2026-08-03T09:00:00.000Z', 1, 2)
    const secondVoice = createVoiceMessage(2, '2026-08-03T09:01:00.000Z', 2, 1)
    let resolveTone: (() => void) | undefined

    playVoiceTransitionToneMock.mockReturnValueOnce(
      new Promise<void>(resolve => {
        resolveTone = resolve
      })
    )

    render(<ChatWindow currentUserId={1} messages={[firstVoice, secondVoice]} />)

    act(() => {
      voiceBodyPropsBySource.get(firstVoice.mediaContent?.fileUrl ?? '')?.onPlaybackStart?.()
    })

    expect(
      voiceBodyPropsBySource.get(firstVoice.mediaContent?.fileUrl ?? '')?.isPlaybackRequested
    ).toBe(true)
    expect(
      voiceBodyPropsBySource.get(secondVoice.mediaContent?.fileUrl ?? '')?.isPlaybackRequested
    ).toBe(false)

    await act(async () => {
      voiceBodyPropsBySource.get(firstVoice.mediaContent?.fileUrl ?? '')?.onPlaybackEnded?.()
      await Promise.resolve()
    })

    expect(playVoiceTransitionToneMock).toHaveBeenCalledOnce()
    expect(
      voiceBodyPropsBySource.get(firstVoice.mediaContent?.fileUrl ?? '')?.isPlaybackRequested
    ).toBe(false)
    expect(
      voiceBodyPropsBySource.get(secondVoice.mediaContent?.fileUrl ?? '')?.isPlaybackRequested
    ).toBe(false)

    await act(async () => {
      resolveTone?.()
      await Promise.resolve()
    })

    expect(
      voiceBodyPropsBySource.get(secondVoice.mediaContent?.fileUrl ?? '')?.isPlaybackRequested
    ).toBe(true)
  })

  it('does not skip text messages between voice messages', async () => {
    const firstVoice = createVoiceMessage(1, '2026-08-03T09:00:00.000Z', 1, 2)
    const textMessage = createTextMessage(2, '2026-08-03T09:01:00.000Z')
    const secondVoice = createVoiceMessage(3, '2026-08-03T09:02:00.000Z', 2, 1)

    render(<ChatWindow currentUserId={1} messages={[firstVoice, textMessage, secondVoice]} />)

    act(() => {
      voiceBodyPropsBySource.get(firstVoice.mediaContent?.fileUrl ?? '')?.onPlaybackStart?.()
    })
    await act(async () => {
      voiceBodyPropsBySource.get(firstVoice.mediaContent?.fileUrl ?? '')?.onPlaybackEnded?.()
      await Promise.resolve()
    })

    expect(playVoiceTransitionToneMock).not.toHaveBeenCalled()
    expect(
      voiceBodyPropsBySource.get(firstVoice.mediaContent?.fileUrl ?? '')?.isPlaybackRequested
    ).toBe(false)
    expect(
      voiceBodyPropsBySource.get(secondVoice.mediaContent?.fileUrl ?? '')?.isPlaybackRequested
    ).toBe(false)
  })

  it('switches playback to a manually selected voice message', () => {
    const firstVoice = createVoiceMessage(1, '2026-08-03T09:00:00.000Z', 1, 2)
    const secondVoice = createVoiceMessage(2, '2026-08-03T09:01:00.000Z', 2, 1)

    render(<ChatWindow currentUserId={1} messages={[firstVoice, secondVoice]} />)

    act(() => {
      voiceBodyPropsBySource.get(firstVoice.mediaContent?.fileUrl ?? '')?.onPlaybackStart?.()
    })
    act(() => {
      voiceBodyPropsBySource.get(secondVoice.mediaContent?.fileUrl ?? '')?.onPlaybackStart?.()
    })

    expect(
      voiceBodyPropsBySource.get(firstVoice.mediaContent?.fileUrl ?? '')?.isPlaybackRequested
    ).toBe(false)
    expect(
      voiceBodyPropsBySource.get(secondVoice.mediaContent?.fileUrl ?? '')?.isPlaybackRequested
    ).toBe(true)
  })

  it('keeps a manual voice selection made while the transition tone is pending', async () => {
    const firstVoice = createVoiceMessage(1, '2026-08-03T09:00:00.000Z', 1, 2)
    const secondVoice = createVoiceMessage(2, '2026-08-03T09:01:00.000Z', 2, 1)
    const thirdVoice = createVoiceMessage(3, '2026-08-03T09:02:00.000Z', 1, 2)
    let resolveTone: (() => void) | undefined

    playVoiceTransitionToneMock.mockReturnValueOnce(
      new Promise<void>(resolve => {
        resolveTone = resolve
      })
    )

    render(<ChatWindow currentUserId={1} messages={[firstVoice, secondVoice, thirdVoice]} />)

    act(() => {
      voiceBodyPropsBySource.get(firstVoice.mediaContent?.fileUrl ?? '')?.onPlaybackStart?.()
    })
    await act(async () => {
      voiceBodyPropsBySource.get(firstVoice.mediaContent?.fileUrl ?? '')?.onPlaybackEnded?.()
      await Promise.resolve()
    })
    act(() => {
      voiceBodyPropsBySource.get(thirdVoice.mediaContent?.fileUrl ?? '')?.onPlaybackStart?.()
    })
    await act(async () => {
      resolveTone?.()
      await Promise.resolve()
    })

    expect(
      voiceBodyPropsBySource.get(secondVoice.mediaContent?.fileUrl ?? '')?.isPlaybackRequested
    ).toBe(false)
    expect(
      voiceBodyPropsBySource.get(thirdVoice.mediaContent?.fileUrl ?? '')?.isPlaybackRequested
    ).toBe(true)
  })
})

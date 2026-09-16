import type { ReactNode } from 'react'

import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MessageStatus, MessageType, type MessageViewModel } from '../model'
import { ChatWindow } from './ChatWindow'

const { scrollToIndexMock } = vi.hoisted(() => ({
  scrollToIndexMock: vi.fn(),
}))

vi.mock('react-virtuoso', async () => {
  const React = await import('react')

  return {
    Virtuoso: React.forwardRef(
      (
        {
          data,
          itemContent,
        }: {
          data: MessageViewModel[]
          itemContent: (index: number, message: MessageViewModel) => ReactNode
        },
        ref
      ) => {
        React.useImperativeHandle(ref, () => ({ scrollToIndex: scrollToIndexMock }), [])

        return React.createElement(
          'div',
          { 'data-testid': 'virtuoso' },
          data.map((message, index) =>
            React.createElement('div', { key: message.id }, itemContent(index, message))
          )
        )
      }
    ),
  }
})

vi.mock('./MessageComposer', async () => {
  const React = await import('react')

  return {
    MessageComposer: () => React.createElement('div', { 'data-testid': 'message-composer' }),
  }
})

const createMessage = (
  id: number,
  createdAt: string,
  ownerId: number,
  receiverId: number
): MessageViewModel => ({
  id,
  ownerId,
  receiverId,
  messageText: `message ${id}`,
  mediaContent: null,
  status: MessageStatus.SENT,
  messageType: MessageType.TEXT,
  createdAt,
  updatedAt: createdAt,
})

describe('ChatWindow auto-scroll', () => {
  beforeEach(() => {
    scrollToIndexMock.mockClear()
    // Double rAF drives the scroll-to-bottom effects. jsdom's default requestAnimationFrame
    // timing isn't deterministic enough for assertions, so run callbacks synchronously.
    vi.stubGlobal('requestAnimationFrame', (callback: (time: number) => void) => {
      callback(0)

      return 0
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('scrolls to the last message on mount, using the global (firstItemIndex-relative) index', () => {
    const messages = [
      createMessage(101, '2026-08-05T08:00:00.000Z', 2, 1),
      createMessage(102, '2026-08-05T08:01:00.000Z', 2, 1),
    ]

    act(() => {
      render(<ChatWindow currentUserId={1} firstItemIndex={50} messages={messages} />)
    })

    expect(scrollToIndexMock).toHaveBeenCalledWith({
      align: 'end',
      behavior: 'auto',
      // firstItemIndex (50) + messages.length (2) - 1 — NOT a plain array-relative index.
      index: 51,
    })
  })

  it('does not scroll again on mount if the last message is already outgoing', () => {
    const messages = [createMessage(201, '2026-08-05T08:00:00.000Z', 1, 2)]

    act(() => {
      render(<ChatWindow currentUserId={1} firstItemIndex={0} messages={messages} />)
    })

    // Only the initial-mount scroll fires (once) — the "own message" effect intentionally
    // skips its first render for any given last-message id, to avoid a duplicate scroll call
    // right on mount.
    expect(scrollToIndexMock).toHaveBeenCalledOnce()
  })

  it('scrolls to the new message when the current user sends while scrolled up in history', () => {
    const initialMessages = [
      createMessage(301, '2026-08-05T08:00:00.000Z', 2, 1),
      createMessage(302, '2026-08-05T08:01:00.000Z', 2, 1),
    ]

    const { rerender } = render(
      <ChatWindow currentUserId={1} firstItemIndex={10} messages={initialMessages} />
    )

    act(() => {
      scrollToIndexMock.mockClear()
    })

    const ownMessage = createMessage(303, '2026-08-05T08:02:00.000Z', 1, 2)

    act(() => {
      rerender(
        <ChatWindow
          currentUserId={1}
          firstItemIndex={10}
          messages={[...initialMessages, ownMessage]}
        />
      )
    })

    expect(scrollToIndexMock).toHaveBeenCalledWith({
      align: 'end',
      behavior: 'smooth',
      // firstItemIndex (10) + messages.length (3) - 1
      index: 12,
    })
  })

  it('does not force-scroll when an incoming message arrives while reading history', () => {
    const initialMessages = [createMessage(401, '2026-08-05T08:00:00.000Z', 1, 2)]

    const { rerender } = render(
      <ChatWindow currentUserId={1} firstItemIndex={0} messages={initialMessages} />
    )

    act(() => {
      scrollToIndexMock.mockClear()
    })

    const incomingMessage = createMessage(402, '2026-08-05T08:01:00.000Z', 2, 1)

    act(() => {
      rerender(
        <ChatWindow
          currentUserId={1}
          firstItemIndex={0}
          messages={[...initialMessages, incomingMessage]}
        />
      )
    })

    expect(scrollToIndexMock).not.toHaveBeenCalled()
  })
})

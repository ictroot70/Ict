/* eslint-disable max-lines */
/* @vitest-environment jsdom */

import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MESSENGER_SOCKET_EVENTS } from './messenger.events'
import { MediaFileType, MessageStatus, MessageType, type MessageViewModel } from './messenger.types'
import { useMessengerSocket } from './useMessengerSocket'

type SocketHandler = (...args: unknown[]) => void

const { handlers, ioMock, socketMock } = vi.hoisted(() => {
  const handlers = new Map<string, SocketHandler>()

  const socketMock = {
    connected: false,
    disconnect: vi.fn(),
    emit: vi.fn(),
    off: vi.fn((event: string, handler: SocketHandler) => {
      if (handlers.get(event) === handler) {
        handlers.delete(event)
      }
    }),
    on: vi.fn((event: string, handler: SocketHandler) => {
      handlers.set(event, handler)
    }),
  }

  return {
    handlers,
    ioMock: vi.fn(() => socketMock),
    socketMock,
  }
})

vi.mock('socket.io-client', () => ({
  io: ioMock,
}))

vi.mock('@/shared/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    log: vi.fn(),
  },
}))

beforeEach(() => {
  handlers.clear()
  socketMock.connected = false
  vi.clearAllMocks()
})

const triggerSocketEvent = (event: string, ...args: unknown[]) => {
  const handler = handlers.get(event)

  if (!handler) {
    throw new Error(`Missing handler for ${event}`)
  }

  handler(...args)
}

const setupHook = (accessToken: null | string = 'access-token') => {
  const onError = vi.fn()
  const onMessage = vi.fn()

  const hook = renderHook(() =>
    useMessengerSocket({
      accessToken,
      onError,
      onMessage,
    })
  )

  return {
    ...hook,
    onError,
    onMessage,
  }
}

const validMessage = {
  id: 10,
  ownerId: 2,
  receiverId: 1,
  messageText: 'Hello',
  mediaContent: null,
  status: MessageStatus.SENT,
  messageType: MessageType.TEXT,
  createdAt: '2026-07-12T10:00:00.000Z',
  updatedAt: '2026-07-12T10:00:00.000Z',
} satisfies MessageViewModel

describe('useMessengerSocket', () => {
  it('does not connect without an access token', () => {
    setupHook(null)

    expect(ioMock).not.toHaveBeenCalled()
  })

  it('connects with the access token', () => {
    setupHook()

    expect(ioMock).toHaveBeenCalledWith('https://inctagram.work', {
      query: {
        accessToken: 'access-token',
      },
      autoConnect: true,
      reconnection: true,
      transports: ['websocket'],
    })
  })

  it('updates the connection state', () => {
    const { result } = setupHook()

    expect(result.current.isConnected).toBe(false)

    act(() => {
      socketMock.connected = true
      triggerSocketEvent('connect')
    })

    expect(result.current.isConnected).toBe(true)

    act(() => {
      socketMock.connected = false
      triggerSocketEvent('disconnect')
    })

    expect(result.current.isConnected).toBe(false)
  })

  it('emits a message when connected', () => {
    socketMock.connected = true
    const { result } = setupHook()
    const payload = {
      message: 'Hello',
      receiverId: 2,
    }

    let sent = false

    act(() => {
      sent = result.current.sendMessage(payload)
    })

    expect(sent).toBe(true)
    expect(socketMock.emit).toHaveBeenCalledWith(MESSENGER_SOCKET_EVENTS.RECEIVE_MESSAGE, payload)
  })

  it('reports an error when sending while disconnected', () => {
    const { onError, result } = setupHook()

    let sent = true

    act(() => {
      sent = result.current.sendMessage({
        message: 'Hello',
        receiverId: 2,
      })
    })

    expect(sent).toBe(false)
    expect(socketMock.emit).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith({
      source: 'socket',
      code: 'SOCKET_NOT_CONNECTED',
      message: 'Messenger socket is not connected',
    })
  })

  it('processes a valid receive-message event', async () => {
    const { onMessage } = setupHook()

    act(() => {
      triggerSocketEvent(MESSENGER_SOCKET_EVENTS.RECEIVE_MESSAGE, validMessage)
    })

    await waitFor(() => {
      expect(onMessage).toHaveBeenCalledWith(validMessage)
    })
  })

  it('processes an array of status updates received after marking messages as read', async () => {
    const { onMessage } = setupHook()
    const readMessage = {
      ...validMessage,
      status: MessageStatus.READ,
    }

    act(() => {
      triggerSocketEvent(MESSENGER_SOCKET_EVENTS.RECEIVE_MESSAGE, [readMessage])
    })

    await waitFor(() => {
      expect(onMessage).toHaveBeenCalledWith(readMessage)
    })
  })

  it('acknowledges a successfully processed message', async () => {
    const acknowledge = vi.fn()
    const { onMessage } = setupHook()

    act(() => {
      triggerSocketEvent(MESSENGER_SOCKET_EVENTS.MESSAGE_SEND, validMessage, acknowledge)
    })

    await waitFor(() => {
      expect(acknowledge).toHaveBeenCalledWith({
        message: validMessage.messageText,
        receiverId: validMessage.ownerId,
      })
    })

    expect(onMessage).toHaveBeenCalledWith(validMessage)
    expect(onMessage.mock.invocationCallOrder[0]).toBeLessThan(
      acknowledge.mock.invocationCallOrder[0]
    )
  })

  it('processes a media message without inventing an acknowledgement payload', async () => {
    const acknowledge = vi.fn()
    const { onMessage } = setupHook()
    const imageMessage = {
      ...validMessage,
      messageText: 'Caption',
      messageType: MessageType.IMAGE,
      mediaContent: {
        fileType: MediaFileType.IMAGE,
        fileUrl: 'https://example.com/message.png',
        fileSize: 1024,
      },
    } satisfies MessageViewModel

    act(() => {
      triggerSocketEvent(MESSENGER_SOCKET_EVENTS.MESSAGE_SEND, imageMessage, acknowledge)
    })

    await waitFor(() => {
      expect(onMessage).toHaveBeenCalledWith(imageMessage)
    })

    expect(acknowledge).not.toHaveBeenCalled()
  })

  it('rejects an invalid incoming payload', async () => {
    const acknowledge = vi.fn()
    const { onError, onMessage } = setupHook()

    act(() => {
      triggerSocketEvent(MESSENGER_SOCKET_EVENTS.MESSAGE_SEND, { id: 'invalid' }, acknowledge)
    })

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith({
        source: 'socket',
        code: 'INVALID_MESSAGE_PAYLOAD',
        message: 'Invalid incoming message payload',
      })
    })

    expect(onMessage).not.toHaveBeenCalled()
    expect(acknowledge).not.toHaveBeenCalled()
  })

  it('does not acknowledge when message processing fails', async () => {
    const acknowledge = vi.fn()
    const { onError, onMessage } = setupHook()

    onMessage.mockRejectedValueOnce(new Error('Cache update failed'))

    act(() => {
      triggerSocketEvent(MESSENGER_SOCKET_EVENTS.MESSAGE_SEND, validMessage, acknowledge)
    })

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith({
        source: 'socket',
        code: 'SOCKET_ERROR',
        message: 'Cache update failed',
      })
    })

    expect(acknowledge).not.toHaveBeenCalled()
  })

  it('normalizes a socket error event', () => {
    const { onError } = setupHook()

    act(() => {
      triggerSocketEvent(MESSENGER_SOCKET_EVENTS.ERROR, {
        error: 'DELIVERY_FAILED',
        message: 'Cannot deliver message',
      })
    })

    expect(onError).toHaveBeenCalledWith({
      source: 'socket',
      code: 'DELIVERY_FAILED',
      message: 'Cannot deliver message',
    })
  })

  it('disconnects an authenticated socket after an authentication error', () => {
    socketMock.connected = true
    const { onError, result } = setupHook()

    act(() => {
      triggerSocketEvent('connect')
      triggerSocketEvent(MESSENGER_SOCKET_EVENTS.ERROR, {
        message: 'Authentication error',
      })
    })

    expect(result.current.isConnected).toBe(false)
    expect(socketMock.disconnect).toHaveBeenCalledOnce()
    expect(onError).toHaveBeenCalledWith({
      source: 'socket',
      code: 'SOCKET_ERROR',
      message: 'Authentication error',
    })
  })

  it('removes listeners and disconnects on unmount', () => {
    const { unmount } = setupHook()

    expect(handlers.size).toBe(7)

    unmount()

    expect(socketMock.off).toHaveBeenCalledTimes(7)
    expect(socketMock.disconnect).toHaveBeenCalledOnce()
    expect(handlers.size).toBe(0)
  })

  it('reconnects when the access token changes', () => {
    const onError = vi.fn()
    const onMessage = vi.fn()

    const { rerender } = renderHook(
      ({ accessToken }: { accessToken: string }) =>
        useMessengerSocket({
          accessToken,
          onError,
          onMessage,
        }),
      {
        initialProps: {
          accessToken: 'old-token',
        },
      }
    )

    rerender({
      accessToken: 'new-token',
    })

    expect(socketMock.disconnect).toHaveBeenCalledOnce()
    expect(ioMock).toHaveBeenCalledTimes(2)
    expect(ioMock).toHaveBeenNthCalledWith(
      2,
      'https://inctagram.work',
      expect.objectContaining({
        query: {
          accessToken: 'new-token',
        },
      })
    )
  })
})

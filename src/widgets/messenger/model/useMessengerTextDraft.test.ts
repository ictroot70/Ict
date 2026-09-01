/* @vitest-environment jsdom */

import { MessageStatus, MessageType, type MessageViewModel } from '@/entities/messenger'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useMessengerTextDraft } from './useMessengerTextDraft'

const realtime = vi.hoisted(() => ({
  isConnected: true,
  isRecoveringAuthentication: false,
  sendMessage: vi.fn(() => true),
}))

vi.mock('./messenger-realtime-context', () => ({
  useMessengerRealtimeConnection: () => realtime,
}))

const confirmedMessage: MessageViewModel = {
  id: 42,
  ownerId: 1,
  receiverId: 2,
  messageText: 'Hello',
  mediaContent: null,
  status: MessageStatus.SENT,
  messageType: MessageType.TEXT,
  createdAt: '2026-08-24T10:00:00.000Z',
  updatedAt: '2026-08-24T10:00:00.000Z',
}

describe('useMessengerTextDraft', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-24T10:00:00.000Z'))
    realtime.isConnected = true
    realtime.isRecoveringAuthentication = false
    realtime.sendMessage.mockReset().mockReturnValue(true)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('adds an optimistic message and clears it after realtime confirmation', () => {
    const onRemoveOptimistic = vi.fn()
    const onSendStarted = vi.fn()
    const { result, rerender } = renderHook(
      ({ messages }: { messages: MessageViewModel[] }) =>
        useMessengerTextDraft({
          messages,
          receiverId: 2,
          senderId: 1,
          onRemoveOptimistic,
          onSendStarted,
        }),
      { initialProps: { messages: [] as MessageViewModel[] } }
    )

    act(() => result.current.setDraftText(' Hello '))
    act(() => result.current.send())

    expect(realtime.sendMessage).toHaveBeenCalledWith({ message: 'Hello', receiverId: 2 })
    expect(onSendStarted).toHaveBeenCalledWith(
      expect.objectContaining({ id: -Date.now(), messageText: 'Hello' })
    )
    expect(result.current.isSending).toBe(true)

    rerender({ messages: [confirmedMessage] })

    expect(onRemoveOptimistic).toHaveBeenCalledWith(-Date.now())
    expect(result.current.draftText).toBe('')
    expect(result.current.isSending).toBe(false)
  })

  it('keeps the draft and reports a connection error while disconnected', () => {
    realtime.isConnected = false
    const { result } = renderHook(() =>
      useMessengerTextDraft({
        messages: [],
        receiverId: 2,
        senderId: 1,
        onRemoveOptimistic: vi.fn(),
        onSendStarted: vi.fn(),
      })
    )

    act(() => result.current.setDraftText('Hello'))
    act(() => result.current.send())

    expect(realtime.sendMessage).not.toHaveBeenCalled()
    expect(result.current.draftText).toBe('Hello')
    expect(result.current.error).toBe('connection')
  })

  it('rolls back an unconfirmed message after the timeout', () => {
    const onRemoveOptimistic = vi.fn()
    const optimisticId = -Date.now()
    const { result } = renderHook(() =>
      useMessengerTextDraft({
        messages: [],
        receiverId: 2,
        senderId: 1,
        onRemoveOptimistic,
        onSendStarted: vi.fn(),
      })
    )

    act(() => result.current.setDraftText('Hello'))
    act(() => result.current.send())
    act(() => vi.advanceTimersByTime(10_000))

    expect(onRemoveOptimistic).toHaveBeenCalledWith(optimisticId)
    expect(result.current.error).toBe('sendFailed')
    expect(result.current.isSending).toBe(false)
  })

  it('waits for authentication recovery and retries the pending message after reconnect', () => {
    const onRemoveOptimistic = vi.fn()
    const { result, rerender } = renderHook(() =>
      useMessengerTextDraft({
        messages: [],
        receiverId: 2,
        senderId: 1,
        onRemoveOptimistic,
        onSendStarted: vi.fn(),
      })
    )

    act(() => result.current.setDraftText('Hello'))
    act(() => result.current.send())

    realtime.isConnected = false
    realtime.isRecoveringAuthentication = true
    rerender()

    expect(onRemoveOptimistic).not.toHaveBeenCalled()
    expect(result.current.draftText).toBe('Hello')
    expect(result.current.error).toBeNull()
    expect(result.current.isSending).toBe(true)

    realtime.isConnected = true
    realtime.isRecoveringAuthentication = false
    rerender()

    expect(realtime.sendMessage).toHaveBeenCalledTimes(2)
    expect(realtime.sendMessage).toHaveBeenLastCalledWith({ message: 'Hello', receiverId: 2 })
    expect(result.current.error).toBeNull()
    expect(result.current.isSending).toBe(true)
  })

  it('fails instead of retrying forever when the refreshed token is rejected again', () => {
    const onRemoveOptimistic = vi.fn()
    const { result, rerender } = renderHook(() =>
      useMessengerTextDraft({
        messages: [],
        receiverId: 2,
        senderId: 1,
        onRemoveOptimistic,
        onSendStarted: vi.fn(),
      })
    )

    act(() => result.current.setDraftText('Hello'))
    act(() => result.current.send())

    realtime.isConnected = false
    realtime.isRecoveringAuthentication = true
    rerender()
    realtime.isConnected = true
    realtime.isRecoveringAuthentication = false
    rerender()

    realtime.isConnected = false
    realtime.isRecoveringAuthentication = true
    rerender()

    expect(onRemoveOptimistic).toHaveBeenCalledWith(-Date.now())
    expect(result.current.error).toBe('sendFailed')
    expect(result.current.isSending).toBe(false)
  })
})

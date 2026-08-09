import {
  MediaFileType,
  MessageStatus,
  MessageType,
  type DialogueMessagesResponseDto,
  type MessageViewModel,
} from '@/entities/messenger'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useMessengerDialogueData } from './useMessengerDialogueData'

const mocks = vi.hoisted(() => ({
  getDialogueMessagesQuery: vi.fn(),
  history: undefined as DialogueMessagesResponseDto | undefined,
  loadDialogueMessages: vi.fn(),
  loadDialogueMessagesState: {
    isFetching: false,
  },
  markMessagesAsRead: vi.fn(),
  unwrap: vi.fn(),
}))

vi.mock('@/entities/messenger', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/messenger')>()),
  useGetDialogueMessagesQuery: mocks.getDialogueMessagesQuery,
  useLazyGetDialogueMessagesQuery: () => [
    mocks.loadDialogueMessages,
    mocks.loadDialogueMessagesState,
  ],
  useMarkMessagesAsReadMutation: () => [mocks.markMessagesAsRead],
}))

vi.mock('@/entities/profile', async importOriginal => ({
  ...(await importOriginal<typeof import('@/entities/profile')>()),
  useGetPublicProfileQuery: () => ({ data: { avatars: [] } }),
}))

vi.mock('@/features/auth', async importOriginal => ({
  ...(await importOriginal<typeof import('@/features/auth')>()),
  useMeQuery: () => ({ data: { userId: 1 } }),
}))

const createMessage = (overrides: Partial<MessageViewModel> = {}): MessageViewModel => ({
  id: 100,
  ownerId: 2,
  receiverId: 1,
  messageText: null,
  mediaContent: {
    fileType: MediaFileType.VOICE,
    fileUrl: 'https://example.com/message.wav',
    fileSize: 2048,
  },
  status: MessageStatus.RECEIVED,
  messageType: MessageType.VOICE,
  createdAt: '2026-08-05T08:00:00.000Z',
  updatedAt: '2026-08-05T08:00:00.000Z',
  ...overrides,
})

const createHistory = (items: MessageViewModel[]): DialogueMessagesResponseDto => ({
  pageSize: 12,
  totalCount: items.length,
  notReadCount: items.filter(message => message.status !== MessageStatus.READ).length,
  items,
})

describe('useMessengerDialogueData mark-as-read ownership', () => {
  beforeEach(() => {
    mocks.history = undefined
    mocks.getDialogueMessagesQuery.mockReset().mockImplementation(() => ({
      data: mocks.history,
      isError: false,
      isFetching: false,
      isLoading: false,
    }))
    mocks.loadDialogueMessages.mockReset().mockImplementation(() => ({
      unwrap: vi.fn().mockResolvedValue(createHistory([])),
    }))
    mocks.loadDialogueMessagesState.isFetching = false
    mocks.unwrap.mockReset().mockResolvedValue(undefined)
    mocks.markMessagesAsRead.mockReset().mockImplementation(() => ({ unwrap: mocks.unwrap }))
  })

  it('requests the first dialogue page with cursor pagination size', () => {
    renderHook(() => useMessengerDialogueData(2))

    expect(mocks.getDialogueMessagesQuery).toHaveBeenCalledWith(
      {
        dialoguePartnerId: 2,
        pageSize: 12,
      },
      {
        refetchOnMountOrArgChange: true,
      }
    )
  })

  it('marks initial unread incoming history in one batch', async () => {
    mocks.history = createHistory([
      createMessage({ id: 101, status: MessageStatus.RECEIVED }),
      createMessage({ id: 102, status: MessageStatus.SENT }),
      createMessage({ id: 103, status: MessageStatus.READ }),
      createMessage({
        id: 104,
        ownerId: 1,
        receiverId: 2,
        status: MessageStatus.SENT,
      }),
    ])

    renderHook(() => useMessengerDialogueData(2))

    await waitFor(() => {
      expect(mocks.markMessagesAsRead).toHaveBeenCalledOnce()
    })
    expect(mocks.markMessagesAsRead).toHaveBeenCalledWith({
      dialoguePartnerId: 2,
      ids: [101, 102],
    })
  })

  it('marks a realtime cache update once and ignores the same id afterwards', async () => {
    mocks.history = createHistory([])
    const { rerender } = renderHook(() => useMessengerDialogueData(2))

    mocks.history = createHistory([createMessage({ id: 201 })])
    rerender()

    await waitFor(() => {
      expect(mocks.markMessagesAsRead).toHaveBeenCalledOnce()
    })

    mocks.history = createHistory([createMessage({ id: 201, status: MessageStatus.RECEIVED })])
    rerender()

    expect(mocks.markMessagesAsRead).toHaveBeenCalledOnce()
    expect(mocks.markMessagesAsRead).toHaveBeenCalledWith({ dialoguePartnerId: 2, ids: [201] })
  })

  it('does not mark outgoing or already read messages', () => {
    mocks.history = createHistory([
      createMessage({ id: 301, status: MessageStatus.READ }),
      createMessage({
        id: 302,
        ownerId: 1,
        receiverId: 2,
        status: MessageStatus.SENT,
      }),
    ])

    renderHook(() => useMessengerDialogueData(2))

    expect(mocks.markMessagesAsRead).not.toHaveBeenCalled()
  })

  it('allows the same id to be retried after a failed mutation', async () => {
    mocks.unwrap.mockRejectedValueOnce(new Error('network error')).mockResolvedValueOnce(undefined)
    mocks.history = createHistory([createMessage({ id: 401 })])
    const { rerender } = renderHook(() => useMessengerDialogueData(2))

    await waitFor(() => {
      expect(mocks.unwrap).toHaveBeenCalledOnce()
    })

    mocks.history = createHistory([createMessage({ id: 401 })])
    rerender()

    await waitFor(() => {
      expect(mocks.markMessagesAsRead).toHaveBeenCalledTimes(2)
    })
    expect(mocks.markMessagesAsRead).toHaveBeenNthCalledWith(2, {
      dialoguePartnerId: 2,
      ids: [401],
    })
  })

  it('loads older messages with the last loaded message id as cursor', async () => {
    const olderMessage = createMessage({
      createdAt: '2026-08-05T07:59:00.000Z',
      id: 499,
    })

    mocks.history = {
      ...createHistory([
        createMessage({ createdAt: '2026-08-05T08:01:00.000Z', id: 501 }),
        createMessage({ createdAt: '2026-08-05T08:00:00.000Z', id: 500 }),
      ]),
      totalCount: 3,
    }
    mocks.loadDialogueMessages.mockReturnValueOnce({
      unwrap: vi.fn().mockResolvedValue(createHistory([olderMessage])),
    })

    const { result } = renderHook(() => useMessengerDialogueData(2))

    await act(async () => {
      await result.current.loadOlderMessages()
    })

    expect(mocks.loadDialogueMessages).toHaveBeenCalledWith({
      cursor: 500,
      dialoguePartnerId: 2,
      pageSize: 12,
    })
    expect(result.current.messages.map(message => message.id)).toEqual([499, 500, 501])
  })

  it('marks loaded older incoming messages as read', async () => {
    const olderMessage = createMessage({
      createdAt: '2026-08-05T07:59:00.000Z',
      id: 599,
    })

    mocks.history = {
      ...createHistory([
        createMessage({ createdAt: '2026-08-05T08:01:00.000Z', id: 601 }),
        createMessage({ createdAt: '2026-08-05T08:00:00.000Z', id: 600 }),
      ]),
      totalCount: 3,
    }
    mocks.loadDialogueMessages.mockReturnValueOnce({
      unwrap: vi.fn().mockResolvedValue(createHistory([olderMessage])),
    })

    const { result } = renderHook(() => useMessengerDialogueData(2))

    await waitFor(() => {
      expect(mocks.markMessagesAsRead).toHaveBeenCalledWith({
        dialoguePartnerId: 2,
        ids: [600, 601],
      })
    })

    await act(async () => {
      await result.current.loadOlderMessages()
    })

    await waitFor(() => {
      expect(mocks.markMessagesAsRead).toHaveBeenCalledWith({
        dialoguePartnerId: 2,
        ids: [599],
      })
    })
  })
})

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  type MessageViewModel,
  upsertMessageInHistory,
  useGetDialogueMessagesQuery,
  useLazyGetDialogueMessagesQuery,
  useMarkMessagesAsReadMutation,
} from '@/entities/messenger'
import { useGetPublicProfileQuery } from '@/entities/profile'
import { useMeQuery } from '@/features/auth'
import { logger } from '@/shared/lib/logger'

import { selectUnreadIncomingMessageIds } from './messenger-realtime'
import { useMessengerMessageWaveforms } from './useMessengerMessageWaveforms'

const MESSENGER_DEBUG_STORAGE_KEY = 'messengerDebug'
const MESSENGER_DIALOGUE_PAGE_SIZE = 12

const isMessengerDebugEnabled = () => {
  try {
    return window.localStorage.getItem(MESSENGER_DEBUG_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

const debugMessengerDialogue = (message: string, details?: unknown) => {
  if (!isMessengerDebugEnabled()) {
    return
  }

  logger.info(`[MessengerDialogueDebug] ${message}`, details ?? '')
}

const sortMessages = (messages: readonly MessageViewModel[]) =>
  [...messages].sort(
    (first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()
  )

export function useMessengerDialogueData(partnerId: number) {
  const [sentMessages, setSentMessages] = useState<MessageViewModel[]>([])
  const [olderMessages, setOlderMessages] = useState<MessageViewModel[]>([])
  const [isOlderHistoryExhausted, setIsOlderHistoryExhausted] = useState(false)
  const markedAsReadIdsRef = useRef(new Set<number>())
  const olderCursorRef = useRef<number | null>(null)
  const { data: currentUser } = useMeQuery()
  const currentUserId = currentUser?.userId ?? 0
  const { data: partner } = useGetPublicProfileQuery({ profileId: partnerId })
  const [markMessagesAsRead] = useMarkMessagesAsReadMutation()
  const [loadDialogueMessages, { isFetching: isLoadingOlderMessages }] =
    useLazyGetDialogueMessagesQuery()
  const {
    data: history,
    isError: isHistoryError,
    isLoading: isHistoryLoading,
    isFetching: isHistoryFetching,
  } = useGetDialogueMessagesQuery(
    {
      dialoguePartnerId: partnerId,
      pageSize: MESSENGER_DIALOGUE_PAGE_SIZE,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  )
  const latestHistoryMessages = useMemo(() => history?.items ?? [], [history])
  const loadedHistoryMessages = useMemo(
    () =>
      sortMessages(
        [...olderMessages, ...latestHistoryMessages].reduce<MessageViewModel[]>(
          (items, message) => upsertMessageInHistory(items, message),
          []
        )
      ),
    [latestHistoryMessages, olderMessages]
  )
  const messages = useMemo(
    () =>
      sortMessages(
        loadedHistoryMessages.reduce<MessageViewModel[]>(
          (items, message) => upsertMessageInHistory(items, message),
          [...sentMessages]
        )
      ),
    [loadedHistoryMessages, sentMessages]
  )
  const { messageWaveforms, moveWaveform, removeWaveform, setWaveform } =
    useMessengerMessageWaveforms(messages)
  const loadedHistoryCount = loadedHistoryMessages.length
  const totalHistoryCount = history?.totalCount ?? loadedHistoryCount
  const hasOlderMessages =
    !isOlderHistoryExhausted && loadedHistoryCount > 0 && loadedHistoryCount < totalHistoryCount
  const firstItemIndex = Math.max(0, totalHistoryCount - loadedHistoryCount)

  useEffect(() => {
    setOlderMessages([])
    setIsOlderHistoryExhausted(false)
    olderCursorRef.current = null
    markedAsReadIdsRef.current.clear()
  }, [partnerId])

  useEffect(() => {
    if (olderCursorRef.current !== null || latestHistoryMessages.length === 0) {
      return
    }

    olderCursorRef.current = latestHistoryMessages[latestHistoryMessages.length - 1]?.id ?? null
  }, [latestHistoryMessages])

  const loadOlderMessages = useCallback(async () => {
    const cursor = olderCursorRef.current

    if (!cursor || !hasOlderMessages || isLoadingOlderMessages) {
      return
    }

    try {
      const olderHistory = await loadDialogueMessages({
        cursor,
        dialoguePartnerId: partnerId,
        pageSize: MESSENGER_DIALOGUE_PAGE_SIZE,
      }).unwrap()

      if (olderHistory.items.length === 0) {
        setIsOlderHistoryExhausted(true)

        return
      }

      olderCursorRef.current = olderHistory.items[olderHistory.items.length - 1]?.id ?? cursor
      setOlderMessages(currentMessages =>
        olderHistory.items.reduce<MessageViewModel[]>(
          (items, message) => upsertMessageInHistory(items, message),
          currentMessages
        )
      )
    } catch {
      debugMessengerDialogue('load older dialogue messages failed', {
        cursor,
        partnerId,
      })
    }
  }, [hasOlderMessages, isLoadingOlderMessages, loadDialogueMessages, partnerId])

  useEffect(() => {
    if (currentUserId <= 0 || messages.length === 0) {
      return
    }

    const unreadIncomingIds = selectUnreadIncomingMessageIds(
      messages,
      currentUserId,
      markedAsReadIdsRef.current
    )

    if (unreadIncomingIds.length === 0) {
      return
    }

    unreadIncomingIds.forEach(id => markedAsReadIdsRef.current.add(id))
    debugMessengerDialogue('mark loaded incoming messages as read', {
      currentUserId,
      partnerId,
      ids: unreadIncomingIds,
    })
    void markMessagesAsRead({ dialoguePartnerId: partnerId, ids: unreadIncomingIds })
      .unwrap()
      .catch(() => {
        debugMessengerDialogue('mark loaded incoming messages as read failed', {
          currentUserId,
          partnerId,
          ids: unreadIncomingIds,
        })
        unreadIncomingIds.forEach(id => markedAsReadIdsRef.current.delete(id))
      })
  }, [currentUserId, markMessagesAsRead, messages, partnerId])

  const upsertSentMessage = useCallback(
    (message: MessageViewModel, waveform?: readonly number[]) => {
      if (waveform) {
        setWaveform(message.id, waveform)
      }

      setSentMessages(currentMessages => upsertMessageInHistory(currentMessages, message))
    },
    [setWaveform]
  )
  const replaceSentMessage = useCallback(
    (message: MessageViewModel, optimisticId: number) => {
      moveWaveform(optimisticId, message)
      setSentMessages(currentMessages =>
        upsertMessageInHistory(
          currentMessages.filter(currentMessage => currentMessage.id !== optimisticId),
          message
        )
      )
    },
    [moveWaveform]
  )
  const removeSentMessage = useCallback(
    (messageId: number) => {
      removeWaveform(messageId)
      setSentMessages(currentMessages =>
        currentMessages.filter(currentMessage => currentMessage.id !== messageId)
      )
    },
    [removeWaveform]
  )

  return {
    currentUserId,
    messages,
    messageWaveforms,
    firstItemIndex,
    hasOlderMessages,
    isLoadingOlderMessages,
    loadOlderMessages,
    upsertSentMessage,
    replaceSentMessage,
    removeSentMessage,
    partnerAvatarUrl: partner?.avatars[0]?.url,
    isLoading: isHistoryLoading || (isHistoryFetching && messages.length === 0),
    error: isHistoryError ? 'Could not load message history' : null,
  }
}

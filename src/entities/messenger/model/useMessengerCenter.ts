'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useAppDispatch } from '@/lib/hooks'
import { logger } from '@/shared/lib/logger'

import { messengerApi } from '../api/messenger.api'
import { upsertMessageInHistory } from '../lib'
import { useMessengerRealtime } from './MessengerRealtimeProvider'
import {
  MessageStatus,
  MessageType,
  type GetDialogueMessagesParams,
  type MessageViewModel,
  type SendMessagePayload,
} from './messenger.types'
import { MESSENGER_DIALOGS_QUERY_ARGS } from './messenger-dialogs-query'

const DEFAULT_MESSAGES_PAGE_SIZE = 50

function sortMessagesByCreatedAtAsc(messages: MessageViewModel[]): MessageViewModel[] {
  return [...messages].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  )
}

export const useMessengerCenter = (
  dialoguePartnerId: number,
  currentUserId: number,
  partnerPreview?: { userName?: string; avatarUrl?: string }
) => {
  const dispatch = useAppDispatch()
  const { isConnected, sendMessage, subscribeMessages } = useMessengerRealtime()

  const messagesQueryArgs: GetDialogueMessagesParams = useMemo(
    () => ({ dialoguePartnerId, pageSize: DEFAULT_MESSAGES_PAGE_SIZE }),
    [dialoguePartnerId]
  )

  const { data: messagesData, isFetching } =
    messengerApi.useGetDialogueMessagesQuery(messagesQueryArgs)

  const [draftText, setDraftText] = useState('')
  const [sendError, setSendError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const pendingOptimisticIdRef = useRef<number | null>(null)
  const pendingTextRef = useRef<string | null>(null)

  const rollbackOptimisticSend = useCallback(() => {
    const optimisticId = pendingOptimisticIdRef.current

    if (optimisticId == null) {
      return
    }

    dispatch(
      messengerApi.util.updateQueryData('getDialogueMessages', messagesQueryArgs, draft => {
        draft.items = (draft.items || []).filter(item => item.id !== optimisticId)
      })
    )

    pendingOptimisticIdRef.current = null
    pendingTextRef.current = null
  }, [dispatch, messagesQueryArgs])

  useEffect(() => {
    return subscribeMessages(async (message: MessageViewModel) => {
      const isOwnMessage = message.ownerId === currentUserId
      const isForCurrentDialogue =
        message.ownerId === dialoguePartnerId || message.receiverId === dialoguePartnerId

      if (!isForCurrentDialogue) {
        return
      }

      dispatch(
        messengerApi.util.updateQueryData('getDialogueMessages', messagesQueryArgs, draft => {
          if (isOwnMessage) {
            draft.items = (draft.items || []).filter(
              item => !(item.id < 0 && item.messageText === message.messageText)
            )
          }
          draft.items = upsertMessageInHistory(draft.items || [], message)
        })
      )

      if (
        isOwnMessage &&
        pendingTextRef.current !== null &&
        message.messageText === pendingTextRef.current
      ) {
        setDraftText('')
        setIsSending(false)
        setSendError(null)
        pendingOptimisticIdRef.current = null
        pendingTextRef.current = null
        dispatch(messengerApi.util.invalidateTags(['MessengerDialogs']))
      }
    })
  }, [currentUserId, dialoguePartnerId, dispatch, messagesQueryArgs, subscribeMessages])

  const sendTextMessage = useCallback(
    (text: string, receiverId: number): void => {
      const trimmedText = text.trim()

      if (!trimmedText || isSending) {
        return
      }

      if (!isConnected) {
        logger.warn(
          '[MessengerCenter] Cannot send: Socket is not connected. isConnected=',
          isConnected
        )
        setSendError('Нет соединения с сервером. Проверьте интернет или попробуйте позже.')

        return
      }

      setIsSending(true)
      setSendError(null)

      const optimisticId = -Date.now()
      const optimisticMessage: MessageViewModel = {
        id: optimisticId,
        ownerId: currentUserId,
        receiverId,
        messageText: trimmedText,
        mediaContent: null,
        status: MessageStatus.SENT,
        messageType: MessageType.TEXT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      pendingOptimisticIdRef.current = optimisticId
      pendingTextRef.current = trimmedText

      dispatch(
        messengerApi.util.updateQueryData('getDialogueMessages', messagesQueryArgs, draft => {
          draft.items = [...(draft.items || []), optimisticMessage]
        })
      )

      dispatch(
        messengerApi.util.updateQueryData(
          'getMessengerDialogs',
          MESSENGER_DIALOGS_QUERY_ARGS,
          draft => {
            const currentItems = draft.items || []
            const existingIdx = currentItems.findIndex(
              d => d.ownerId === receiverId || d.receiverId === receiverId
            )

            const updatedDialog = {
              ...optimisticMessage,
              userName:
                currentItems[existingIdx]?.userName ??
                partnerPreview?.userName ??
                `User ${receiverId}`,
              avatars: currentItems[existingIdx]?.avatars ?? [],
              notReadCount: 0,
            }

            if (existingIdx >= 0) {
              const updated = [...currentItems]

              updated.splice(existingIdx, 1)
              updated.unshift(updatedDialog)
              draft.items = updated
            } else {
              draft.items = [updatedDialog, ...currentItems]
            }
          }
        )
      )

      const payload: SendMessagePayload = {
        message: trimmedText,
        receiverId,
      }

      const sent = sendMessage(payload)

      if (!sent) {
        setIsSending(false)
        setSendError('Messenger socket is not connected')
        rollbackOptimisticSend()
      }
    },
    [
      currentUserId,
      dispatch,
      isConnected,
      isSending,
      messagesQueryArgs,
      partnerPreview?.userName,
      rollbackOptimisticSend,
      sendMessage,
    ]
  )

  return {
    messages: sortMessagesByCreatedAtAsc(messagesData?.items ?? []),
    isFetching,
    isConnected,
    draftText,
    setDraftText,
    sendTextMessage,
    isSending,
    sendError,
    currentUserId,
  }
}

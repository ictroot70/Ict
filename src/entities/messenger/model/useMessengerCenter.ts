'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useAppDispatch } from '@/lib/hooks'
import { logger } from '@/shared/lib/logger'

import { messengerApi } from '../api/messenger.api'
import {
  applyOptimisticDialogPreview,
  DEFAULT_MESSAGES_PAGE_SIZE,
  SEND_CONFIRMATION_TIMEOUT_MS,
  sortMessagesByCreatedAtAsc,
  upsertMessageInHistory,
} from '../lib'
import { useMessengerRealtime } from './MessengerRealtimeProvider'
import {
  MessageStatus,
  MessageType,
  type GetDialogueMessagesParams,
  type LastMessageViewDto,
  type MessageViewModel,
  type SendMessagePayload,
} from './messenger.types'
import { MESSENGER_DIALOGS_QUERY_ARGS } from './messenger-dialogs-query'

export const useMessengerCenter = (
  dialoguePartnerId: number,
  currentUserId: number,
  partnerPreview?: { userName?: string; avatarUrl?: string }
) => {
  const dispatch = useAppDispatch()
  const { isConnected, sendMessage, subscribeMessages, subscribeErrors } = useMessengerRealtime()

  const messagesQueryArgs: GetDialogueMessagesParams = useMemo(
    () => ({ dialoguePartnerId, pageSize: DEFAULT_MESSAGES_PAGE_SIZE }),
    [dialoguePartnerId]
  )

  const {
    data: messagesData,
    isFetching,
    isLoading,
    isError,
  } = messengerApi.useGetDialogueMessagesQuery(messagesQueryArgs)

  const [draftText, setDraftText] = useState('')
  const [sendError, setSendError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const pendingOptimisticIdRef = useRef<number | null>(null)
  const pendingTextRef = useRef<string | null>(null)
  const dialogsSnapshotRef = useRef<LastMessageViewDto[] | null>(null)
  const sendTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearSendTimeout = useCallback(() => {
    if (sendTimeoutRef.current == null) {
      return
    }

    clearTimeout(sendTimeoutRef.current)
    sendTimeoutRef.current = null
  }, [])

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

    const dialogsSnapshot = dialogsSnapshotRef.current

    if (dialogsSnapshot) {
      dispatch(
        messengerApi.util.updateQueryData(
          'getMessengerDialogs',
          MESSENGER_DIALOGS_QUERY_ARGS,
          draft => {
            draft.items = dialogsSnapshot
          }
        )
      )
    }

    pendingOptimisticIdRef.current = null
    pendingTextRef.current = null
    dialogsSnapshotRef.current = null
  }, [dispatch, messagesQueryArgs])

  const failPendingSend = useCallback(
    (message: string) => {
      if (pendingOptimisticIdRef.current == null) {
        return
      }

      clearSendTimeout()
      rollbackOptimisticSend()
      setIsSending(false)
      setSendError(message)
    },
    [clearSendTimeout, rollbackOptimisticSend]
  )

  useEffect(() => {
    return () => {
      clearSendTimeout()
    }
  }, [clearSendTimeout])

  useEffect(() => {
    return subscribeErrors(error => {
      if (pendingOptimisticIdRef.current == null) {
        return
      }

      if (/authentication|unauthorized|token|401|403/i.test(error.message)) {
        return
      }

      failPendingSend(error.message || 'Не удалось отправить сообщение. Попробуйте ещё раз.')
    })
  }, [failPendingSend, subscribeErrors])

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
        clearSendTimeout()
        setDraftText('')
        setIsSending(false)
        setSendError(null)
        pendingOptimisticIdRef.current = null
        pendingTextRef.current = null
        dialogsSnapshotRef.current = null
        dispatch(messengerApi.util.invalidateTags(['MessengerDialogs']))
      }
    })
  }, [
    clearSendTimeout,
    currentUserId,
    dialoguePartnerId,
    dispatch,
    messagesQueryArgs,
    subscribeMessages,
  ])

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

            dialogsSnapshotRef.current = currentItems.map(item => ({
              ...item,
              avatars: [...item.avatars],
            }))
            draft.items = applyOptimisticDialogPreview({
              currentItems,
              optimisticMessage,
              receiverId,
              partnerUserName: partnerPreview?.userName,
              partnerAvatarUrl: partnerPreview?.avatarUrl,
            })
          }
        )
      )

      const payload: SendMessagePayload = {
        message: trimmedText,
        receiverId,
      }

      const sent = sendMessage(payload)

      if (!sent) {
        failPendingSend('Messenger socket is not connected')

        return
      }

      clearSendTimeout()
      sendTimeoutRef.current = setTimeout(() => {
        failPendingSend('Не удалось отправить сообщение. Попробуйте ещё раз.')
      }, SEND_CONFIRMATION_TIMEOUT_MS)
    },
    [
      clearSendTimeout,
      currentUserId,
      dispatch,
      failPendingSend,
      isConnected,
      isSending,
      messagesQueryArgs,
      partnerPreview?.avatarUrl,
      partnerPreview?.userName,
      sendMessage,
    ]
  )

  return {
    messages: sortMessagesByCreatedAtAsc(messagesData?.items ?? []),
    isFetching,
    isLoading,
    historyError: isError ? 'Could not load message history' : null,
    isConnected,
    draftText,
    setDraftText,
    sendTextMessage,
    isSending,
    sendError,
    currentUserId,
  }
}

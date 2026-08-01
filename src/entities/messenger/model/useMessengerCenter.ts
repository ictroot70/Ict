'use client'

import { useCallback, useMemo, useRef, useState } from 'react'

import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { useAppDispatch } from '@/lib/hooks'
import { useAccessToken } from '@/shared/auth/useAccessToken'
import { logger } from '@/shared/lib/logger'

import { messengerApi } from '../api/messenger.api'
import { upsertMessageInHistory, mapMessageToDialoguePreview } from '../lib'
import {
  MessageStatus,
  MessageType,
  type GetDialogueMessagesParams,
  type GetMessengerDialogsParams,
  type LastMessageViewDto,
  type MessageViewModel,
  type MessengerError,
  type SendMessagePayload,
} from './messenger.types'
import { MESSENGER_DIALOGS_QUERY_ARGS } from './messenger-dialogs-query'
import { useMessengerSocket } from './useMessengerSocket'

export const useMessengerCenter = (
  dialoguePartnerId: number,
  partnerPreview?: { userName?: string; avatarUrl?: string }
) => {
  const dispatch = useAppDispatch()
  const { user } = useAuthUiState()
  const currentUserId = user?.userId ?? 0
  const accessToken = useAccessToken()

  const dialogsQueryArgs: GetMessengerDialogsParams = MESSENGER_DIALOGS_QUERY_ARGS
  const messagesQueryArgs: GetDialogueMessagesParams = useMemo(
    () => ({ dialoguePartnerId }),
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

  const handleIncomingMessage = useCallback(
    async (message: MessageViewModel): Promise<void> => {
      const isOwnMessage = message.ownerId === currentUserId
      const isForCurrentDialogue =
        message.ownerId === dialoguePartnerId || message.receiverId === dialoguePartnerId

      if (isForCurrentDialogue) {
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
      }

      dispatch(
        messengerApi.util.updateQueryData('getMessengerDialogs', dialogsQueryArgs, draft => {
          const currentItems = draft.items || []
          const result = mapMessageToDialoguePreview(currentItems, message, currentUserId)

          if (result.type === 'updated') {
            draft.items = result.dialogues
          } else if (result.type === 'dialogue-not-found') {
            const newDialogue: LastMessageViewDto = {
              ...message,
              userName:
                partnerPreview?.userName ??
                `User ${message.ownerId === currentUserId ? message.receiverId : message.ownerId}`,
              avatars: [],
              notReadCount: isOwnMessage ? 0 : 1,
            }

            draft.items = [newDialogue, ...currentItems]
          }
        })
      )

      // UC-1: clear input only after successful send confirmation
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
        // Sync dialog list (incl. first-time dialogue) with backend preview/userName
        dispatch(messengerApi.util.invalidateTags(['MessengerDialogs']))
      }
    },
    [currentUserId, dialoguePartnerId, dispatch, dialogsQueryArgs, messagesQueryArgs, partnerPreview]
  )

  const handleSocketError = useCallback(
    (error: MessengerError) => {
      logger.error('[MessengerCenter] Socket error:', error)

      if (pendingTextRef.current === null) {
        return
      }

      setSendError(error.message)
      setIsSending(false)
      rollbackOptimisticSend()
    },
    [rollbackOptimisticSend]
  )

  const { isConnected, sendMessage } = useMessengerSocket({
    accessToken,
    onMessage: handleIncomingMessage,
    onError: handleSocketError,
  })

  const sendTextMessage = useCallback(
    (text: string, receiverId: number): void => {
      const trimmedText = text.trim()

      if (!trimmedText || isSending) {
        return
      }

      if (!isConnected) {
        logger.warn(
          '[MessengerCenter] Cannot send: Socket is not connected. isConnected=',
          isConnected,
          'token=',
          !!accessToken
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
        messengerApi.util.updateQueryData('getMessengerDialogs', dialogsQueryArgs, draft => {
          const currentItems = draft.items || []
          const existingIdx = currentItems.findIndex(
            d => d.ownerId === receiverId || d.receiverId === receiverId
          )

          const updatedDialog: LastMessageViewDto = {
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
        })
      )

      const payload: SendMessagePayload = {
        message: trimmedText,
        receiverId,
      }

      const sent = sendMessage(payload)

      if (!sent) {
        // onError already rolled back optimistic UI for the pending send
        return
      }
    },
    [
      accessToken,
      currentUserId,
      dispatch,
      dialogsQueryArgs,
      isConnected,
      isSending,
      messagesQueryArgs,
      partnerPreview?.userName,
      rollbackOptimisticSend,
      sendMessage,
    ]
  )

  return {
    messages: messagesData?.items ?? [],
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

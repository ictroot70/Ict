'use client'

import { useCallback } from 'react'

import { useAppDispatch, useAppStore } from '@/app/store'
import {
  getDialoguePartnerId,
  messengerApi,
  type MessageViewModel,
  useMessengerSocket,
} from '@/entities/messenger'
import { logger } from '@/shared/lib/logger'
import { useAccessToken } from '@/shared/lib/storage/use-access-token'

import {
  applyMessageToDialogueMessages,
  applyMessageToMessengerDialogs,
  removeMessageFromDialogueMessages,
  shouldHandleRealtimeMessage,
} from './messenger-realtime'

interface UseMessengerRealtimeOptions {
  activePartnerId: number | null
  currentUserId: number
}

const MESSENGER_DEBUG_STORAGE_KEY = 'messengerDebug'

const isMessengerDebugEnabled = () => {
  try {
    return window.localStorage.getItem(MESSENGER_DEBUG_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

const getMessageDebugInfo = (message: MessageViewModel) => ({
  id: message.id,
  ownerId: message.ownerId,
  receiverId: message.receiverId,
  status: message.status,
  messageType: message.messageType,
})

const debugMessengerRealtime = (message: string, details?: unknown) => {
  if (!isMessengerDebugEnabled()) {
    return
  }

  logger.info(`[MessengerRealtimeDebug] ${message}`, details ?? '')
}

export function useMessengerRealtime({
  activePartnerId,
  currentUserId,
}: UseMessengerRealtimeOptions) {
  const accessToken = useAccessToken()
  const dispatch = useAppDispatch()
  const store = useAppStore()

  // Marking messages as read is intentionally NOT handled here. This bridge is mounted
  // app-wide and only owns socket -> RTK Query cache synchronization. `useMessengerDialogueData`
  // (mounted per open dialogue) is the single owner of mark-as-read: it reacts to the very
  // same cache updates this hook writes below, so handling it in both places produced a
  // duplicate `PUT /messenger` for every realtime message delivered to an open dialogue.
  const handleMessage = useCallback(
    (message: MessageViewModel) => {
      debugMessengerRealtime('handle socket message', {
        activePartnerId,
        currentUserId,
        message: getMessageDebugInfo(message),
      })

      if (!shouldHandleRealtimeMessage(message, currentUserId)) {
        debugMessengerRealtime('skip message: current user is not a participant', {
          currentUserId,
          message: getMessageDebugInfo(message),
        })

        return
      }

      const partnerId = getDialoguePartnerId(message, currentUserId)

      if (partnerId === null) {
        debugMessengerRealtime('skip message: partner id was not resolved', {
          currentUserId,
          message: getMessageDebugInfo(message),
        })

        return
      }

      const dialogsQueryArgs = messengerApi.util.selectCachedArgsForQuery(
        store.getState(),
        'getMessengerDialogs'
      )

      debugMessengerRealtime('update cached messenger dialogs', {
        partnerId,
        cachedQueries: dialogsQueryArgs.length,
      })

      dialogsQueryArgs.forEach(queryArgs => {
        dispatch(
          messengerApi.util.updateQueryData('getMessengerDialogs', queryArgs, draft => {
            const updatedDialogs = applyMessageToMessengerDialogs(
              draft,
              message,
              currentUserId,
              activePartnerId
            )

            Object.assign(draft, updatedDialogs)
          })
        )
      })

      const dialogueQueryArgs = messengerApi.util
        .selectCachedArgsForQuery(store.getState(), 'getDialogueMessages')
        .filter(queryArgs => queryArgs.dialoguePartnerId === partnerId)

      debugMessengerRealtime('update cached dialogue histories', {
        partnerId,
        cachedQueries: dialogueQueryArgs.length,
      })

      dialogueQueryArgs.forEach(queryArgs => {
        dispatch(
          messengerApi.util.updateQueryData('getDialogueMessages', queryArgs, draft => {
            const updatedHistory = applyMessageToDialogueMessages(
              draft,
              message,
              currentUserId,
              activePartnerId
            )

            Object.assign(draft, updatedHistory)
          })
        )
      })
    },
    [activePartnerId, currentUserId, dispatch, store]
  )

  const handleMessageDeleted = useCallback(
    (messageId: number) => {
      debugMessengerRealtime('handle socket message-deleted', { messageId })

      const dialogueQueryArgs = messengerApi.util.selectCachedArgsForQuery(
        store.getState(),
        'getDialogueMessages'
      )

      debugMessengerRealtime('remove message from cached dialogue histories', {
        messageId,
        cachedQueries: dialogueQueryArgs.length,
      })

      dialogueQueryArgs.forEach(queryArgs => {
        dispatch(
          messengerApi.util.updateQueryData('getDialogueMessages', queryArgs, draft => {
            const updatedHistory = removeMessageFromDialogueMessages(draft, messageId)

            Object.assign(draft, updatedHistory)
          })
        )
      })

      // We don't have the deleted message's dialogue partner or read status here (only its
      // id), so the dialogs list preview/unread count can't be safely patched locally —
      // invalidate the tag and let a REST refetch supply correct data instead of guessing.
      debugMessengerRealtime('invalidate cached messenger dialogs', { messageId })
      dispatch(messengerApi.util.invalidateTags(['MessengerDialogs']))
    },
    [dispatch, store]
  )

  useMessengerSocket({
    accessToken: currentUserId > 0 ? accessToken : null,
    onError: () => undefined,
    onMessage: handleMessage,
    onMessageDeleted: handleMessageDeleted,
  })
}

'use client'

import { useCallback, useRef } from 'react'

import { useAppDispatch } from '@/app/store'
import {
  getDialoguePartnerId,
  messengerApi,
  type GetMessengerDialogsParams,
  type MessageViewModel,
  useMarkMessagesAsReadMutation,
  useMessengerSocket,
} from '@/entities/messenger'
import { useAccessToken } from '@/shared/lib/storage/use-access-token'

import {
  applyVoiceMessageToDialogueMessages,
  applyVoiceMessageToMessengerDialogs,
  MESSENGER_DIALOGUE_MESSAGES_PAGE_SIZE,
  shouldHandleVoiceRealtimeMessage,
  shouldMarkVoiceMessageAsRead,
} from './messenger-voice-realtime'

interface UseMessengerVoiceRealtimeOptions {
  activePartnerId: number | null
  currentUserId: number
  dialogsQueryParams: GetMessengerDialogsParams
}

export function useMessengerVoiceRealtime({
  activePartnerId,
  currentUserId,
  dialogsQueryParams,
}: UseMessengerVoiceRealtimeOptions) {
  const accessToken = useAccessToken()
  const dispatch = useAppDispatch()
  const markedAsReadIdsRef = useRef(new Set<number>())
  const [markMessagesAsRead] = useMarkMessagesAsReadMutation()

  const markVoiceMessageAsRead = useCallback(
    (message: MessageViewModel) => {
      if (markedAsReadIdsRef.current.has(message.id)) {
        return
      }

      markedAsReadIdsRef.current.add(message.id)
      void markMessagesAsRead({ ids: [message.id] })
        .unwrap()
        .catch(() => {
          markedAsReadIdsRef.current.delete(message.id)
        })
    },
    [markMessagesAsRead]
  )

  const handleMessage = useCallback(
    (message: MessageViewModel) => {
      if (!shouldHandleVoiceRealtimeMessage(message, currentUserId)) {
        return
      }

      const partnerId = getDialoguePartnerId(message, currentUserId)

      if (partnerId === null) {
        return
      }

      dispatch(
        messengerApi.util.updateQueryData('getMessengerDialogs', dialogsQueryParams, draft => {
          const updatedDialogs = applyVoiceMessageToMessengerDialogs(
            draft,
            message,
            currentUserId,
            activePartnerId
          )

          Object.assign(draft, updatedDialogs)
        })
      )

      if (activePartnerId === partnerId) {
        dispatch(
          messengerApi.util.updateQueryData(
            'getDialogueMessages',
            {
              dialoguePartnerId: partnerId,
              pageSize: MESSENGER_DIALOGUE_MESSAGES_PAGE_SIZE,
            },
            draft => {
              const updatedHistory = applyVoiceMessageToDialogueMessages(
                draft,
                message,
                currentUserId,
                activePartnerId
              )

              Object.assign(draft, updatedHistory)
            }
          )
        )
      }

      if (shouldMarkVoiceMessageAsRead(message, currentUserId, activePartnerId)) {
        markVoiceMessageAsRead(message)
      }

      dispatch(
        messengerApi.util.invalidateTags([
          'MessengerDialogs',
          { type: 'DialogueMessages', id: partnerId },
        ])
      )
    },
    [activePartnerId, currentUserId, dialogsQueryParams, dispatch, markVoiceMessageAsRead]
  )

  useMessengerSocket({
    accessToken: currentUserId > 0 ? accessToken : null,
    onError: () => undefined,
    onMessage: handleMessage,
  })
}

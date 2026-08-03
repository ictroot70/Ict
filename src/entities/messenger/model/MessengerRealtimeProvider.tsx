'use client'

import type {
  LastMessageViewDto,
  MessageViewModel,
  MessengerError,
  SendMessagePayload,
} from './messenger.types'
import type { MessengerMessageHandler } from './messenger-socket.types'

import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react'

import { useAppDispatch } from '@/lib/hooks'
import { useAccessToken } from '@/shared/auth/useAccessToken'
import { logger } from '@/shared/lib/logger'
import { restoreAccessToken } from '@/shared/lib/restoreAccessToken'
import { authTokenStorage } from '@/shared/lib/storage/auth-token'

import { messengerApi } from '../api/messenger.api'
import { mapMessageToDialoguePreview } from '../lib'
import { MESSENGER_DIALOGS_QUERY_ARGS } from './messenger-dialogs-query'
import { useMessengerSocket } from './useMessengerSocket'

interface MessengerRealtimeContextValue {
  isConnected: boolean
  sendMessage: (payload: SendMessagePayload) => boolean
  subscribeMessages: (handler: MessengerMessageHandler) => () => void
}

const MessengerRealtimeContext = createContext<MessengerRealtimeContextValue | null>(null)

interface MessengerRealtimeProviderProps {
  children: ReactNode
  currentUserId: number
}

export function MessengerRealtimeProvider({
  children,
  currentUserId,
}: MessengerRealtimeProviderProps) {
  const dispatch = useAppDispatch()
  const accessToken = useAccessToken()
  const handlersRef = useRef(new Set<MessengerMessageHandler>())

  const handleIncomingMessage = useCallback(
    async (message: MessageViewModel): Promise<void> => {
      const isOwnMessage = message.ownerId === currentUserId

      dispatch(
        messengerApi.util.updateQueryData(
          'getMessengerDialogs',
          MESSENGER_DIALOGS_QUERY_ARGS,
          draft => {
            const currentItems = draft.items || []
            const result = mapMessageToDialoguePreview(currentItems, message, currentUserId)

            if (result.type === 'updated') {
              draft.items = result.dialogues
            } else if (result.type === 'dialogue-not-found') {
              const partnerId =
                message.ownerId === currentUserId ? message.receiverId : message.ownerId
              const newDialogue: LastMessageViewDto = {
                ...message,
                userName: `User ${partnerId}`,
                avatars: [],
                notReadCount: isOwnMessage ? 0 : 1,
              }

              draft.items = [newDialogue, ...currentItems]
            }
          }
        )
      )

      await Promise.all(
        [...handlersRef.current].map(async handler => {
          await handler(message)
        })
      )
    },
    [currentUserId, dispatch]
  )

  const handleSocketError = useCallback(async (error: MessengerError) => {
    logger.error('[MessengerRealtime] Socket error:', error)

    if (!/authentication|unauthorized|token|401|403/i.test(error.message)) {
      return
    }

    const restored = await restoreAccessToken()

    if (!restored.isAuthenticated || !restored.accessToken) {
      return
    }

    authTokenStorage.setAccessToken(restored.accessToken)
  }, [])

  const { isConnected, sendMessage } = useMessengerSocket({
    accessToken,
    onMessage: handleIncomingMessage,
    onError: handleSocketError,
  })

  const subscribeMessages = useCallback((handler: MessengerMessageHandler) => {
    handlersRef.current.add(handler)

    return () => {
      handlersRef.current.delete(handler)
    }
  }, [])

  const value = useMemo(
    () => ({
      isConnected,
      sendMessage,
      subscribeMessages,
    }),
    [isConnected, sendMessage, subscribeMessages]
  )

  return (
    <MessengerRealtimeContext.Provider value={value}>{children}</MessengerRealtimeContext.Provider>
  )
}

export function useMessengerRealtime(): MessengerRealtimeContextValue {
  const context = useContext(MessengerRealtimeContext)

  if (!context) {
    throw new Error('useMessengerRealtime must be used within MessengerRealtimeProvider')
  }

  return context
}

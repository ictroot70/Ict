'use client'

import type { UseMessengerSocketOptions, UseMessengerSocketResult } from './messenger-socket.types'

import { useCallback, useEffect, useRef, useState } from 'react'

import { logger } from '@/shared/lib/logger'

import {
  MessageStatus,
  MessageType,
  type MessageViewModel,
  type MessengerError,
  type SendMessagePayload,
} from './messenger.types'

export function useMessengerSocket({
  accessToken,
  onError,
  onMessage,
}: UseMessengerSocketOptions): UseMessengerSocketResult {
  const [isConnected, setIsConnected] = useState(true)

  const onMessageRef = useRef(onMessage)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  const sendMessage = useCallback(
    (payload: SendMessagePayload) => {
      if (!isConnected) {
        const error: MessengerError = {
          source: 'socket',
          code: 'SOCKET_NOT_CONNECTED',
          message: 'Messenger socket is not connected',
        }

        logger.error('[MessengerSocket]', error.message)
        onErrorRef.current(error)

        return
      }

      logger.info('[MessengerSocket MOCK] Emulating send:', payload)

      setTimeout(() => {
        const mockServerResponse: MessageViewModel = {
          id: Date.now(),
          ownerId: 63,
          receiverId: payload.receiverId,
          messageText: payload.message,
          status: MessageStatus.RECEIVED,
          messageType: MessageType.TEXT,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        onMessageRef.current(mockServerResponse).catch(err => {
          logger.error('[MessengerSocket MOCK] onMessage handler error:', err)
        })
      }, 300)
    },
    [isConnected]
  )

  return { isConnected, sendMessage }
}

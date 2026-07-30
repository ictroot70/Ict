'use client'

import type { UseMessengerSocketOptions, UseMessengerSocketResult } from './messenger-socket.types'

import { useCallback, useEffect, useRef, useState } from 'react'

import { normalizeMessengerError, isIncomingMessagePayload } from '@/entities/messenger/lib'
import { logger } from '@/shared/lib/logger'
import { io, type Socket } from 'socket.io-client'

import { MESSENGER_SOCKET_EVENTS } from './messenger.events'
import {
  MessageType,
  type MessageAcknowledgement,
  type MessageViewModel,
  type MessengerError,
  type SendMessagePayload,
} from './messenger.types'

const WS_URL = 'https://inctagram.work'

export function useMessengerSocket({
  accessToken,
  onError,
  onMessage,
}: UseMessengerSocketOptions): UseMessengerSocketResult {
  const socketRef = useRef<Socket | null>(null)
  const onErrorRef = useRef(onError)
  const onMessageRef = useRef(onMessage)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  const sendMessage = useCallback((payload: SendMessagePayload) => {
    const socket = socketRef.current

    if (!socket?.connected) {
      const error: MessengerError = {
        source: 'socket',
        code: 'SOCKET_NOT_CONNECTED',
        message: 'Messenger socket is not connected',
      }

      logger.error('[MessengerSocket]', error.message)
      onErrorRef.current(error)

      return
    }

    socket.emit(MESSENGER_SOCKET_EVENTS.RECEIVE_MESSAGE, payload)
  }, [])

  useEffect(() => {
    if (!accessToken) {
      setIsConnected(false)

      return
    }

    setIsConnected(false)

    const socket = io(WS_URL, {
      query: { accessToken },
      autoConnect: true,
      reconnection: true,
      transports: ['websocket'],
    })

    socketRef.current = socket

    const reportError = (error: MessengerError) => {
      logger.error(`[MessengerSocket] ${error.code}:`, error.message)
      onErrorRef.current(error)
    }

    const processMessage = async (payload: unknown): Promise<MessageViewModel | null> => {
      if (!isIncomingMessagePayload(payload)) {
        reportError({
          source: 'socket',
          code: 'INVALID_MESSAGE_PAYLOAD',
          message: 'Invalid incoming message payload',
        })

        return null
      }

      try {
        await onMessageRef.current(payload)

        return payload
      } catch (error) {
        reportError(normalizeMessengerError(error, 'socket'))

        return null
      }
    }

    const handleReceivedMessage = (payload: unknown) => {
      void processMessage(payload)
    }

    const handleIncomingMessage = (payload: unknown, acknowledge?: MessageAcknowledgement) => {
      void processMessage(payload)
        .then(message => {
          if (!message) {
            return
          }

          if (message.messageType !== MessageType.TEXT || message.messageText === null) {
            return
          }

          acknowledge?.({
            message: message.messageText,
            receiverId: message.receiverId,
          })
        })
        .catch(error => {
          reportError(normalizeMessengerError(error, 'socket'))
        })
    }

    const handleConnect = () => {
      setIsConnected(true)
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }

    const handleSocketError = (error: unknown) => {
      reportError(normalizeMessengerError(error, 'socket'))
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on(MESSENGER_SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceivedMessage)
    socket.on(MESSENGER_SOCKET_EVENTS.MESSAGE_SEND, handleIncomingMessage)
    socket.on(MESSENGER_SOCKET_EVENTS.ERROR, handleSocketError)
    socket.on('connect_error', handleSocketError)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off(MESSENGER_SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceivedMessage)
      socket.off(MESSENGER_SOCKET_EVENTS.MESSAGE_SEND, handleIncomingMessage)
      socket.off(MESSENGER_SOCKET_EVENTS.ERROR, handleSocketError)
      socket.off('connect_error', handleSocketError)
      socket.disconnect()

      if (socketRef.current === socket) {
        socketRef.current = null
      }
    }
  }, [accessToken])

  return { isConnected, sendMessage }
}

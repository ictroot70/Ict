'use client'

import type { UseMessengerSocketOptions, UseMessengerSocketResult } from './messenger-socket.types'

import { useCallback, useEffect, useRef, useState } from 'react'

import { logger } from '@/shared/lib/logger'
import { io, type Socket } from 'socket.io-client'

import { isIncomingMessagePayload, normalizeMessengerError } from '../lib'
import { MESSENGER_SOCKET_EVENTS } from './messenger.events'
import {
  MessageType,
  type MessageAcknowledgement,
  type MessageViewModel,
  type MessengerError,
  type SendMessagePayload,
} from './messenger.types'

const WS_URL = 'https://inctagram.work'
const AUTH_ERROR_PATTERN = /authentication|unauthorized|token|401|403/i

export function useMessengerSocket({
  accessToken,
  onError,
  onMessage,
}: UseMessengerSocketOptions): UseMessengerSocketResult {
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  const onMessageRef = useRef(onMessage)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    logger.info('[MessengerSocket] useEffect triggered. Token present:', !!accessToken)

    if (!accessToken) {
      logger.warn('[MessengerSocket] No accessToken, skipping socket initialization')

      return
    }

    logger.info('[MessengerSocket] Initializing socket connection to', WS_URL)

    const socket = io(WS_URL, {
      auth: { token: accessToken },
      query: { accessToken },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    const reportError = (error: MessengerError) => {
      if (AUTH_ERROR_PATTERN.test(error.message)) {
        logger.warn(`[MessengerSocket] Recovering after ${error.code}:`, error.message)
      } else {
        logger.error(`[MessengerSocket] ${error.code}:`, error.message)
      }

      onErrorRef.current(error)
    }

    const processMessage = async (payload: unknown): Promise<MessageViewModel | null> => {
      if (!isIncomingMessagePayload(payload)) {
        logger.warn('[MessengerSocket] Rejected incoming payload:', payload)
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
      const payloads = Array.isArray(payload) ? payload : [payload]

      if (payloads.length === 0) {
        reportError({
          source: 'socket',
          code: 'INVALID_MESSAGE_PAYLOAD',
          message: 'Invalid incoming message payload',
        })

        return
      }

      void Promise.all(payloads.map(processMessage))
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
            receiverId: message.ownerId,
          })
        })
        .catch(error => {
          reportError(normalizeMessengerError(error, 'socket'))
        })
    }

    const handleConnect = () => {
      logger.info('[MessengerSocket] Connected successfully!')
      setIsConnected(true)
    }

    const handleDisconnect = () => {
      logger.warn('[MessengerSocket] Disconnected')
      setIsConnected(false)
    }

    const handleConnectError = (err: Error) => {
      logger.error('[MessengerSocket] Connection error:', err.message, err)
      reportError({
        source: 'socket',
        code: 'CONNECTION_ERROR',
        message: err.message || 'Ошибка подключения к сокету',
      })
    }

    const handleSocketError = (error: unknown) => {
      const normalizedError = normalizeMessengerError(error, 'socket')

      if (AUTH_ERROR_PATTERN.test(normalizedError.message)) {
        setIsConnected(false)
        socket.disconnect()
      }

      reportError(normalizedError)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.on(MESSENGER_SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceivedMessage)
    socket.on(MESSENGER_SOCKET_EVENTS.MESSAGE_SEND, handleIncomingMessage)
    socket.on(MESSENGER_SOCKET_EVENTS.UPDATE_MESSAGE, handleReceivedMessage)
    socket.on(MESSENGER_SOCKET_EVENTS.ERROR, handleSocketError)

    return () => {
      logger.info('[MessengerSocket] Cleaning up socket connection')
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
      socket.off(MESSENGER_SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceivedMessage)
      socket.off(MESSENGER_SOCKET_EVENTS.MESSAGE_SEND, handleIncomingMessage)
      socket.off(MESSENGER_SOCKET_EVENTS.UPDATE_MESSAGE, handleReceivedMessage)
      socket.off(MESSENGER_SOCKET_EVENTS.ERROR, handleSocketError)
      socket.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [accessToken])

  const handleMessageSendAck = (response: unknown) => {
    logger.info('[MessengerSocket] Message send acknowledged by server:', response)
  }

  const sendMessage = useCallback(
    (payload: SendMessagePayload) => {
      const socket = socketRef.current

      if (!isConnected || !socket) {
        const error = {
          source: 'socket' as const,
          code: 'SOCKET_NOT_CONNECTED',
          message: 'Messenger socket is not connected',
        }

        logger.error('[MessengerSocket] Cannot send:', error.message, 'isConnected:', isConnected)
        onErrorRef.current(error)

        return
      }

      logger.info('[MessengerSocket] Emitting MESSAGE_SEND:', payload)

      socket.emit(MESSENGER_SOCKET_EVENTS.MESSAGE_SEND, payload, handleMessageSendAck)
    },
    [isConnected]
  )

  return { isConnected, sendMessage }
}

'use client'

import type { UseMessengerSocketOptions, UseMessengerSocketResult } from './messenger-socket.types'

import { useCallback, useEffect, useRef, useState } from 'react'

import { logger } from '@/shared/lib/logger'
import { io, type Socket } from 'socket.io-client'

import { isIncomingMessagePayload, normalizeMessengerError } from '../lib'
import { MESSENGER_SOCKET_EVENTS } from './messenger.events'
import {
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
      query: { accessToken },
      autoConnect: true,
      reconnection: true,
      transports: ['websocket'],
    })

    socketRef.current = socket

    // Socket.IO may already be connected by the time listeners are attached
    if (socket.connected) {
      setIsConnected(true)
    }

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

          // Server ACK contract: callback() without DTO — server uses sent message id.
          acknowledge?.()
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

      if (!AUTH_ERROR_PATTERN.test(err.message)) {
        return
      }

      setIsConnected(false)
      socket.disconnect()
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

  const sendMessage = useCallback((payload: SendMessagePayload): boolean => {
    const socket = socketRef.current
    const connected = Boolean(socket?.connected)

    if (!connected || !socket) {
      const error = {
        source: 'socket' as const,
        code: 'SOCKET_NOT_CONNECTED',
        message: 'Messenger socket is not connected',
      }

      logger.error('[MessengerSocket] Cannot send:', error.message, 'connected:', connected)
      onErrorRef.current(error)

      return false
    }

    logger.info('[MessengerSocket] Emitting RECEIVE_MESSAGE:', payload)

    socket.emit(MESSENGER_SOCKET_EVENTS.RECEIVE_MESSAGE, payload)

    return true
  }, [])

  return { isConnected, sendMessage }
}

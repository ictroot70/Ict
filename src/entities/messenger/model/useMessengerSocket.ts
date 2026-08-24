'use client'

import type { UseMessengerSocketOptions, UseMessengerSocketResult } from './messenger-socket.types'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  extractDeletedMessageId,
  isIncomingMessagePayload,
  normalizeMessengerError,
} from '@/entities/messenger/lib'
import { logger } from '@/shared/lib/logger'
import { io, type Socket } from 'socket.io-client'

import { MESSENGER_SOCKET_EVENTS } from './messenger.events'
import {
  type MessageAcknowledgement,
  type MessageViewModel,
  type MessengerError,
  type SendMessagePayload,
} from './messenger.types'

const WS_URL = 'https://inctagram.work'
const AUTH_ERROR_PATTERN = /authentication|unauthorized|token|401|403/i
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
  hasText: Boolean(message.messageText),
  mediaType: message.mediaContent?.fileType ?? null,
})

const debugMessengerSocket = (message: string, details?: unknown) => {
  if (!isMessengerDebugEnabled()) {
    return
  }

  logger.info(`[MessengerSocketDebug] ${message}`, details ?? '')
}

export function useMessengerSocket({
  accessToken,
  onError,
  onMessage,
  onMessageDeleted,
}: UseMessengerSocketOptions): UseMessengerSocketResult {
  const socketRef = useRef<Socket | null>(null)
  const onErrorRef = useRef(onError)
  const onMessageRef = useRef(onMessage)
  const onMessageDeletedRef = useRef(onMessageDeleted)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  const disconnectSocket = useCallback(() => {
    const socket = socketRef.current

    if (!socket) {
      return
    }

    socket.removeAllListeners()
    socket.disconnect()
    socketRef.current = null
    setIsConnected(false)
  }, [])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    onMessageDeletedRef.current = onMessageDeleted
  }, [onMessageDeleted])

  useEffect(() => {
    if (!accessToken) {
      disconnectSocket()
      debugMessengerSocket('skip connect: no access token')

      return
    }

    if (socketRef.current) {
      const existingSocket = socketRef.current

      // Keep the same socket instance (avoids a disconnect/reconnect window right after
      // token rotation), but the auth data used by Socket.IO for any FUTURE internal
      // reconnect (network blip, server restart, sleep/wake, ping timeout, etc.) must be
      // refreshed too — otherwise a reconnect after this point silently uses the stale
      // token and gets rejected by the server with no automatic recovery.
      existingSocket.auth = { accessToken }
      existingSocket.io.opts.query = { accessToken }

      debugMessengerSocket('updated access token on existing socket', {
        connected: existingSocket.connected,
      })

      return
    }

    setIsConnected(false)
    debugMessengerSocket('connect requested', { hasAccessToken: true })

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
      debugMessengerSocket('event receive-message/update-message', payload)
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
      debugMessengerSocket('event message-send', {
        hasAcknowledgementCallback: typeof acknowledge === 'function',
        payload,
      })

      void processMessage(payload)
        .then(message => {
          if (!message) {
            debugMessengerSocket('skip acknowledgement: invalid message payload', payload)

            return
          }

          debugMessengerSocket('call acknowledgement', {
            message: getMessageDebugInfo(message),
          })

          // Per the documented WS contract, the acknowledgement callback must be called
          // with NO payload — the server identifies the delivered message from its own
          // handshake/event context and updates its status to RECEIVED itself.
          acknowledge?.()
        })
        .catch(error => {
          reportError(normalizeMessengerError(error, 'socket'))
        })
    }

    const handleMessageDeleted = (payload: unknown) => {
      debugMessengerSocket('event message-deleted', payload)

      const messageId = extractDeletedMessageId(payload)

      if (messageId === null) {
        logger.warn('[MessengerSocket] Rejected message-deleted payload:', payload)
        reportError({
          source: 'socket',
          code: 'INVALID_MESSAGE_DELETED_PAYLOAD',
          message: 'Invalid message-deleted payload',
        })

        return
      }

      void Promise.resolve(onMessageDeletedRef.current(messageId)).catch(error => {
        reportError(normalizeMessengerError(error, 'socket'))
      })
    }

    const handleConnect = () => {
      setIsConnected(true)
      debugMessengerSocket('connected', { socketId: socket.id })
    }

    const handleDisconnect = (reason?: string) => {
      setIsConnected(false)
      debugMessengerSocket('disconnected', { reason })
    }

    const handleSocketError = (error: unknown) => {
      debugMessengerSocket('socket error event', error)
      const normalizedError = normalizeMessengerError(error, 'socket')

      if (AUTH_ERROR_PATTERN.test(normalizedError.message)) {
        setIsConnected(false)
        socket.disconnect()

        if (socketRef.current === socket) {
          socketRef.current = null
        }
      }

      reportError(normalizedError)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on(MESSENGER_SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceivedMessage)
    socket.on(MESSENGER_SOCKET_EVENTS.UPDATE_MESSAGE, handleReceivedMessage)
    socket.on(MESSENGER_SOCKET_EVENTS.MESSAGE_SEND, handleIncomingMessage)
    socket.on(MESSENGER_SOCKET_EVENTS.MESSAGE_DELETED, handleMessageDeleted)
    socket.on(MESSENGER_SOCKET_EVENTS.ERROR, handleSocketError)
    socket.on('connect_error', handleSocketError)
  }, [accessToken, disconnectSocket])

  useEffect(() => disconnectSocket, [disconnectSocket])

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

    debugMessengerSocket('emit receive-message', payload)
    socket.emit(MESSENGER_SOCKET_EVENTS.RECEIVE_MESSAGE, payload)

    return true
  }, [])

  return { isConnected, sendMessage }
}

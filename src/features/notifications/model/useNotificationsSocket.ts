'use client'
import { useCallback, useEffect, useRef } from 'react'

import { logger } from '@/shared/lib/logger'
import {
  WsNotificationPayload,
  WsNotificationPayloadRaw,
} from '@/shared/types/notifications/notification.models'
import { io, Socket } from 'socket.io-client'

const WS_URL = 'https://inctagram.work'
const WS_EVENTS = ['notifications', 'notification', 'NOTIFICATION'] as const

// Auth-related error indicators from Socket.IO connect_error
const AUTH_ERROR_INDICATORS = ['unauthorized', 'jwt', 'token', 'auth', '401', '403']

function isAuthError(err: Error): boolean {
  const msg = err.message?.toLowerCase() ?? ''

  return AUTH_ERROR_INDICATORS.some(indicator => msg.includes(indicator))
}

export function validateWsPayload(payload: unknown): payload is WsNotificationPayload {
  if (typeof payload !== 'object' || payload === null) {
    return false
  }
  const p = payload as WsNotificationPayloadRaw

  return (
    typeof p['id'] === 'number' &&
    typeof p['message'] === 'string' &&
    typeof p['isRead'] === 'boolean' &&
    typeof p['notifyAt'] === 'string'
  )
}

export interface UseNotificationsSocketOptions {
  accessToken: string | null
  onNotification: (payload: WsNotificationPayload) => void
  onInvalidPayload: () => void
  onAuthError: () => void
}

export function useNotificationsSocket({
  accessToken,
  onNotification,
  onInvalidPayload,
  onAuthError,
}: UseNotificationsSocketOptions): void {
  const socketRef = useRef<Socket | null>(null)
  const isReconnectingRef = useRef(false)

  // Stable callback refs — не пересоздаём socket при смене колбэков
  const onNotificationRef = useRef(onNotification)
  const onInvalidPayloadRef = useRef(onInvalidPayload)
  const onAuthErrorRef = useRef(onAuthError)

  useEffect(() => {
    onNotificationRef.current = onNotification
  })
  useEffect(() => {
    onInvalidPayloadRef.current = onInvalidPayload
  })
  useEffect(() => {
    onAuthErrorRef.current = onAuthError
  })

  /**
   * Регистрирует обработчики событий идемпотентно:
   * проверяет hasListeners перед каждым socket.on,
   * чтобы при reconnect не накапливались дубли.
   */
  const registerHandlers = useCallback((socket: Socket) => {
    // Единый handler для всех алиасов WS-событий
    const handleEvent = (raw: unknown) => {
      try {
        if (validateWsPayload(raw)) {
          onNotificationRef.current(raw)
        } else {
          logger.error('[NotificationsSocket] Invalid WS payload:', raw)
          onInvalidPayloadRef.current()
        }
      } catch (err) {
        logger.error('[NotificationsSocket] Error handling WS event:', err)
        onInvalidPayloadRef.current()
      }
    }

    for (const event of WS_EVENTS) {
      // Idempotent: не добавляем если уже есть listener
      if (socket.hasListeners(event)) {
        continue
      }
      socket.on(event, handleEvent)
    }

    if (!socket.hasListeners('error')) {
      socket.on('error', (err: unknown) => {
        logger.error('[NotificationsSocket] Socket error event:', err)
      })
    }
  }, [])

  /**
   * Создаёт и подключает socket с заданным токеном.
   * Навешивает connect_error handler с auth-aware reconnect flow.
   */
  const createSocket = useCallback(
    (token: string): Socket => {
      const socket = io(WS_URL, {
        query: { accessToken: token },
        autoConnect: true,
        reconnection: true, // позволяем автоматический reconnect при сетевых ошибках
        transports: ['websocket'],
      })

      registerHandlers(socket)

      socket.on('connect_error', async (err: Error) => {
        logger.warn('[NotificationsSocket] connect_error:', err.message)

        if (!isAuthError(err)) {
          // Сетевая ошибка — не трогаем, Socket.IO сам переподключится
          return
        }

        logger.info('[NotificationsSocket] Auth error detected, disconnecting and notifying app')
        socket.disconnect()
        onAuthErrorRef.current()
      })

      return socket
    },
    [registerHandlers]
  )

  useEffect(() => {
    if (!accessToken) {
      return
    }

    const socket = createSocket(accessToken)

    socketRef.current = socket

    return () => {
      logger.debug('[NotificationsSocket] Cleanup: disconnecting socket')
      socket.off() // снимаем все listeners
      socket.disconnect()
      socketRef.current = null
      isReconnectingRef.current = false
    }
  }, [accessToken, createSocket])
}

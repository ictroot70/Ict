'use client'
import { useCallback, useEffect, useRef } from 'react'

import { useAppDispatch } from '@/app/store'
import { API_ROUTES } from '@/shared/api/api-routes'
import { logout } from '@/shared/auth/authSlice'
import { logger } from '@/shared/lib/logger'
import { authTokenStorage } from '@/shared/lib/storage/auth-token'
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
  const dispatch = useAppDispatch()
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
   * Инициирует refresh flow через существующий endpoint.
   * Возвращает новый accessToken или null при неудаче.
   */
  const doRefresh = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`${getRefreshBaseUrl()}${API_ROUTES.AUTH.UPDATE_TOKENS}`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!res.ok) {
        return null
      }
      const data: unknown = await res.json()

      if (
        typeof data === 'object' &&
        data !== null &&
        'accessToken' in data &&
        typeof (data as Record<string, unknown>)['accessToken'] === 'string'
      ) {
        const newToken = (data as { accessToken: string }).accessToken

        authTokenStorage.setAccessToken(newToken)

        return newToken
      }

      return null
    } catch {
      return null
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
        reconnection: false, // управляем reconnect вручную для auth-aware flow
        transports: ['websocket'],
      })

      registerHandlers(socket)

      socket.on('connect_error', async (err: Error) => {
        logger.warn('[NotificationsSocket] connect_error:', err.message)

        if (!isAuthError(err)) {
          // Сетевая ошибка — не трогаем, Socket.IO сам переподключится
          return
        }

        if (isReconnectingRef.current) {
          return
        }
        isReconnectingRef.current = true

        logger.info('[NotificationsSocket] Auth error detected, initiating refresh flow')
        socket.disconnect()

        const newToken = await doRefresh()

        if (newToken) {
          logger.info('[NotificationsSocket] Refresh success, reconnecting with new token')
          // Пересоздаём socket с новым токеном
          socketRef.current = createSocket(newToken)
        } else {
          logger.warn('[NotificationsSocket] Refresh failed, dispatching logout')
          authTokenStorage.clear()
          dispatch(logout())
          onAuthErrorRef.current()
        }

        isReconnectingRef.current = false
      })

      return socket
    },
    [dispatch, doRefresh, registerHandlers]
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

/**
 * Возвращает base URL для refresh запроса.
 * Использует тот же origin что и API, но без /api суффикса.
 */
function getRefreshBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // В браузере используем относительный путь через Next.js proxy если он настроен,
    // иначе прямой URL бэкенда
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()

    if (apiUrl && /^https?:\/\//.test(apiUrl)) {
      return apiUrl
    }
  }

  return 'https://inctagram.work/api'
}

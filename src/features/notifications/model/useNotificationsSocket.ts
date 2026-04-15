import type { NotificationSocketPayload } from '@/shared/types/notifications/notification.models'

import { useEffect, useRef, useState } from 'react'

import { logger } from '@/shared/lib/logger'
import { authTokenStorage } from '@/shared/lib/storage/auth-token'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = 'https://inctagram.work'
const WS_EVENT_PATH = 'notifications'
const WS_ERROR_PATH = 'error'

// Compatibility alias paths from the plan
const COMPATIBILITY_ALIAS = ['notification', 'NOTIFICATION'] as const

interface UseNotificationsSocketReturn {
  isConnected: boolean
  onNewNotification: (cb: (payload: NotificationSocketPayload) => void) => void
  onError: (cb: (error: unknown) => void) => void
  disconnect: () => void
  reconnect: () => void
}

export function useNotificationsSocket(): UseNotificationsSocketReturn {
  const socketRef = useRef<Socket | null>(null)
  const handlersRef = useRef<{
    newNotification: Array<(payload: NotificationSocketPayload) => void>
    error: Array<(error: unknown) => void>
  }>({ newNotification: [], error: [] })
  const [isConnected, setIsConnected] = useState(false)
  const isConnectingRef = useRef(false)

  const connect = () => {
    if (isConnectingRef.current || socketRef.current?.connected) {
      return
    }

    const accessToken = authTokenStorage.getAccessToken()

    if (!accessToken) {
      logger.warn('[useNotificationsSocket] No access token, skipping connect')

      return
    }

    isConnectingRef.current = true
    logger.info('[useNotificationsSocket] Connecting to', SOCKET_URL)

    const socket = io(SOCKET_URL, {
      query: { accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
      logger.info('[useNotificationsSocket] Connected')
      setIsConnected(true)
      isConnectingRef.current = false
    })

    socket.on('disconnect', () => {
      logger.info('[useNotificationsSocket] Disconnected')
      setIsConnected(false)
    })

    // Main event path
    socket.on(WS_EVENT_PATH, (payload: NotificationSocketPayload) => {
      logger.debug('[useNotificationsSocket] Received notification:', payload)
      handlersRef.current.newNotification.forEach(cb => cb(payload))
    })

    // Compatibility alias listeners
    COMPATIBILITY_ALIAS.forEach(alias => {
      socket.on(alias, (payload: NotificationSocketPayload) => {
        logger.debug('[useNotificationsSocket] Received notification via alias:', alias, payload)
        handlersRef.current.newNotification.forEach(cb => cb(payload))
      })
    })

    socket.on(WS_ERROR_PATH, (error: unknown) => {
      logger.error('[useNotificationsSocket] Socket error:', error)
      handlersRef.current.error.forEach(cb => cb(error))
    })

    socket.on('connect_error', error => {
      logger.error('[useNotificationsSocket] Connect error:', error)
      setIsConnected(false)
      isConnectingRef.current = false

      // Auth error: disconnect and let caller handle reauth
      if (
        (error as { type?: string })?.type === 'Unauthorized' ||
        (error as { message?: string })?.message?.includes('401')
      ) {
        logger.warn('[useNotificationsSocket] Auth error, disconnecting')
        socket.disconnect()
      }
    })

    socketRef.current = socket
  }

  const disconnect = () => {
    if (socketRef.current) {
      logger.info('[useNotificationsSocket] Manual disconnect')
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
      isConnectingRef.current = false
    }
  }

  const reconnect = () => {
    disconnect()
    connect()
  }

  const onNewNotification = (cb: (payload: NotificationSocketPayload) => void) => {
    handlersRef.current.newNotification.push(cb)

    return () => {
      handlersRef.current.newNotification = handlersRef.current.newNotification.filter(
        h => h !== cb
      )
    }
  }

  const onError = (cb: (error: unknown) => void) => {
    handlersRef.current.error.push(cb)

    return () => {
      handlersRef.current.error = handlersRef.current.error.filter(h => h !== cb)
    }
  }

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [])

  return {
    isConnected,
    onNewNotification,
    onError,
    disconnect,
    reconnect,
  }
}

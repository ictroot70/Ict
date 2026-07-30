'use client'

import type { UseMessengerSocketOptions, UseMessengerSocketResult } from './messenger-socket.types'
import type { MessageAcknowledgement, SendMessagePayload } from './messenger.types'

import { useCallback, useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

import { isIncomingMessagePayload, normalizeMessengerError } from '../lib'
import { logger } from '@/shared/lib/logger'

import { MESSENGER_SOCKET_EVENTS } from './messenger.events'

const MESSENGER_SOCKET_URL = 'https://inctagram.work'

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

    logger.info('[MessengerSocket] Initializing socket connection to', MESSENGER_SOCKET_URL)

    const socket = io(MESSENGER_SOCKET_URL, {
      query: { accessToken },
      autoConnect: true,
      reconnection: true,
      transports: ['websocket'],
    })

    socketRef.current = socket
    logger.info('[MessengerSocket] Socket instance created')

    const handleConnect = () => {
      logger.info('[MessengerSocket] Connected successfully!')
      setIsConnected(true)
    }
    
    const handleDisconnect = () => {
      logger.warn('[MessengerSocket] Disconnected')
      setIsConnected(false)
    }

    // ДОБАВЛЕНО: Ловим ошибки подключения (timeout, auth error и т.д.)
    const handleConnectError = (err: Error) => {
      logger.error('[MessengerSocket] Connection error:', err.message, err)
      onErrorRef.current({
        source: 'socket',
        code: 'CONNECTION_ERROR',
        message: err.message,
      })
    }

    const handleReceiveMessage = (payload: unknown) => {
      if (!isIncomingMessagePayload(payload)) {
        onErrorRef.current({
          source: 'socket',
          code: 'INVALID_MESSAGE_PAYLOAD',
          message: 'Invalid incoming message payload',
        })
        return
      }

      Promise.resolve(onMessageRef.current(payload)).catch(err => {
        onErrorRef.current(normalizeMessengerError(err, 'socket'))
      })
    }

    const handleMessageSend = (payload: unknown, acknowledge: MessageAcknowledgement) => {
      if (!isIncomingMessagePayload(payload)) {
        onErrorRef.current({
          source: 'socket',
          code: 'INVALID_MESSAGE_PAYLOAD',
          message: 'Invalid incoming message payload',
        })
        return
      }

      Promise.resolve(onMessageRef.current(payload))
        .then(() => {
          acknowledge({ message: payload.messageText, receiverId: payload.receiverId })
        })
        .catch(err => {
          onErrorRef.current(normalizeMessengerError(err, 'socket'))
        })
    }

    const handleUpdateMessage = (payload: unknown) => {
      if (isIncomingMessagePayload(payload)) {
        Promise.resolve(onMessageRef.current(payload)).catch(err => {
          onErrorRef.current(normalizeMessengerError(err, 'socket'))
        })
      }
    }

    const handleSocketError = (payload: unknown) => {
      onErrorRef.current(normalizeMessengerError(payload, 'socket'))
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError) // <-- ВАЖНО
    socket.on(MESSENGER_SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage)
    socket.on(MESSENGER_SOCKET_EVENTS.MESSAGE_SEND, handleMessageSend)
    socket.on(MESSENGER_SOCKET_EVENTS.UPDATE_MESSAGE, handleUpdateMessage)
    socket.on(MESSENGER_SOCKET_EVENTS.ERROR, handleSocketError)

    return () => {
      logger.info('[MessengerSocket] Cleaning up socket connection')
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
      socket.off(MESSENGER_SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage)
      socket.off(MESSENGER_SOCKET_EVENTS.MESSAGE_SEND, handleMessageSend)
      socket.off(MESSENGER_SOCKET_EVENTS.UPDATE_MESSAGE, handleUpdateMessage)
      socket.off(MESSENGER_SOCKET_EVENTS.ERROR, handleSocketError)
      socket.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [accessToken])

  const sendMessage = useCallback(
    (payload: SendMessagePayload) => {
      const socket = socketRef.current

      if (!isConnected || !socket) {
        const error = {
          source: 'socket' as const,
          code: 'SOCKET_NOT_CONNECTED',
          message: 'Messenger socket is not connected',
        }

        logger.error('[MessengerSocket]', error.message)
        onErrorRef.current(error)
        return
      }

      logger.info('[MessengerSocket] Emitting message:', payload)
      socket.emit(MESSENGER_SOCKET_EVENTS.RECEIVE_MESSAGE, payload)
    },
    [isConnected]
  )

  return { isConnected, sendMessage }
}
// 'use client'

// import type { UseMessengerSocketOptions, UseMessengerSocketResult } from './messenger-socket.types'
// import type { MessageAcknowledgement, SendMessagePayload } from './messenger.types'

// import { useCallback, useEffect, useRef, useState } from 'react'
// import { io, type Socket } from 'socket.io-client'

// import { isIncomingMessagePayload, normalizeMessengerError } from '../lib'
// import { logger } from '@/shared/lib/logger'

// import { MESSENGER_SOCKET_EVENTS } from './messenger.events'

// const MESSENGER_SOCKET_URL = 'https://inctagram.work'

// export function useMessengerSocket({
//   accessToken,
//   onError,
//   onMessage,
// }: UseMessengerSocketOptions): UseMessengerSocketResult {
//   const [isConnected, setIsConnected] = useState(false)
//   const socketRef = useRef<Socket | null>(null)

//   const onMessageRef = useRef(onMessage)
//   const onErrorRef = useRef(onError)

//   useEffect(() => {
//     onMessageRef.current = onMessage
//   }, [onMessage])

//   useEffect(() => {
//     onErrorRef.current = onError
//   }, [onError])

//   useEffect(() => {
//     if (!accessToken) {
//       return
//     }

//     const socket = io(MESSENGER_SOCKET_URL, {
//       query: { accessToken },
//       autoConnect: true,
//       reconnection: true,
//       transports: ['websocket'],
//     })

//     socketRef.current = socket

//     const handleConnect = () => setIsConnected(true)
//     const handleDisconnect = () => setIsConnected(false)

//     const handleReceiveMessage = (payload: unknown) => {
//       if (!isIncomingMessagePayload(payload)) {
//         onErrorRef.current({
//           source: 'socket',
//           code: 'INVALID_MESSAGE_PAYLOAD',
//           message: 'Invalid incoming message payload',
//         })
//         return
//       }

//       Promise.resolve(onMessageRef.current(payload)).catch(err => {
//         onErrorRef.current(normalizeMessengerError(err, 'socket'))
//       })
//     }

//     const handleMessageSend = (payload: unknown, acknowledge: MessageAcknowledgement) => {
//       if (!isIncomingMessagePayload(payload)) {
//         onErrorRef.current({
//           source: 'socket',
//           code: 'INVALID_MESSAGE_PAYLOAD',
//           message: 'Invalid incoming message payload',
//         })
//         return
//       }

//       Promise.resolve(onMessageRef.current(payload))
//         .then(() => {
//           acknowledge({ message: payload.messageText, receiverId: payload.receiverId })
//         })
//         .catch(err => {
//           onErrorRef.current(normalizeMessengerError(err, 'socket'))
//         })
//     }

//     const handleUpdateMessage = (payload: unknown) => {
//       if (isIncomingMessagePayload(payload)) {
//         Promise.resolve(onMessageRef.current(payload)).catch(err => {
//           onErrorRef.current(normalizeMessengerError(err, 'socket'))
//         })
//       }
//     }

//     const handleSocketError = (payload: unknown) => {
//       onErrorRef.current(normalizeMessengerError(payload, 'socket'))
//     }

//     socket.on('connect', handleConnect)
//     socket.on('disconnect', handleDisconnect)
//     socket.on(MESSENGER_SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage)
//     socket.on(MESSENGER_SOCKET_EVENTS.MESSAGE_SEND, handleMessageSend)
//     socket.on(MESSENGER_SOCKET_EVENTS.UPDATE_MESSAGE, handleUpdateMessage)
//     socket.on(MESSENGER_SOCKET_EVENTS.ERROR, handleSocketError)

//     return () => {
//       socket.off('connect', handleConnect)
//       socket.off('disconnect', handleDisconnect)
//       socket.off(MESSENGER_SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage)
//       socket.off(MESSENGER_SOCKET_EVENTS.MESSAGE_SEND, handleMessageSend)
//       socket.off(MESSENGER_SOCKET_EVENTS.UPDATE_MESSAGE, handleUpdateMessage)
//       socket.off(MESSENGER_SOCKET_EVENTS.ERROR, handleSocketError)
//       socket.disconnect()
//       socketRef.current = null
//     }
//   }, [accessToken])

//   const sendMessage = useCallback(
//     (payload: SendMessagePayload) => {
//       const socket = socketRef.current

//       if (!isConnected || !socket) {
//         const error = {
//           source: 'socket' as const,
//           code: 'SOCKET_NOT_CONNECTED',
//           message: 'Messenger socket is not connected',
//         }

//         logger.error('[MessengerSocket]', error.message)
//         onErrorRef.current(error)

//         return
//       }

//       socket.emit(MESSENGER_SOCKET_EVENTS.RECEIVE_MESSAGE, payload)
//     },
//     [isConnected]
//   )

//   return { isConnected, sendMessage }
// }

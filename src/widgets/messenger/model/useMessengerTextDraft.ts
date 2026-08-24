'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { MessageStatus, MessageType, type MessageViewModel } from '@/entities/messenger'

import { useMessengerRealtimeConnection } from './messenger-realtime-context'

const SEND_CONFIRMATION_TIMEOUT_MS = 10_000

type TextSendError = 'connection' | 'sendFailed'

interface UseMessengerTextDraftOptions {
  messages: readonly MessageViewModel[]
  receiverId: number
  senderId: number
  onRemoveOptimistic: (messageId: number) => void
  onSendStarted: (message: MessageViewModel) => void
}

interface PendingTextMessage {
  createdAt: number
  id: number
  text: string
}

export function useMessengerTextDraft({
  messages,
  receiverId,
  senderId,
  onRemoveOptimistic,
  onSendStarted,
}: UseMessengerTextDraftOptions) {
  const { isConnected, sendMessage } = useMessengerRealtimeConnection()
  const [draftText, setDraftText] = useState('')
  const [error, setError] = useState<TextSendError | null>(null)
  const [isSending, setIsSending] = useState(false)
  const pendingRef = useRef<PendingTextMessage | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearConfirmationTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const failPendingSend = useCallback(
    (nextError: TextSendError) => {
      const pending = pendingRef.current

      if (!pending) {
        return
      }

      clearConfirmationTimeout()
      onRemoveOptimistic(pending.id)
      pendingRef.current = null
      setIsSending(false)
      setError(nextError)
    },
    [clearConfirmationTimeout, onRemoveOptimistic]
  )

  useEffect(() => () => clearConfirmationTimeout(), [clearConfirmationTimeout])

  useEffect(() => {
    const pending = pendingRef.current

    if (!pending) {
      return
    }

    const isConfirmed = messages.some(message => {
      const createdAt = new Date(message.createdAt).getTime()

      return (
        message.id > 0 &&
        message.ownerId === senderId &&
        message.receiverId === receiverId &&
        message.messageType === MessageType.TEXT &&
        message.messageText === pending.text &&
        createdAt >= pending.createdAt - 1_000
      )
    })

    if (!isConfirmed) {
      return
    }

    clearConfirmationTimeout()
    onRemoveOptimistic(pending.id)
    pendingRef.current = null
    setDraftText('')
    setIsSending(false)
    setError(null)
  }, [clearConfirmationTimeout, messages, onRemoveOptimistic, receiverId, senderId])

  const send = useCallback(() => {
    const text = draftText.trim()

    if (!text || isSending || senderId <= 0) {
      return
    }

    if (!isConnected) {
      setError('connection')

      return
    }

    const createdAt = Date.now()
    const optimisticMessage: MessageViewModel = {
      id: -createdAt,
      ownerId: senderId,
      receiverId,
      messageText: text,
      mediaContent: null,
      status: MessageStatus.SENT,
      messageType: MessageType.TEXT,
      createdAt: new Date(createdAt).toISOString(),
      updatedAt: new Date(createdAt).toISOString(),
    }

    pendingRef.current = { createdAt, id: optimisticMessage.id, text }
    setError(null)
    setIsSending(true)
    onSendStarted(optimisticMessage)

    if (!sendMessage({ message: text, receiverId })) {
      failPendingSend('connection')

      return
    }

    clearConfirmationTimeout()
    timeoutRef.current = setTimeout(
      () => failPendingSend('sendFailed'),
      SEND_CONFIRMATION_TIMEOUT_MS
    )
  }, [
    clearConfirmationTimeout,
    draftText,
    failPendingSend,
    isConnected,
    isSending,
    onSendStarted,
    receiverId,
    sendMessage,
    senderId,
  ])

  return {
    draftText,
    error,
    isSending,
    send,
    setDraftText,
  }
}

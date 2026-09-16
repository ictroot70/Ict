'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { MessageType, type MessageViewModel } from '@/entities/messenger'

/**
 * Bulk-loads server-decoded waveforms for every voice message in `messages` that doesn't
 * already have one cached, and exposes setters used by the optimistic send flow to seed a
 * locally-computed waveform before the message is persisted (`setWaveform`), carry it over
 * once the optimistic message is replaced by the server response (`moveWaveform`), or drop it
 * if the optimistic message is discarded (`removeWaveform`).
 */
export function useMessengerMessageWaveforms(messages: readonly MessageViewModel[]) {
  const [messageWaveforms, setMessageWaveforms] = useState<Record<number, readonly number[]>>({})
  const messageWaveformsRef = useRef(messageWaveforms)

  useEffect(() => {
    messageWaveformsRef.current = messageWaveforms
  }, [messageWaveforms])

  useEffect(() => {
    const controller = new AbortController()

    const loadWaveforms = async () => {
      const voiceMessages = messages.filter(
        message =>
          message.messageType === MessageType.VOICE &&
          message.mediaContent?.fileUrl &&
          !messageWaveformsRef.current[message.id]
      )

      if (voiceMessages.length === 0) {
        return
      }

      await Promise.all(
        voiceMessages.map(async message => {
          const url = message.mediaContent?.fileUrl

          if (!url) {
            return
          }

          try {
            const response = await fetch(
              `/api/messenger/voice-waveform?url=${encodeURIComponent(url)}`,
              { signal: controller.signal }
            )

            if (!response.ok) {
              return
            }

            const data = (await response.json()) as { waveform?: number[] }

            if (!Array.isArray(data.waveform)) {
              return
            }

            setMessageWaveforms(currentWaveforms => ({
              ...currentWaveforms,
              [message.id]: data.waveform ?? [],
            }))
          } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
              return
            }
          }
        })
      )
    }

    void loadWaveforms()

    return () => {
      controller.abort()
    }
  }, [messages])

  const setWaveform = useCallback((messageId: number, waveform: readonly number[]) => {
    setMessageWaveforms(currentWaveforms => ({
      ...currentWaveforms,
      [messageId]: waveform,
    }))
  }, [])

  const moveWaveform = useCallback((fromMessageId: number, toMessage: MessageViewModel) => {
    setMessageWaveforms(currentWaveforms => {
      const waveform = currentWaveforms[fromMessageId]
      const nextWaveforms = { ...currentWaveforms }

      delete nextWaveforms[fromMessageId]

      if (waveform) {
        nextWaveforms[toMessage.id] = waveform
      }

      return nextWaveforms
    })
  }, [])

  const removeWaveform = useCallback((messageId: number) => {
    setMessageWaveforms(currentWaveforms => {
      const nextWaveforms = { ...currentWaveforms }

      delete nextWaveforms[messageId]

      return nextWaveforms
    })
  }, [])

  return { messageWaveforms, moveWaveform, removeWaveform, setWaveform }
}

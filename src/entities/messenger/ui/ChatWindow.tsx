'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  isIncomingMessage,
  MessageStatus,
  MessageType,
  type MessageViewModel,
} from '@/entities/messenger'
import { LinearProgress } from '@/shared/composites'

import styles from './ChatWindow.module.scss'

import { playVoiceTransitionTone } from '../lib/play-voice-transition-tone'
import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'

interface ChatWindowProps {
  currentUserId: number
  messages?: MessageViewModel[]
  voiceWaveforms?: Readonly<Record<number, readonly number[]>>
  partnerAvatarUrl?: string
  onSend?: (message: string) => void
  sendDisabled?: boolean
  error?: string | null
  isLoading?: boolean
  composerActionsSlot?: React.ReactNode
  composerContentSlot?: React.ReactNode
  composerError?: string | null
}

const getBubbleType = (type: MessageType) => {
  if (type === MessageType.IMAGE) {
    return 'image'
  }

  if (type === MessageType.VOICE) {
    return 'voice'
  }

  return 'text'
}

const formatTime = (value: string) =>
  new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

export const ChatWindow: React.FC<ChatWindowProps> = ({
  currentUserId,
  messages,
  voiceWaveforms,
  partnerAvatarUrl,
  onSend,
  sendDisabled,
  error,
  isLoading = false,
  composerActionsSlot,
  composerContentSlot,
  composerError,
}) => {
  const [text, setText] = useState('')
  const [activeVoiceMessageId, setActiveVoiceMessageId] = useState<number | null>(null)
  const voiceTransitionIdRef = useRef(0)
  const playbackOrderedMessages = useMemo(() => messages || [], [messages])
  const renderedMessages = useMemo(
    () => [...playbackOrderedMessages].reverse(),
    [playbackOrderedMessages]
  )

  const getNextVoiceMessageId = useCallback(
    (messageId: number) => {
      const currentIndex = playbackOrderedMessages.findIndex(message => message.id === messageId)
      const nextMessage = playbackOrderedMessages[currentIndex + 1]

      if (
        currentIndex === -1 ||
        !nextMessage ||
        nextMessage.messageType !== MessageType.VOICE ||
        !nextMessage.mediaContent?.fileUrl
      ) {
        return null
      }

      return nextMessage.id
    },
    [playbackOrderedMessages]
  )

  const handleVoicePlaybackStart = useCallback((messageId: number) => {
    voiceTransitionIdRef.current += 1
    setActiveVoiceMessageId(messageId)
  }, [])

  const handleVoicePlaybackPause = useCallback((messageId: number) => {
    voiceTransitionIdRef.current += 1
    setActiveVoiceMessageId(currentMessageId =>
      currentMessageId === messageId ? null : currentMessageId
    )
  }, [])

  const handleVoicePlaybackEnded = useCallback(
    (messageId: number) => {
      const nextVoiceMessageId = getNextVoiceMessageId(messageId)

      if (nextVoiceMessageId === null) {
        setActiveVoiceMessageId(null)

        return
      }

      const transitionId = voiceTransitionIdRef.current + 1

      voiceTransitionIdRef.current = transitionId
      setActiveVoiceMessageId(null)

      void playVoiceTransitionTone()
        .finally(() => {
          setActiveVoiceMessageId(currentMessageId => {
            if (voiceTransitionIdRef.current !== transitionId) {
              return currentMessageId
            }

            return nextVoiceMessageId
          })
        })
        .catch(() => undefined)
    },
    [getNextVoiceMessageId]
  )

  useEffect(() => {
    if (activeVoiceMessageId === null) {
      return
    }

    const activeMessage = playbackOrderedMessages.find(
      message => message.id === activeVoiceMessageId
    )

    if (
      !activeMessage ||
      activeMessage.messageType !== MessageType.VOICE ||
      !activeMessage.mediaContent?.fileUrl
    ) {
      setActiveVoiceMessageId(null)
    }
  }, [activeVoiceMessageId, playbackOrderedMessages])

  const handleSend = () => {
    const message = text.trim()

    if (!message || !onSend) {
      return
    }

    onSend(message)
    setText('')
  }

  return (
    <div className={styles.container}>
      <LinearProgress active={isLoading} />
      <div className={styles.messagesArea}>
        {renderedMessages.map((message, index, array) => {
          const isIncoming = isIncomingMessage(message, currentUserId)
          const prevMsg = array[index - 1]
          const isPrevIncoming = prevMsg && isIncomingMessage(prevMsg, currentUserId)
          const showAvatar = isIncoming && !isPrevIncoming
          const isVoiceMessage = message.messageType === MessageType.VOICE
          const hasVoiceSource = isVoiceMessage && Boolean(message.mediaContent?.fileUrl)

          return (
            <MessageBubble
              key={message.id}
              text={message.messageText ?? ''}
              direction={isIncoming ? 'incoming' : 'outgoing'}
              timestamp={formatTime(message.createdAt)}
              type={getBubbleType(message.messageType)}
              url={message.mediaContent?.fileUrl}
              avatarUrl={partnerAvatarUrl}
              showAvatar={showAvatar}
              isRead={message.status === MessageStatus.READ}
              voiceWaveform={voiceWaveforms?.[message.id]}
              isVoicePlaybackRequested={hasVoiceSource && activeVoiceMessageId === message.id}
              onVoicePlaybackStart={
                hasVoiceSource ? () => handleVoicePlaybackStart(message.id) : undefined
              }
              onVoicePlaybackPause={
                hasVoiceSource ? () => handleVoicePlaybackPause(message.id) : undefined
              }
              onVoicePlaybackEnded={
                hasVoiceSource ? () => handleVoicePlaybackEnded(message.id) : undefined
              }
            />
          )
        })}
      </div>

      <MessageComposer
        value={text}
        onChange={setText}
        onSend={handleSend}
        disabled={!onSend || sendDisabled}
        error={composerError ?? error}
        actionsSlot={composerActionsSlot}
        contentSlot={composerContentSlot}
      />
    </div>
  )
}

'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'

import { isIncomingMessage, MessageType, type MessageViewModel } from '@/entities/messenger'
import { LinearProgress } from '@/shared/composites'

import styles from './ChatWindow.module.scss'

import { playVoiceTransitionTone } from '../lib/play-voice-transition-tone'
import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'
import { useChatWindowAutoScroll } from './useChatWindowAutoScroll'

interface ChatWindowProps {
  currentUserId: number
  messages?: MessageViewModel[]
  voiceWaveforms?: Readonly<Record<number, readonly number[]>>
  partnerAvatarUrl?: string
  onSend?: (message: string) => void
  sendDisabled?: boolean
  error?: string | null
  isLoading?: boolean
  firstItemIndex?: number
  hasOlderMessages?: boolean
  isLoadingOlderMessages?: boolean
  onLoadOlderMessages?: () => void
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
  firstItemIndex = 0,
  hasOlderMessages = false,
  isLoadingOlderMessages = false,
  onLoadOlderMessages,
  composerActionsSlot,
  composerContentSlot,
  composerError,
}) => {
  const [text, setText] = useState('')
  const [activeVoiceMessageId, setActiveVoiceMessageId] = useState<number | null>(null)
  const voiceTransitionIdRef = React.useRef(0)
  const playbackOrderedMessages = useMemo(() => messages || [], [messages])
  const virtuosoRef = useChatWindowAutoScroll({
    currentUserId,
    firstItemIndex,
    messages: playbackOrderedMessages,
  })

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

  const handleStartReached = useCallback(() => {
    if (!hasOlderMessages || isLoadingOlderMessages) {
      return
    }

    onLoadOlderMessages?.()
  }, [hasOlderMessages, isLoadingOlderMessages, onLoadOlderMessages])

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
      <Virtuoso
        ref={virtuosoRef}
        className={styles.messagesArea}
        style={{ overflowX: 'hidden' }}
        data={playbackOrderedMessages}
        firstItemIndex={firstItemIndex}
        followOutput={'smooth'}
        startReached={handleStartReached}
        components={{
          // CSS padding on the scroller itself isn't reliable for virtualized lists — Virtuoso
          // positions rows against its own measured content box, so horizontal *and* vertical
          // padding on the scroll container can end up not applying visually (content sticks to
          // the edges). Header/Footer render as normal in-flow DOM nodes before the first and
          // after the last item, so spacing added here is immune to that.
          Header: () => (
            <div className={styles.listEdgeSpacer}>
              {isLoadingOlderMessages && (
                <div className={styles.historyLoader}>Loading older messages...</div>
              )}
            </div>
          ),
          Footer: () => <div className={styles.listEdgeSpacer} />,
        }}
        computeItemKey={(index, message) => message.id}
        itemContent={(index, message) => {
          const isIncoming = isIncomingMessage(message, currentUserId)
          const prevMsg = playbackOrderedMessages[index - 1]
          const isPrevIncoming = prevMsg && isIncomingMessage(prevMsg, currentUserId)
          const showAvatar = isIncoming && !isPrevIncoming
          const isVoiceMessage = message.messageType === MessageType.VOICE
          const hasVoiceSource = isVoiceMessage && Boolean(message.mediaContent?.fileUrl)

          return (
            <MessageBubble
              text={message.messageText ?? ''}
              direction={isIncoming ? 'incoming' : 'outgoing'}
              timestamp={formatTime(message.createdAt)}
              type={getBubbleType(message.messageType)}
              url={message.mediaContent?.fileUrl}
              avatarUrl={partnerAvatarUrl}
              showAvatar={showAvatar}
              status={message.status}
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
        }}
      />

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

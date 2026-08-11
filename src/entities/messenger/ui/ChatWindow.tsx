'use client'

import React, { useEffect, useRef } from 'react'

import { LinearProgress } from '@/shared/composites'
import { formatTime } from '@/shared/lib/formatters'
import { Typography } from '@ictroot/ui-kit'

import styles from './ChatWindow.module.scss'

import { MessageStatus, MessageType } from '../model/messenger.types'
import { useMessengerCenter } from '../model/useMessengerCenter'
import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'

interface ChatWindowProps {
  dialoguePartnerId: number
  currentUserId: number
  partnerName: string
  partnerAvatarUrl?: string
  hasAttachment?: boolean
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

const NEAR_BOTTOM_PX = 80

export const ChatWindow: React.FC<ChatWindowProps> = ({
  dialoguePartnerId,
  currentUserId,
  partnerName,
  partnerAvatarUrl,
  hasAttachment = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const messagesAreaRef = useRef<HTMLDivElement | null>(null)
  const shouldStickToBottomRef = useRef(true)
  const isInitialScrollRef = useRef(true)
  const {
    messages,
    isFetching,
    isLoading,
    historyError,
    draftText,
    setDraftText,
    sendTextMessage,
    isSending,
    sendError,
  } = useMessengerCenter(dialoguePartnerId, currentUserId, {
    userName: partnerName,
    avatarUrl: partnerAvatarUrl,
  })

  const handleSend = () => {
    sendTextMessage(draftText, dialoguePartnerId)
  }

  const handleMessagesScroll = () => {
    const area = messagesAreaRef.current

    if (!area) {
      return
    }

    const distanceToBottom = area.scrollHeight - area.scrollTop - area.clientHeight

    shouldStickToBottomRef.current = distanceToBottom <= NEAR_BOTTOM_PX
  }

  useEffect(() => {
    isInitialScrollRef.current = true
    shouldStickToBottomRef.current = true
  }, [dialoguePartnerId])

  useEffect(() => {
    if (!shouldStickToBottomRef.current) {
      return
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: isInitialScrollRef.current ? 'auto' : 'smooth',
    })
    isInitialScrollRef.current = false
  }, [messages])

  return (
    <div className={styles.container}>
      <LinearProgress active={isFetching} />

      <div className={styles.messagesArea} ref={messagesAreaRef} onScroll={handleMessagesScroll}>
        {historyError && (
          <Typography variant={'regular_14'} className={styles.historyError}>
            {historyError}
          </Typography>
        )}

        {!historyError && isLoading && messages.length === 0 && (
          <Typography variant={'regular_14'} className={styles.historyStatus}>
            Loading messages...
          </Typography>
        )}

        {messages.map((message, index) => {
          const isIncoming = message.ownerId !== currentUserId
          const prevMsg = messages[index - 1]
          const isPrevIncoming = prevMsg && prevMsg.ownerId !== currentUserId
          const showAvatar = isIncoming && !isPrevIncoming

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
            />
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <MessageComposer
        value={draftText}
        onChange={setDraftText}
        onSend={handleSend}
        pending={isSending}
        error={sendError}
        hasAttachment={hasAttachment}
      />
    </div>
  )
}

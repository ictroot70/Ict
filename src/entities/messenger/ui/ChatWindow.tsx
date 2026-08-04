'use client'

import React, { useEffect, useRef } from 'react'

import { LinearProgress } from '@/shared/composites'
import { formatTime } from '@/shared/lib/formatters'

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

export const ChatWindow: React.FC<ChatWindowProps> = ({
  dialoguePartnerId,
  currentUserId,
  partnerName,
  partnerAvatarUrl,
  hasAttachment = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const { messages, isFetching, draftText, setDraftText, sendTextMessage, isSending, sendError } =
    useMessengerCenter(dialoguePartnerId, currentUserId, {
      userName: partnerName,
      avatarUrl: partnerAvatarUrl,
    })

  const handleSend = () => {
    sendTextMessage(draftText, dialoguePartnerId)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className={styles.container}>
      <LinearProgress active={isFetching} />

      <div className={styles.messagesArea}>
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

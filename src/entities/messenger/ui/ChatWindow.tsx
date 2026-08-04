'use client'

import React, { useState } from 'react'

import { MessageStatus, MessageType, type MessageViewModel } from '@/entities/messenger/model'
import { LinearProgress } from '@/shared/composites'
import { formatTime } from '@/shared/lib/formatters'

import styles from './ChatWindow.module.scss'

import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'

interface ChatWindowProps {
  currentUserId: number
  messages?: MessageViewModel[]
  partnerAvatarUrl?: string
  onSend?: (message: string) => void
  sendDisabled?: boolean
  error?: string | null
  isLoading?: boolean
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
  currentUserId,
  messages,
  partnerAvatarUrl,
  onSend,
  sendDisabled,
  error,
  isLoading = false,
}) => {
  const [text, setText] = useState('')
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
      {/* Messages Area */}
      <div className={styles.messagesArea}>
        {[...(messages || [])].reverse().map((message, index, array) => {
          const isIncoming = message.ownerId !== currentUserId
          const prevMsg = array[index - 1]
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
      </div>

      {/* Message Composer */}
      <MessageComposer
        value={text}
        onChange={setText}
        onSend={handleSend}
        disabled={!onSend || sendDisabled}
        error={error}
      />
    </div>
  )
}

'use client'

import React from 'react'

import { LinearProgress } from '@/shared/composites'

import styles from './ChatWindow.module.scss'

import { MessageStatus, MessageType, type MessageViewModel } from '../model/messenger.types'
import { useMessengerCenter } from '../model/useMessengerCenter'
import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'

interface ChatWindowProps {
  dialoguePartnerId: number
  partnerName: string
  partnerAvatarUrl?: string
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
  dialoguePartnerId,
  partnerName,
  partnerAvatarUrl,
}) => {
  const {
    messages,
    isFetching,
    draftText,
    setDraftText,
    sendTextMessage,
    isSending,
    sendError,
    currentUserId,
  } = useMessengerCenter(dialoguePartnerId, {
    userName: partnerName,
    avatarUrl: partnerAvatarUrl,
  })

  const handleSend = () => {
    sendTextMessage(draftText, dialoguePartnerId)
  }

  return (
    <div className={styles.container}>
      <LinearProgress active={isFetching} />

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

      <MessageComposer
        value={draftText}
        onChange={setDraftText}
        onSend={handleSend}
        pending={isSending}
        error={sendError}
      />
    </div>
  )
}

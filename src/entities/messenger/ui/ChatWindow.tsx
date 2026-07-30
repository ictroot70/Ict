'use client'

import React from 'react'

import styles from './ChatWindow.module.scss'

import { MessageStatus, type MessageViewModel } from '../model/messenger.types'
import { useMessengerCenter } from '../model/useMessengerCenter'
import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'

interface ChatWindowProps {
  dialoguePartnerId: number
  partnerName: string
  partnerAvatarUrl?: string
}

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
  } = useMessengerCenter(dialoguePartnerId)

  const handleSend = () => {
    sendTextMessage(draftText, dialoguePartnerId)
  }

  const renderMessages = () => {
    if (isFetching && messages.length === 0) {
      return <div className={styles.loading}>Загрузка сообщений...</div>
    }

    const reversedMessages = [...messages].reverse()

    return reversedMessages.map((msg, index, array) => {
      const isOutgoing = msg.ownerId === currentUserId
      const prevMsg = array[index - 1]
      const isPrevOutgoing = prevMsg && prevMsg.ownerId === currentUserId
      const showAvatar = !isOutgoing && !isPrevOutgoing

      return (
        <MessageBubble
          key={msg.id}
          text={msg.messageText}
          direction={isOutgoing ? 'outgoing' : 'incoming'}
          timestamp={new Date(msg.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
          type={'text'}
          avatarUrl={!isOutgoing ? partnerAvatarUrl : undefined}
          showAvatar={showAvatar}
          isRead={isOutgoing && msg.status === MessageStatus.READ}
        />
      )
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.messagesArea}>{renderMessages()}</div>

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

import React from 'react'

import { Chat, Message } from '@/shared/api/messenger-mocks'

import styles from './ChatWindow.module.scss'

import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'

interface ChatWindowProps {
  chat?: Chat
  messages?: Message[]
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chat, messages }) => {
  if (!chat) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyTitle}>Choose who you would like to talk to</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Messages Area */}
      <div className={styles.messagesArea}>
        {[...(messages || [])].reverse().map(msg => (
          <MessageBubble
            key={msg.id}
            text={msg.text}
            direction={msg.senderId === 'me' ? 'outgoing' : 'incoming'}
            timestamp={msg.timestamp}
            type={msg.type}
            url={msg.url}
          />
        ))}
      </div>

      {/* Message Composer */}
      <MessageComposer />
    </div>
  )
}

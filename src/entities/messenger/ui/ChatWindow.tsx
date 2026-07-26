'use client'

import React, { useState } from 'react'

import { Chat, Message } from '@/shared/api/messenger-mocks'

import styles from './ChatWindow.module.scss'

import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'

interface ChatWindowProps {
  chat?: Chat
  messages?: Message[]
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chat, messages }) => {
  const [text, setText] = useState('')

  return (
    <div className={styles.container}>
      {/* Messages Area */}
      <div className={styles.messagesArea}>
        {[...(messages || [])].reverse().map((msg, index, array) => {
          const isIncoming = msg.senderId !== 'me'
          const prevMsg = array[index - 1]
          const isPrevIncoming = prevMsg && prevMsg.senderId !== 'me'
          const showAvatar = isIncoming && !isPrevIncoming

          return (
            <MessageBubble
              key={msg.id}
              text={msg.text}
              direction={isIncoming ? 'incoming' : 'outgoing'}
              timestamp={msg.timestamp}
              type={msg.type}
              url={msg.url}
              avatarUrl={chat?.avatarUrl}
              showAvatar={showAvatar}
              isRead={index % 3 === 0}
            />
          )
        })}
      </div>

      {/* Message Composer */}
      <MessageComposer
        value={text}
        onChange={setText}
        onSend={() => {
          setText('')
        }}
      />
    </div>
  )
}

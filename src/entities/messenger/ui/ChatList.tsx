'use client'

import React from 'react'

import { Chat } from '@/shared/api/messenger-mocks'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import styles from './ChatList.module.scss'

interface ChatListProps {
  chats: Chat[]
  searchQuery: string
}

export const ChatList: React.FC<ChatListProps> = ({ chats, searchQuery }) => {
  const pathname = usePathname()

  const filteredChats = chats.filter(chat =>
    chat.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {filteredChats.length > 0 ? (
          filteredChats.map(chat => {
            const isSelected = pathname === `/messenger/${chat.userId}`

            return (
              <Link
                key={chat.id}
                href={`/messenger/${chat.userId}`}
                className={styles.chatItem + (isSelected ? ' ' + styles.selected : '')}
              >
                <img src={chat.avatarUrl} alt={chat.username} className={styles.avatar} />
                <div className={styles.info}>
                  <div className={styles.headerRow}>
                    <span className={styles.name}>{chat.username}</span>
                    <span className={styles.time}>{chat.lastMessageTimestamp}</span>
                  </div>
                  <div className={styles.lastMsg}>{chat.lastMessage}</div>
                </div>
              </Link>
            )
          })
        ) : (
          <div className={styles.noResults}>No chats found</div>
        )}
      </div>
    </div>
  )
}

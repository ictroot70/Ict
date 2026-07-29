'use client'

import React from 'react'

import { Chat } from '@/shared/api/messenger-mocks'
import { Avatar } from '@/shared/composites'
import { Typography } from '@ictroot/ui-kit'
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
                <Avatar image={chat.avatarUrl} alt={chat.username} size={48} />
                <div className={styles.info}>
                  <div className={styles.headerRow}>
                    <Typography variant={'regular_14'} className={styles.name}>
                      {chat.username}
                    </Typography>
                    <Typography variant={'small_text'} className={styles.time}>
                      {chat.lastMessageTimestamp}
                    </Typography>
                  </div>
                  <Typography variant={'small_text'} className={styles.lastMsg}>
                    {chat.lastMessage}
                  </Typography>
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

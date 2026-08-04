'use client'

import type { MessengerListItem } from '@/entities/messenger/model'

import React from 'react'

import { Avatar } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant'
import { formatTime } from '@/shared/lib/formatters'
import { Typography } from '@ictroot/ui-kit'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import styles from './ChatList.module.scss'

interface ChatListProps {
  items: MessengerListItem[]
  searchQuery: string
  isError?: boolean
}

export const ChatList: React.FC<ChatListProps> = ({ items, searchQuery, isError }) => {
  const pathname = usePathname()

  const renderItems = () => {
    if (isError) {
      return <div className={styles.noResults}>Could not load users</div>
    }

    if (items.length === 0) {
      return (
        <div className={styles.noResults}>
          {searchQuery.trim() ? 'No users found' : 'No conversations yet'}
        </div>
      )
    }

    return items.map(item => {
      const href = APP_ROUTES.MESSENGER.DIALOGUE(item.userId)
      const isSelected = pathname === href

      return (
        <Link
          key={item.userId}
          href={href}
          className={styles.chatItem + (isSelected ? ' ' + styles.selected : '')}
        >
          <Avatar image={item.avatarUrl} alt={item.userName} size={48} />
          <div className={styles.info}>
            <div className={styles.headerRow}>
              <Typography variant={'regular_14'} className={styles.name}>
                {item.userName}
              </Typography>
              <Typography variant={'small_text'} className={styles.time}>
                {formatTime(item.updatedAt)}
              </Typography>
            </div>
            <Typography variant={'small_text'} className={styles.lastMsg}>
              {item.lastMessage}
            </Typography>
          </div>
        </Link>
      )
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.list}>{renderItems()}</div>
    </div>
  )
}

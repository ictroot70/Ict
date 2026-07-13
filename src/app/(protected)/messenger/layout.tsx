'use client'

import React, { useState } from 'react'

import { ChatList } from '@/entities/messenger/ui/ChatList'
import { MOCK_CHATS } from '@/shared/api/messenger-mocks'
import { Typography, Input } from '@ictroot/ui-kit'
import { usePathname } from 'next/navigation'

import styles from '@/entities/messenger/ui/MessengerLayout.module.scss'

export default function MessengerLayout({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()

  const chatUserId = pathname?.split('/').filter(Boolean).pop()
  const activeChat = MOCK_CHATS.find(
    chat => chat.userId === chatUserId && pathname?.includes('/messenger/')
  )

  return (
    <>
      <Typography variant={'h1'}>Messenger</Typography>
      <div className={styles.container}>
        <div className={styles.searchArea}>
          <Input
            inputType={'search'}
            placeholder={'Input search'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.headerArea}>
          {activeChat && (
            <div className={styles.activeChatHeader}>
              <img
                src={activeChat.avatarUrl}
                alt={activeChat.username}
                className={styles.headerAvatar}
              />
              <Typography variant={'h1'}>{activeChat.username}</Typography>
            </div>
          )}
        </div>
        <div className={styles.sidebar}>
          <ChatList chats={MOCK_CHATS} searchQuery={searchQuery} />
        </div>
        <div className={styles.main}>{children}</div>
      </div>
    </>
  )
}

'use client'

import React from 'react'

import { MessengerRealtimeProvider } from '@/entities/messenger/model/MessengerRealtimeProvider'
import { ChatList } from '@/entities/messenger/ui/ChatList'
import { Avatar, LinearProgress } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant'
import { Typography, Input } from '@ictroot/ui-kit'
import Link from 'next/link'

import styles from './MessengerShell.module.scss'

import { useMessengerShell } from '../model'

export const MessengerShell = ({ children }: { children: React.ReactNode }) => {
  const { activeProfile, items, searchQuery, setSearchQuery, isLoading, isError, currentUserId } =
    useMessengerShell()

  return (
    <MessengerRealtimeProvider currentUserId={currentUserId}>
      <LinearProgress active={isLoading} />
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
          {activeProfile && (
            <Link
              href={APP_ROUTES.PROFILE.ID(activeProfile.id)}
              className={styles.activeChatHeader}
            >
              <Avatar
                image={activeProfile.avatars[0]?.url}
                alt={activeProfile.userName}
                size={48}
              />
              <Typography variant={'regular_16'}>{activeProfile.userName}</Typography>
            </Link>
          )}
        </div>
        <div className={styles.sidebar}>
          <ChatList items={items} searchQuery={searchQuery} isError={isError} />
        </div>
        <div className={styles.main}>{children}</div>
      </div>
    </MessengerRealtimeProvider>
  )
}

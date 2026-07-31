'use client'

import type { AppDispatch } from '@/app/store'

import React, { useState, useMemo, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { MessageStatus, MessageType } from '@/entities/messenger'
import { messengerApi, useGetMessengerDialogsQuery } from '@/entities/messenger/api/messenger.api'
import { ChatList } from '@/entities/messenger/ui/ChatList'
import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { Avatar, LinearProgress } from '@/shared/composites'
import { Typography, Input } from '@ictroot/ui-kit'
import { usePathname } from 'next/navigation'

import styles from './MessengerShell.module.scss'

import { useMessengerShell } from '../model'

export const MessengerShell = ({ children }: { children: React.ReactNode }) => {
  const { activeProfile, items, searchQuery, setSearchQuery, isLoading, isError } =
    useMessengerShell()
  const dispatch = useDispatch() as AppDispatch
  const { user } = useAuthUiState()
  const pathname = usePathname()

  const chatPartnerIdStr = pathname?.split('/').filter(Boolean).pop()
  const chatPartnerId = chatPartnerIdStr ? Number(chatPartnerIdStr) : null

  useEffect(() => {
    if (chatPartnerId && user?.userId && items.length === 0) {
      const hasDialogue = items.some(d => d.userId === chatPartnerId)

      if (!hasDialogue) {
        dispatch(
          messengerApi.util.upsertQueryData(
            'getMessengerDialogs',
            {},
            {
              items: [
                {
                  id: Date.now(),
                  ownerId: user.userId,
                  receiverId: chatPartnerId,
                  messageText: 'Начните общение',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  messageType: MessageType.TEXT,
                  status: MessageStatus.SENT,
                  userName: `User ${chatPartnerId}`,
                  avatars: [],
                  notReadCount: 0,
                  mediaContent: null,
                },
              ],
              totalCount: 1,
              pageSize: 12,
              notReadCount: 0,
            }
          )
        )
      }
    }
  }, [chatPartnerId, user?.userId, items.length, items, dispatch])

  return (
    <>
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
            <div className={styles.activeChatHeader}>
              <Avatar
                image={activeProfile.avatars[0]?.url}
                alt={activeProfile.userName}
                size={48}
              />
              <Typography variant={'regular_16'}>{activeProfile.userName}</Typography>
            </div>
          )}
        </div>
        <div className={styles.sidebar}>
          <ChatList items={items} searchQuery={searchQuery} isError={isError} />
        </div>
        <div className={styles.main}>{children}</div>
      </div>
    </>
  )
}

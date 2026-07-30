'use client'

import type { AppDispatch } from '@/app/store'

import React, { useState, useMemo, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { MessageStatus, MessageType } from '@/entities/messenger'
import { messengerApi, useGetMessengerDialogsQuery } from '@/entities/messenger/api/messenger.api'
import { ChatList } from '@/entities/messenger/ui/ChatList'
import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { Avatar } from '@/shared/composites'
import { Typography, Input } from '@ictroot/ui-kit'
import { usePathname } from 'next/navigation'

import styles from './MessengerShell.module.scss'

export const MessengerShell = ({ children }: { children: React.ReactNode }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const { user } = useAuthUiState()
  const dispatch = useDispatch() as AppDispatch

  const chatPartnerIdStr = pathname?.split('/').filter(Boolean).pop()
  const chatPartnerId = chatPartnerIdStr ? Number(chatPartnerIdStr) : null

  const { data: dialogsData } = useGetMessengerDialogsQuery({
    searchName: searchQuery || undefined,
  })

  const dialogs = dialogsData?.items || []

  useEffect(() => {
    if (chatPartnerId && user?.userId && dialogs.length === 0) {
      const hasDialogue = dialogs.some(
        d => d.ownerId === chatPartnerId || d.receiverId === chatPartnerId
      )

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
  }, [chatPartnerId, user?.userId, dialogs.length, dialogs, dispatch])

  const activeDialogue = useMemo(() => {
    if (!chatPartnerId || dialogs.length === 0) {
      return null
    }

    return dialogs.find(
      dialogue => dialogue.ownerId === chatPartnerId || dialogue.receiverId === chatPartnerId
    )
  }, [chatPartnerId, dialogs])

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
          {activeDialogue && (
            <div className={styles.activeChatHeader}>
              <Avatar
                image={activeDialogue.avatars?.[0]?.url}
                alt={activeDialogue.userName}
                size={48}
              />
              <Typography variant={'regular_16'}>{activeDialogue.userName}</Typography>
            </div>
          )}
        </div>
        <div className={styles.sidebar}>
          <ChatList searchQuery={searchQuery} currentUserId={user?.userId} />
        </div>
        <div className={styles.main}>{children}</div>
      </div>
    </>
  )
}

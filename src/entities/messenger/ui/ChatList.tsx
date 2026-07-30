'use client'

import React from 'react'

import { useGetMessengerDialogsQuery } from '@/entities/messenger/api/messenger.api'
import { Avatar } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant'
import { Typography } from '@ictroot/ui-kit'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import styles from './ChatList.module.scss'

interface ChatListProps {
  searchQuery: string
  currentUserId?: number
}

export const ChatList: React.FC<ChatListProps> = ({ searchQuery, currentUserId }) => {
  const pathname = usePathname()
  const chatPartnerIdStr = pathname?.split('/').filter(Boolean).pop()
  const chatPartnerId = chatPartnerIdStr ? Number(chatPartnerIdStr) : null

  const {
    data: dialogsData,
    isFetching,
    isLoading,
    error,
  } = useGetMessengerDialogsQuery({
    searchName: searchQuery || undefined,
  })

  const dialogs = dialogsData?.items || []

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.noResults}>
          <Typography variant={'regular_14'} color={'secondary'}>
            Загрузка диалогов...
          </Typography>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.noResults}>
          <Typography variant={'regular_14'} color={'danger'}>
            Ошибка загрузки диалогов
          </Typography>
        </div>
      </div>
    )
  }

  if (dialogs.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.noResults}>
          <Typography variant={'regular_14'} color={'secondary'}>
            {searchQuery ? 'Диалоги не найдены' : 'У вас пока нет диалогов. Начните общение!'}
          </Typography>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {dialogs.map(dialogue => {
        const partnerId =
          dialogue.ownerId === currentUserId ? dialogue.receiverId : dialogue.ownerId
        const lastMessage = dialogue.messageText
        const timestamp = new Date(dialogue.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
        const avatarUrl = dialogue.avatars?.[0]?.url
        const isSelected = partnerId === chatPartnerId

        return (
          <Link
            key={dialogue.id}
            href={APP_ROUTES.MESSENGER.DIALOGUE(partnerId)}
            className={`${styles.chatItem} ${isSelected ? styles.selected : ''}`}
          >
            <Avatar image={avatarUrl} alt={dialogue.userName} size={48} />

            <div className={styles.info}>
              <div className={styles.headerRow}>
                <Typography variant={'regular_16'} className={styles.name}>
                  {dialogue.userName}
                </Typography>
                <Typography variant={'small_12'} color={'secondary'} className={styles.time}>
                  {timestamp}
                </Typography>
              </div>

              <Typography variant={'regular_14'} color={'secondary'} className={styles.lastMsg}>
                {lastMessage.length > 35 ? `${lastMessage.substring(0, 35)}...` : lastMessage}
              </Typography>

              {dialogue.notReadCount > 0 && (
                <div className={styles.badge}>
                  <Typography variant={'small_12'} color={'light'}>
                    {dialogue.notReadCount > 99 ? '99+' : dialogue.notReadCount}
                  </Typography>
                </div>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}

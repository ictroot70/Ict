'use client'

import { useMemo } from 'react'

import { type GetMessengerDialogsParams, useGetMessengerDialogsQuery } from '@/entities/messenger'
import { useMeQuery } from '@/features/auth'

import { MESSENGER_UNREAD_DIALOGS_PAGE_SIZE } from './messenger-realtime'

export function useMessengerUnreadIndicator() {
  const { data: currentUser } = useMeQuery()
  const dialogsQueryParams = useMemo<GetMessengerDialogsParams>(
    () => ({ pageSize: MESSENGER_UNREAD_DIALOGS_PAGE_SIZE }),
    []
  )
  const { data: dialogs } = useGetMessengerDialogsQuery(dialogsQueryParams, {
    skip: !currentUser,
    refetchOnMountOrArgChange: true,
  })

  return {
    unreadCount: dialogs?.notReadCount ?? 0,
  }
}

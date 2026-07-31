'use client'

import { useMemo } from 'react'

import { type MessageViewModel, useGetDialogueMessagesQuery } from '@/entities/messenger'
import { useGetPublicProfileQuery } from '@/entities/profile'
import { useMeQuery } from '@/features/auth'

const sortMessages = (messages: readonly MessageViewModel[]) =>
  [...messages].sort(
    (first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()
  )

export function useMessengerDialogueData(partnerId: number) {
  const { data: currentUser } = useMeQuery()
  const { data: partner } = useGetPublicProfileQuery({ profileId: partnerId })
  const {
    data: history,
    isError: isHistoryError,
    isLoading: isHistoryLoading,
    isFetching: isHistoryFetching,
  } = useGetDialogueMessagesQuery(
    {
      dialoguePartnerId: partnerId,
      pageSize: 50,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  )
  const messages = useMemo(() => sortMessages(history?.items ?? []), [history])

  return {
    currentUserId: currentUser?.userId ?? 0,
    messages,
    partnerAvatarUrl: partner?.avatars[0]?.url,
    isLoading: isHistoryLoading || (isHistoryFetching && messages.length === 0),
    error: isHistoryError ? 'Could not load message history' : null,
  }
}

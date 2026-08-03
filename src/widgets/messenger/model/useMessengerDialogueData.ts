'use client'

import { useCallback, useMemo, useState } from 'react'

import {
  type MessageViewModel,
  upsertMessageInHistory,
  useGetDialogueMessagesQuery,
} from '@/entities/messenger'
import { useGetPublicProfileQuery } from '@/entities/profile'
import { useMeQuery } from '@/features/auth'

const sortMessages = (messages: readonly MessageViewModel[]) =>
  [...messages].sort(
    (first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()
  )

export function useMessengerDialogueData(partnerId: number) {
  const [sentMessages, setSentMessages] = useState<MessageViewModel[]>([])
  const [messageWaveforms, setMessageWaveforms] = useState<Record<number, readonly number[]>>({})
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
  const messages = useMemo(
    () =>
      sortMessages(
        (history?.items ?? []).reduce<MessageViewModel[]>(
          (items, message) => upsertMessageInHistory(items, message),
          [...sentMessages]
        )
      ),
    [history, sentMessages]
  )
  const upsertSentMessage = useCallback(
    (message: MessageViewModel, waveform?: readonly number[]) => {
      if (waveform) {
        setMessageWaveforms(currentWaveforms => ({
          ...currentWaveforms,
          [message.id]: waveform,
        }))
      }

      setSentMessages(currentMessages => upsertMessageInHistory(currentMessages, message))
    },
    []
  )
  const replaceSentMessage = useCallback((message: MessageViewModel, optimisticId: number) => {
    setMessageWaveforms(currentWaveforms => {
      const waveform = currentWaveforms[optimisticId]
      const nextWaveforms = { ...currentWaveforms }

      delete nextWaveforms[optimisticId]

      if (waveform) {
        nextWaveforms[message.id] = waveform
      }

      return nextWaveforms
    })
    setSentMessages(currentMessages =>
      upsertMessageInHistory(
        currentMessages.filter(currentMessage => currentMessage.id !== optimisticId),
        message
      )
    )
  }, [])
  const removeSentMessage = useCallback((messageId: number) => {
    setMessageWaveforms(currentWaveforms => {
      const nextWaveforms = { ...currentWaveforms }

      delete nextWaveforms[messageId]

      return nextWaveforms
    })
    setSentMessages(currentMessages =>
      currentMessages.filter(currentMessage => currentMessage.id !== messageId)
    )
  }, [])

  return {
    currentUserId: currentUser?.userId ?? 0,
    messages,
    messageWaveforms,
    upsertSentMessage,
    replaceSentMessage,
    removeSentMessage,
    partnerAvatarUrl: partner?.avatars[0]?.url,
    isLoading: isHistoryLoading || (isHistoryFetching && messages.length === 0),
    error: isHistoryError ? 'Could not load message history' : null,
  }
}

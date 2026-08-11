'use client'

import { useGetPublicProfileQuery } from '@/entities/profile'
import { useMeQuery } from '@/features/auth'

export function useMessengerDialogueData(partnerId: number) {
  const { data: currentUser } = useMeQuery()
  const { data: partner } = useGetPublicProfileQuery({ profileId: partnerId })

  return {
    currentUserId: currentUser?.userId ?? 0,
    partnerUserName: partner?.userName,
    partnerAvatarUrl: partner?.avatars[0]?.url,
  }
}

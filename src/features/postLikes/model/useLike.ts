import { useCallback, useSyncExternalStore } from 'react'

import { useUpdateLikeStatusMutation } from '@/entities/posts/api/postApi'
import { useGetPublicProfileQuery } from '@/entities/profile/api'
import { useAuth } from '@/features/posts/utils/useAuth'
import { LikeStatus } from '@/shared/types'

const lockedPostIds = new Set<number>()
const lockListeners = new Set<() => void>()

const subscribeToPostLikeLocks = (listener: () => void) => {
  lockListeners.add(listener)

  return () => {
    lockListeners.delete(listener)
  }
}

const emitPostLikeLockChange = () => {
  lockListeners.forEach(listener => listener())
}

const lockPostLike = (postId: number) => {
  lockedPostIds.add(postId)
  emitPostLikeLockChange()
}

const unlockPostLike = (postId: number) => {
  lockedPostIds.delete(postId)
  emitPostLikeLockChange()
}

export const useLike = (postId: number, ownerId: number) => {
  const { user } = useAuth()
  const { data: currentUserProfile, isLoading: isCurrentUserProfileLoading } =
    useGetPublicProfileQuery({ profileId: user?.userId ?? 0 }, { skip: !user?.userId })
  const [updateLikeStatus, { isLoading }] = useUpdateLikeStatusMutation()
  const isPostLocked = useSyncExternalStore(
    subscribeToPostLikeLocks,
    () => lockedPostIds.has(postId),
    () => false
  )
  const currentUserAvatarUrl =
    currentUserProfile?.avatars.find(avatar => avatar.width === 45)?.url ??
    currentUserProfile?.avatars[0]?.url

  const toggleLike = useCallback(
    (isLiked: boolean) => {
      if (!user?.userId || lockedPostIds.has(postId) || isCurrentUserProfileLoading) {
        return
      }

      lockPostLike(postId)

      updateLikeStatus({
        postId,
        userId: ownerId,
        currentUserAvatar: currentUserAvatarUrl,
        data: {
          likeStatus: isLiked ? LikeStatus.NONE : LikeStatus.LIKE,
        },
      })
        .unwrap()
        .catch(() => undefined)
        .finally(() => {
          unlockPostLike(postId)
        })
    },
    [currentUserAvatarUrl, isCurrentUserProfileLoading, ownerId, postId, user, updateLikeStatus]
  )

  return { toggleLike, isLikeLoading: isLoading || isPostLocked || isCurrentUserProfileLoading }
}

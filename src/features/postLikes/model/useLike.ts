import { useCallback, useSyncExternalStore } from 'react'

import { useUpdateLikeStatusMutation } from '@/entities/posts/api/postApi'
import { useGetPublicProfileQuery } from '@/entities/profile/api'
import { showToastAlert } from '@/shared/lib'
import { LikeStatus } from '@/shared/types'

export type CurrentPostLikeUser = {
  userId: number
  userName: string
}

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

export const useLike = (postId: number, ownerId: number, currentUser?: CurrentPostLikeUser) => {
  const { data: currentUserProfile, isLoading: isCurrentUserProfileLoading } =
    useGetPublicProfileQuery(
      { profileId: currentUser?.userId ?? 0 },
      { skip: !currentUser?.userId }
    )
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
      if (!currentUser?.userId || lockedPostIds.has(postId) || isCurrentUserProfileLoading) {
        return
      }

      lockPostLike(postId)

      updateLikeStatus({
        postId,
        ownerId,
        currentUser: {
          userId: currentUser.userId,
          userName: currentUser.userName,
          avatarUrl: currentUserAvatarUrl,
        },
        data: {
          likeStatus: isLiked ? LikeStatus.NONE : LikeStatus.LIKE,
        },
      })
        .unwrap()
        .catch(() => {
          showToastAlert({ message: 'Failed to update like', type: 'error' })
        })
        .finally(() => {
          unlockPostLike(postId)
        })
    },
    [
      currentUser,
      currentUserAvatarUrl,
      isCurrentUserProfileLoading,
      ownerId,
      postId,
      updateLikeStatus,
    ]
  )

  return {
    toggleLike,
    isLikeLoading: !currentUser?.userId || isLoading || isPostLocked || isCurrentUserProfileLoading,
  }
}

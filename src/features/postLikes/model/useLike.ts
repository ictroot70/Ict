import { useCallback, useSyncExternalStore } from 'react'

import { useUpdateLikeStatusMutation } from '@/entities/posts/api/postApi'
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

export const useLike = (postId: number) => {
  const { user } = useAuth()
  const [updateLikeStatus, { isLoading }] = useUpdateLikeStatusMutation()
  const isPostLocked = useSyncExternalStore(
    subscribeToPostLikeLocks,
    () => lockedPostIds.has(postId),
    () => false
  )

  const toggleLike = useCallback(
    (isLiked: boolean) => {
      if (!user?.userId || lockedPostIds.has(postId)) {
        return
      }

      lockPostLike(postId)

      updateLikeStatus({
        postId,
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
    [postId, user, updateLikeStatus]
  )

  return { toggleLike, isLikeLoading: isLoading || isPostLocked }
}

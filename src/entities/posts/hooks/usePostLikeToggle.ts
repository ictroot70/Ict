'use client'

import { useCallback } from 'react'

import { useUpdateLikeStatusMutation } from '@/entities/posts/api'
import { getNextLikeStatus } from '@/entities/posts/lib/comment-likes'

export const usePostLikeToggle = (postId: number, ownerId?: number) => {
  const [updateLike, { isLoading: isPostLikeLoading }] = useUpdateLikeStatusMutation()

  const togglePostLike = useCallback(
    (isLiked: boolean) => {
      void updateLike({
        postId,
        userId: ownerId,
        data: { likeStatus: getNextLikeStatus(isLiked) },
      })
    },
    [ownerId, postId, updateLike]
  )

  return { togglePostLike, isPostLikeLoading }
}

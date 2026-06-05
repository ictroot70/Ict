'use client'

import { useCallback } from 'react'

import {
  useUpdateAnswerLikeStatusMutation,
  useUpdateCommentLikeStatusMutation,
} from '@/entities/posts/api/postApi'
import { getNextLikeStatus } from '@/entities/posts/lib/comment-likes'

export const useCommentLikeToggle = (postId: number) => {
  const [updateCommentLike, { isLoading: isCommentLikeLoading }] =
    useUpdateCommentLikeStatusMutation()
  const [updateAnswerLike, { isLoading: isAnswerLikeLoading }] = useUpdateAnswerLikeStatusMutation()

  const toggleCommentLike = useCallback(
    (commentId: number, isLiked: boolean) => {
      void updateCommentLike({
        postId,
        commentId,
        data: { likeStatus: getNextLikeStatus(isLiked) },
      })
    },
    [postId, updateCommentLike]
  )

  const toggleAnswerLike = useCallback(
    (commentId: number, answerId: number, isLiked: boolean) => {
      void updateAnswerLike({
        postId,
        commentId,
        answerId,
        data: { likeStatus: getNextLikeStatus(isLiked) },
      })
    },
    [postId, updateAnswerLike]
  )

  return {
    toggleCommentLike,
    toggleAnswerLike,
    isCommentLikeLoading,
    isAnswerLikeLoading,
  }
}

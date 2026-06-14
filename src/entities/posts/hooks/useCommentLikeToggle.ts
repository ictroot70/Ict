'use client'

import { useCallback } from 'react'

import { getNextLikeStatus } from '@/entities/posts/lib/comment-likes'

import {
  useUpdateAnswerLikeStatusMutation,
  useUpdateCommentLikeStatusMutation,
} from '../api/postCommentsApi'

export const useCommentLikeToggle = (postId: number) => {
  const [updateCommentLike] = useUpdateCommentLikeStatusMutation()
  const [updateAnswerLike] = useUpdateAnswerLikeStatusMutation()

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
  }
}

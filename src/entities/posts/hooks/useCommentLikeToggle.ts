'use client'

import { useCallback, useRef, useState } from 'react'

import { getNextLikeStatus } from '@/entities/posts/lib/comment-likes'

import {
  useUpdateAnswerLikeStatusMutation,
  useUpdateCommentLikeStatusMutation,
} from '../api/postCommentsApi'

export const useCommentLikeToggle = (postId: number) => {
  const [updateCommentLike] = useUpdateCommentLikeStatusMutation()
  const [updateAnswerLike] = useUpdateAnswerLikeStatusMutation()

  const [lockedItems, setLockedItems] = useState<Set<string>>(new Set())
  const lockedItemsRef = useRef(lockedItems)

  lockedItemsRef.current = lockedItems

  const getCommentKey = (commentId: number) => `comment:${commentId}`
  const getAnswerKey = (commentId: number, answerId: number) => `answer:${commentId}:${answerId}`

  const isCommentLocked = useCallback(
    (commentId: number) => lockedItems.has(getCommentKey(commentId)),
    [lockedItems]
  )

  const isAnswerLocked = useCallback(
    (commentId: number, answerId: number) => lockedItems.has(getAnswerKey(commentId, answerId)),
    [lockedItems]
  )

  const toggleCommentLike = useCallback(
    async (commentId: number, isLiked: boolean) => {
      const key = getCommentKey(commentId)

      if (lockedItemsRef.current.has(key)) {
        return
      }

      setLockedItems(prev => new Set(prev).add(key))

      try {
        await updateCommentLike({
          postId,
          commentId,
          data: { likeStatus: getNextLikeStatus(isLiked) },
        }).unwrap()
      } finally {
        setLockedItems(prev => {
          const next = new Set(prev)

          next.delete(key)

          return next
        })
      }
    },
    [postId, updateCommentLike]
  )

  const toggleAnswerLike = useCallback(
    async (commentId: number, answerId: number, isLiked: boolean) => {
      const key = getAnswerKey(commentId, answerId)

      if (lockedItemsRef.current.has(key)) {
        return
      }

      setLockedItems(prev => new Set(prev).add(key))

      try {
        await updateAnswerLike({
          postId,
          commentId,
          answerId,
          data: { likeStatus: getNextLikeStatus(isLiked) },
        }).unwrap()
      } finally {
        setLockedItems(prev => {
          const next = new Set(prev)

          next.delete(key)

          return next
        })
      }
    },
    [postId, updateAnswerLike]
  )

  return {
    toggleCommentLike,
    toggleAnswerLike,
    isCommentLocked,
    isAnswerLocked,
  }
}

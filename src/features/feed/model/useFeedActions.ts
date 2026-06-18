'use client'

import { useCallback, useState } from 'react'

import { useFollowUserMutation, useUnfollowUserMutation } from '@/entities/users/api'
import {
  markUserFollowed,
  markUserUnfollowed,
  selectUnfollowedUserIds,
} from '@/entities/users/model'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { useAuthSessionHintContext } from '@/shared/auth'
import { APP_ROUTES } from '@/shared/constant'
import { showToastAlert } from '@/shared/lib'

const copyText = async (text: string) => {
  if (!window.isSecureContext || !navigator.clipboard?.writeText) {
    throw new Error('Clipboard API is unavailable')
  }

  await navigator.clipboard.writeText(text)
}

export const useFeedActions = () => {
  const dispatch = useAppDispatch()
  const { authUserIdHint } = useAuthSessionHintContext()
  const unfollowedUserIds = useAppSelector(selectUnfollowedUserIds)
  const [pendingUserIds, setPendingUserIds] = useState<Set<number>>(() => new Set())
  const [followUser] = useFollowUserMutation()
  const [unfollowUser] = useUnfollowUserMutation()

  const isFollowing = useCallback(
    (userId: number) => !unfollowedUserIds.includes(userId),
    [unfollowedUserIds]
  )

  const isFollowPending = useCallback(
    (userId: number) => pendingUserIds.has(userId),
    [pendingUserIds]
  )

  const toggleFollow = useCallback(
    async (userId: number) => {
      if (!authUserIdHint || pendingUserIds.has(userId)) {
        return
      }

      const shouldUnfollow = !unfollowedUserIds.includes(userId)

      setPendingUserIds(current => new Set(current).add(userId))

      try {
        if (shouldUnfollow) {
          await unfollowUser({ currentUserId: authUserIdHint, selectedUserId: userId }).unwrap()
          dispatch(markUserUnfollowed(userId))
        } else {
          await followUser({ currentUserId: authUserIdHint, selectedUserId: userId }).unwrap()
          dispatch(markUserFollowed(userId))
        }
      } catch {
        showToastAlert({
          message: shouldUnfollow ? 'Failed to unfollow user' : 'Failed to follow user',
          type: 'error',
        })
      } finally {
        setPendingUserIds(current => {
          const next = new Set(current)

          next.delete(userId)

          return next
        })
      }
    },
    [authUserIdHint, dispatch, followUser, pendingUserIds, unfollowUser, unfollowedUserIds]
  )

  const copyPostLink = useCallback(async (ownerId: number, postId: number) => {
    const path = APP_ROUTES.PROFILE.WITH_POST(ownerId, postId)
    const url = new URL(path, window.location.origin).toString()

    try {
      await copyText(url)
      showToastAlert({ message: 'Link copied', type: 'success' })
    } catch {
      showToastAlert({ message: 'Failed to copy link', type: 'error' })
    }
  }, [])

  return { copyPostLink, isFollowing, isFollowPending, toggleFollow }
}

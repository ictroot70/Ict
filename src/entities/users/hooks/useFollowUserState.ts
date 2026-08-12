'use client'

import { useRef } from 'react'

import {
  useFollowUserMutation,
  useGetUserByUserNameQuery,
  useUnfollowUserMutation,
} from '@/entities/users/api'

type FollowUserStateOptions = {
  enabled?: boolean
}

export const useFollowUserState = (
  userName: string,
  userId: number,
  currentUserId?: number,
  currentUserName?: string,
  { enabled = true }: FollowUserStateOptions = {}
) => {
  const canQuery = enabled && Boolean(userName)
  const canMutate = enabled && Boolean(userName) && Number.isInteger(userId) && userId > 0
  const {
    data: followState,
    isFetching: isFollowStateFetching,
    refetch: refetchFollowState,
  } = useGetUserByUserNameQuery(userName, { skip: !canQuery })
  const [followUser, { isLoading: isFollowingLoading }] = useFollowUserMutation()
  const [unfollowUser, { isLoading: isUnfollowingLoading }] = useUnfollowUserMutation()
  const pendingActionRef = useRef(false)
  const isFollowing = followState?.isFollowing ?? false
  const isFollowPending = isFollowingLoading || isUnfollowingLoading

  const handleFollow = async () => {
    if (!canMutate || pendingActionRef.current) {
      return
    }

    pendingActionRef.current = true

    try {
      await followUser({
        currentUserId,
        currentUserName,
        selectedUserId: userId,
        targetUserName: userName,
      }).unwrap()
      await refetchFollowState()
    } finally {
      pendingActionRef.current = false
    }
  }

  const handleUnfollow = async () => {
    if (!canMutate || pendingActionRef.current) {
      return
    }

    pendingActionRef.current = true

    try {
      await unfollowUser({
        currentUserId,
        currentUserName,
        selectedUserId: userId,
        targetUserName: userName,
      }).unwrap()
      await refetchFollowState()
    } finally {
      pendingActionRef.current = false
    }
  }

  const handleToggleFollow = async () => {
    if (isFollowPending || pendingActionRef.current) {
      return
    }

    if (isFollowing) {
      await handleUnfollow()

      return
    }

    await handleFollow()
  }

  return {
    isFollowing,
    followersCount: followState?.followersCount,
    followingCount: followState?.followingCount,
    publicationsCount: followState?.publicationsCount,
    isFollowPending: isFollowPending || isFollowStateFetching || pendingActionRef.current,
    handleFollow,
    handleToggleFollow,
    handleUnfollow,
  }
}

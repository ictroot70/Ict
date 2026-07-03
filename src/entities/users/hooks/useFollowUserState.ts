'use client'

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
  { enabled = true }: FollowUserStateOptions = {}
) => {
  const canQuery = enabled && Boolean(userName)
  const canMutate = enabled && Boolean(userName) && Number.isInteger(userId) && userId > 0
  const { data: followState } = useGetUserByUserNameQuery(userName, { skip: !canQuery })
  const [followUser, { isLoading: isFollowingLoading }] = useFollowUserMutation()
  const [unfollowUser, { isLoading: isUnfollowingLoading }] = useUnfollowUserMutation()
  const isFollowing = followState?.isFollowing ?? false
  const isFollowPending = isFollowingLoading || isUnfollowingLoading

  const handleFollow = async () => {
    if (!canMutate) {
      return
    }

    await followUser({ currentUserId, selectedUserId: userId, targetUserName: userName }).unwrap()
  }

  const handleUnfollow = async () => {
    if (!canMutate) {
      return
    }

    await unfollowUser({ currentUserId, selectedUserId: userId, targetUserName: userName }).unwrap()
  }

  const handleToggleFollow = async () => {
    if (isFollowPending) {
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
    isFollowPending,
    handleFollow,
    handleToggleFollow,
    handleUnfollow,
  }
}

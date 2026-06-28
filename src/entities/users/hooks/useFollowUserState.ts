'use client'

import {
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetUserByUserNameQuery,
} from '@/entities/users/api'

export const useFollowUserState = (userName: string, userId: number) => {
  const { data: followState } = useGetUserByUserNameQuery(userName, { skip: !userName })
  const [followUser, { isLoading: isFollowingLoading }] = useFollowUserMutation()
  const [unfollowUser, { isLoading: isUnfollowingLoading }] = useUnfollowUserMutation()

  const handleFollow = async () => {
    await followUser({ selectedUserId: userId }).unwrap()
  }

  const handleUnfollow = async () => {
    await unfollowUser(userId).unwrap()
  }

  return {
    isFollowing: followState?.isFollowing ?? false,
    followersCount: followState?.followersCount ?? 0,
    followingCount: followState?.followingCount ?? 0,
    isFollowPending: isFollowingLoading || isUnfollowingLoading,
    handleFollow,
    handleUnfollow,
  }
}

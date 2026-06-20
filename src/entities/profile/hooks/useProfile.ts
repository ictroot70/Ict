'use client'

import { useState, useEffect } from 'react'

import { type PaginatedPosts, useGetPostsByUserInfiniteQuery } from '@/entities/posts/api'
import { type PublicProfileData, useGetPublicProfileQuery } from '@/entities/profile/api'
import { useInitializeProfile } from '@/entities/profile/hooks'
import {
  useFollowUserMutation,
  useGetUserByUserNameQuery,
  useUnfollowUserMutation,
} from '@/entities/users/api'
import { useMeQuery } from '@/features/auth'
import { useAuthSessionHintContext } from '@/shared/auth'
import { APP_ROUTES } from '@/shared/constant'
import { logger } from '@/shared/lib'
import { useParams, useRouter } from 'next/navigation'

export const useProfile = (
  profileDataServer: PublicProfileData,
  postsDataServer: PaginatedPosts
) => {
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)
  const router = useRouter()
  const profileQueryArgs = { profileId: userId }
  const postsQueryArgs = { userId }
  const { data: user, isLoading: isMeLoading, isUninitialized: isMeUninitialized } = useMeQuery()
  const { hasAuthHint, authUserIdHint } = useAuthSessionHintContext()

  const { isInit } = useInitializeProfile(userId, profileDataServer, postsDataServer)

  const { data: profileData, isLoading: isProfileLoading } = useGetPublicProfileQuery(
    profileQueryArgs,
    { skip: !isInit }
  )

  const {
    data: postsData,
    isLoading: isPostsLoading,
    isFetching: isFetchingPosts,
    fetchNextPage,
    hasNextPage,
  } = useGetPostsByUserInfiniteQuery(postsQueryArgs, {
    skip: !isInit,
  })

  const isLoading = isProfileLoading || isPostsLoading

  const profile = profileData || profileDataServer

  const isAuthenticated = Boolean(user)
  const isAuthResolving = hasAuthHint && !isAuthenticated && (isMeLoading || isMeUninitialized)
  const shouldShowAuthActionSkeleton = !isAuthenticated && isAuthResolving
  const isOwnProfile = isAuthenticated && profile.id === (user?.userId ?? authUserIdHint)
  const canInteractWithOtherProfile = !isOwnProfile
  const authActionSkeletonVariant: 'single' | 'double' =
    authUserIdHint === profile.id ? 'single' : 'double'

  // The public profile endpoint is unauthenticated, so its `isFollowing` is always false.
  // Fetch the real per-viewer follow status from the authenticated by-userName endpoint.
  const isViewerOwnProfile = Boolean(user?.userId && profile.id === user.userId)
  const { data: followState } = useGetUserByUserNameQuery(profile.userName, {
    skip: !user || isViewerOwnProfile || !profile.userName,
  })

  const [followUser, { isLoading: isFollowLoading }] = useFollowUserMutation()
  const [unfollowUser, { isLoading: isUnfollowLoading }] = useUnfollowUserMutation()
  const isFollowPending = isFollowLoading || isUnfollowLoading

  // Локальное состояние для optimistic updates
  const [optimisticFollowing, setOptimisticFollowing] = useState<boolean | null>(null)
  const [optimisticFollowersCount, setOptimisticFollowersCount] = useState<number | null>(null)
  const [optimisticFollowingCount, setOptimisticFollowingCount] = useState<number | null>(null)

  // Сбрасываем optimistic состояние при изменении данных профиля
  useEffect(() => {
    if (followState) {
      setOptimisticFollowing(null)
      setOptimisticFollowersCount(null)
      setOptimisticFollowingCount(null)
    }
  }, [followState])

  // Используем optimistic состояние если оно установлено, иначе данные из API
  const isFollowing =
    optimisticFollowing !== null
      ? optimisticFollowing
      : (followState?.isFollowing ?? profile.isFollowing)

  // Prefer the live authenticated counts; fall back to the SSR public-profile metadata
  // (used for own profile and unauthenticated views, where followState is absent).
  const userMetadata = {
    followers:
      optimisticFollowersCount !== null
        ? optimisticFollowersCount
        : (followState?.followersCount ?? profile.userMetadata.followers),
    following:
      optimisticFollowingCount !== null
        ? optimisticFollowingCount
        : (followState?.followingCount ?? profile.userMetadata.following),
    publications: followState?.publicationsCount ?? profile.userMetadata.publications,
  }

  const posts = postsData?.pages?.flatMap(page => page.items || []) || postsDataServer?.items || []

  const loadMorePostsHandler = () => {
    if (hasNextPage && !isFetchingPosts) {
      fetchNextPage()
    }
  }

  const handleEditProfile = () => {
    router.push(APP_ROUTES.PROFILE.EDIT(userId))
  }

  const handleSendMessage = () => {
    router.push(APP_ROUTES.MESSENGER.DIALOGUE(profile.id))
  }

  const handleFollow = async () => {
    if (isFollowPending) {
      return
    }

    // Optimistic update для целевого профиля
    setOptimisticFollowing(true)
    if (followState) {
      setOptimisticFollowersCount(followState.followersCount + 1)
      if (isOwnProfile) {
        setOptimisticFollowingCount(followState.followingCount + 1)
      }
    } else if (profile.userMetadata) {
      setOptimisticFollowersCount(profile.userMetadata.followers + 1)
      if (isOwnProfile) {
        setOptimisticFollowingCount(profile.userMetadata.following + 1)
      }
    }

    try {
      await followUser({ selectedUserId: profile.id }).unwrap()
    } catch (error) {
      // Откатываем optimistic update при ошибке
      setOptimisticFollowing(null)
      setOptimisticFollowersCount(null)
      setOptimisticFollowingCount(null)
      logger.error('[profile] Follow user failed:', error)
    }
  }

  const handleUnfollow = async () => {
    if (isFollowPending) {
      return
    }

    // Optimistic update для целевого профиля
    setOptimisticFollowing(false)
    if (followState) {
      setOptimisticFollowersCount(Math.max(0, followState.followersCount - 1))
      if (isOwnProfile) {
        setOptimisticFollowingCount(Math.max(0, followState.followingCount - 1))
      }
    } else if (profile.userMetadata) {
      setOptimisticFollowersCount(Math.max(0, profile.userMetadata.followers - 1))
      if (isOwnProfile) {
        setOptimisticFollowingCount(Math.max(0, profile.userMetadata.following - 1))
      }
    }

    try {
      await unfollowUser(profile.id).unwrap()
    } catch (error) {
      // Откатываем optimistic update при ошибке
      setOptimisticFollowing(null)
      setOptimisticFollowersCount(null)
      setOptimisticFollowingCount(null)
      logger.error('[profile] Unfollow user failed:', error)
    }
  }

  const profileInfoActions = {
    onEditProfile: isOwnProfile ? handleEditProfile : undefined,
    onSendMessage: canInteractWithOtherProfile ? handleSendMessage : undefined,
    onFollow: canInteractWithOtherProfile && !isFollowing ? handleFollow : undefined,
    onUnfollow: canInteractWithOtherProfile && isFollowing ? handleUnfollow : undefined,
    isFollowing: isFollowing ?? false, // Преобразуем null в false для TypeScript
    isFollowPending,
    userMetadata,
  }

  return {
    posts,
    userId,
    profile,
    isLoading,
    hasNextPage,
    isOwnProfile,
    isAuthenticated,
    shouldShowAuthActionSkeleton,
    authActionSkeletonVariant,
    profileInfoActions,
    loadMorePostsHandler,
  }
}

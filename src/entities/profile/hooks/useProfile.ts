'use client'

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

  // The public profile endpoint is unauthenticated, so its `isFollowing` is always false.
  // Fetch the real per-viewer follow status from the authenticated by-userName endpoint.
  const isViewerOwnProfile = Boolean(user?.userId && profile.id === user.userId)
  const { data: followState } = useGetUserByUserNameQuery(profile.userName, {
    skip: !user || isViewerOwnProfile || !profile.userName,
  })
  const isFollowing = followState?.isFollowing ?? profile.isFollowing

  // Prefer the live authenticated counts; fall back to the SSR public-profile metadata
  // (used for own profile and unauthenticated views, where followState is absent).
  const userMetadata = followState
    ? {
        followers: followState.followersCount,
        following: followState.followingCount,
        publications: followState.publicationsCount,
      }
    : profile.userMetadata

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

  const [followUser, { isLoading: isFollowLoading }] = useFollowUserMutation()
  const [unfollowUser, { isLoading: isUnfollowLoading }] = useUnfollowUserMutation()
  const isFollowPending = isFollowLoading || isUnfollowLoading

  const handleFollow = async () => {
    if (isFollowPending) {
      return
    }
    try {
      await followUser({ selectedUserId: profile.id }).unwrap()
    } catch (error) {
      logger.error('[profile] Follow user failed:', error)
    }
  }

  const handleUnfollow = async () => {
    if (isFollowPending) {
      return
    }
    try {
      await unfollowUser(profile.id).unwrap()
    } catch (error) {
      logger.error('[profile] Unfollow user failed:', error)
    }
  }

  const isAuthenticated = Boolean(user)
  const isAuthResolving = hasAuthHint && !isAuthenticated && (isMeLoading || isMeUninitialized)
  const shouldShowAuthActionSkeleton = !isAuthenticated && isAuthResolving
  const isOwnProfile = isAuthenticated && profile.id === (user?.userId ?? authUserIdHint)
  const canInteractWithOtherProfile = !isOwnProfile
  const authActionSkeletonVariant: 'single' | 'double' =
    authUserIdHint === profile.id ? 'single' : 'double'

  const profileInfoActions = {
    onEditProfile: isOwnProfile ? handleEditProfile : undefined,
    onSendMessage: canInteractWithOtherProfile ? handleSendMessage : undefined,
    onFollow: canInteractWithOtherProfile && !isFollowing ? handleFollow : undefined,
    onUnfollow: canInteractWithOtherProfile && isFollowing ? handleUnfollow : undefined,
    isFollowing,
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

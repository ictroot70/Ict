'use client'

import { type PaginatedPosts, useGetPostsByUserInfiniteQuery } from '@/entities/posts/api'
import { type PublicProfileData, useGetPublicProfileQuery } from '@/entities/profile/api'
import { useInitializeProfile } from '@/entities/profile/hooks'
import { useGetUserByUserNameQuery } from '@/entities/users/api'
import { useFollowUserState } from '@/entities/users/hooks/useFollowUserState'
import { useMeQuery } from '@/features/auth'
import { useAuthSessionHintContext } from '@/shared/auth'
import { APP_ROUTES } from '@/shared/constant'
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

  const {
    isFollowing,
    followersCount,
    followingCount,
    isFollowPending,
    handleFollow,
    handleUnfollow,
  } = useFollowUserState(profile.userName, profile.id)

  // Use the live authenticated counts; fall back to the SSR public-profile metadata
  const userMetadata = {
    followers:
      followersCount !== 0
        ? followersCount
        : (followState?.followersCount ?? profile.userMetadata.followers),
    following:
      followingCount !== 0
        ? followingCount
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

  const profileInfoActions = {
    onEditProfile: isOwnProfile ? handleEditProfile : undefined,
    onSendMessage: canInteractWithOtherProfile ? handleSendMessage : undefined,
    onFollow: canInteractWithOtherProfile && !isFollowing ? handleFollow : undefined,
    onUnfollow: canInteractWithOtherProfile && isFollowing ? handleUnfollow : undefined,
    isFollowing: isFollowing,
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

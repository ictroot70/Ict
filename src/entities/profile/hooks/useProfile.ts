'use client'

import { postApi, type PaginatedPosts, useGetPostsByUserInfiniteQuery } from '@/entities/posts/api'
import {
  profileApi,
  type PublicProfileData,
  useGetPublicProfileQuery,
} from '@/entities/profile/api'
import { useInitializeProfile } from '@/entities/profile/hooks'
import { useFollowUserState } from '@/entities/users/hooks/useFollowUserState'
import { useMeQuery } from '@/features/auth'
import { useAppSelector } from '@/lib/hooks'
import { useAuthSessionHintContext } from '@/shared/auth'
import { APP_ROUTES } from '@/shared/constant'
import { useRouter } from 'next/navigation'

export const useProfile = (
  profileDataServer: PublicProfileData,
  postsDataServer: PaginatedPosts,
  resolvedUserId: number
) => {
  const userId = resolvedUserId
  const router = useRouter()
  const profileQueryArgs = { profileId: userId }
  const postsQueryArgs = { userId }

  const { data: user, isLoading: isMeLoading, isUninitialized: isMeUninitialized } = useMeQuery()
  const profileDataFromCache = useAppSelector(
    profileApi.endpoints.getPublicProfile.select(profileQueryArgs)
  )?.data
  const postsDataFromCache = useAppSelector(
    postApi.endpoints.getInfinitePostsByUser.select(postsQueryArgs)
  )?.data
  const hasProfileDataInCache = Boolean(profileDataFromCache)
  const hasPostsDataInCache = Boolean(postsDataFromCache?.pages?.length)
  const { hasAuthHint, authUserIdHint } = useAuthSessionHintContext()

  useInitializeProfile({
    userId,
    profileDataServer,
    postsDataServer,
    hasProfileDataInCache,
    hasPostsDataInCache,
  })

  const { data: profileData, isLoading: isProfileLoading } = useGetPublicProfileQuery(
    profileQueryArgs,
    { skip: Boolean(profileDataServer) && !hasProfileDataInCache }
  )

  const {
    data: postsData,
    isLoading: isPostsLoading,
    isFetching: isFetchingPosts,
    fetchNextPage,
    hasNextPage,
  } = useGetPostsByUserInfiniteQuery(postsQueryArgs, {
    skip: Boolean(postsDataServer) && !hasPostsDataInCache,
  })

  const isLoading = isProfileLoading || isPostsLoading

  const profile = profileData || profileDataFromCache || profileDataServer

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

  const {
    isFollowing,
    followersCount,
    followingCount,
    publicationsCount,
    isFollowPending,
    handleFollow,
    handleUnfollow,
  } = useFollowUserState(profile.userName, profile.id, user?.userId, {
    enabled: Boolean(user && !isViewerOwnProfile),
  })

  // Use the live authenticated counts; fall back to the SSR public-profile metadata
  const userMetadata = {
    followers: followersCount ?? profile.userMetadata.followers,
    following: followingCount ?? profile.userMetadata.following,
    publications: publicationsCount ?? profile.userMetadata.publications,
  }

  const posts =
    postsData?.pages?.flatMap(page => page.items || []) ||
    postsDataFromCache?.pages?.flatMap(page => page.items || []) ||
    postsDataServer?.items ||
    []

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

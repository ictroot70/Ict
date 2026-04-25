'use client'

import { type PaginatedPosts, useGetPostsByUserInfiniteQuery } from '@/entities/posts/api'
import { type PublicProfileData, useGetPublicProfileQuery } from '@/entities/profile/api'
import { useInitializeProfile } from '@/entities/profile/hooks'
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
    // Follow flow is intentionally deferred to a separate task.
    logger.info('[profile] Follow user:', profile.id)
  }

  const handleUnfollow = async () => {
    // Unfollow flow is intentionally deferred to a separate task.
    logger.info('[profile] Unfollow user:', profile.id)
  }

  const isAuthenticated = Boolean(user)
  const isAuthResolving = hasAuthHint && !isAuthenticated && (isMeLoading || isMeUninitialized)
  const shouldShowAuthActionSkeleton = !isAuthenticated && isAuthResolving
  const isOwnProfile = isAuthenticated && profile.id === (user?.userId ?? authUserIdHint)
  const canInteractWithOtherProfile = isOwnProfile === false
  const authActionSkeletonVariant: 'single' | 'double' =
    authUserIdHint === profile.id ? 'single' : 'double'

  const profileInfoActions = {
    onEditProfile: isOwnProfile ? handleEditProfile : undefined,
    onSendMessage: canInteractWithOtherProfile ? handleSendMessage : undefined,
    onFollow: canInteractWithOtherProfile && !profile.isFollowing ? handleFollow : undefined,
    onUnfollow: canInteractWithOtherProfile && profile.isFollowing ? handleUnfollow : undefined,
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

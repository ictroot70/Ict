'use client'
import { useSelector } from 'react-redux'

import { type PaginatedPosts, useGetPostsByUserInfiniteQuery } from '@/entities/posts/api'
import { type PublicProfileData, useGetPublicProfileQuery } from '@/entities/profile/api'
import { useInitializeProfile } from '@/entities/profile/hooks'
import { baseApi } from '@/shared/api/base-api'
import { useAuthSessionHintContext } from '@/shared/auth'
import { APP_ROUTES } from '@/shared/constant'
import { logger } from '@/shared/lib'
import { useParams, useRouter } from 'next/navigation'

type MeQueryCacheEntry = {
  data?: unknown
  endpointName?: string
  status?: 'fulfilled' | 'pending' | 'rejected' | 'uninitialized'
}

type ProfileHookState = {
  auth: {
    isAuthenticated: boolean
  }
} & Record<
  typeof baseApi.reducerPath,
  {
    queries: Record<string, MeQueryCacheEntry>
  }
>

export const useProfile = (
  profileDataServer: PublicProfileData,
  postsDataServer: PaginatedPosts
) => {
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)
  const router = useRouter()

  const isAuthenticated = useSelector((state: ProfileHookState) => state.auth.isAuthenticated)
  const meQueryState = useSelector((state: ProfileHookState) => {
    const queries = Object.values(state[baseApi.reducerPath].queries) as Array<{
      data?: unknown
      endpointName?: string
      status?: 'fulfilled' | 'pending' | 'rejected' | 'uninitialized'
    }>

    return queries.find(query => query.endpointName === 'me')
  })
  const { hasAuthHint, authUserIdHint } = useAuthSessionHintContext()
  const { isInit } = useInitializeProfile(userId, profileDataServer, postsDataServer)

  const { data: profileData, isLoading: isProfileLoading } = useGetPublicProfileQuery(
    { profileId: userId },
    { skip: !isInit }
  )

  const {
    data: postsData,
    isLoading: isPostsLoading,
    isFetching: isFetchingPosts,
    fetchNextPage,
    hasNextPage,
  } = useGetPostsByUserInfiniteQuery({ userId: userId }, { skip: !isInit })

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
    // TODO: implement follow logic
    logger.info('[profile] Follow user:', profile.id)
  }

  const handleUnfollow = async () => {
    // TODO: implement unfollow logic
    logger.info('[profile] Unfollow user:', profile.id)
  }

  const meUserId =
    meQueryState?.data &&
    typeof meQueryState.data === 'object' &&
    'userId' in meQueryState.data &&
    typeof meQueryState.data.userId === 'number'
      ? meQueryState.data.userId
      : null
  const isAuthResolving =
    hasAuthHint &&
    !isAuthenticated &&
    (!meQueryState || meQueryState.status === 'pending' || meQueryState.status === 'uninitialized')
  const shouldShowAuthActionSkeleton = !isAuthenticated && isAuthResolving
  const isOwnProfile = isAuthenticated && profile.id === (meUserId ?? authUserIdHint)
  const authActionSkeletonVariant: 'single' | 'double' =
    authUserIdHint === profile.id ? 'single' : 'double'

  const profileInfoActions = {
    onEditProfile: isOwnProfile ? handleEditProfile : undefined,
    onSendMessage: !isOwnProfile ? handleSendMessage : undefined,
    onFollow: !isOwnProfile && !profile.isFollowing ? handleFollow : undefined,
    onUnfollow: !isOwnProfile && profile.isFollowing ? handleUnfollow : undefined,
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

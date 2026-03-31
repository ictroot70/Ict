'use client'

import { useEffect, useState } from 'react'

import { postApi, type PaginatedPosts, useGetPostsByUserInfiniteQuery } from '@/entities/posts/api'
import {
  profileApi,
  type PublicProfileData,
  useGetPublicProfileQuery,
} from '@/entities/profile/api'
import { useInitializeProfile } from '@/entities/profile/hooks'
import { useAppSelector } from '@/lib/hooks'
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

export const useProfile = (
  profileDataServer: PublicProfileData,
  postsDataServer: PaginatedPosts
) => {
  const [isHydrated, setIsHydrated] = useState(false)
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)
  const router = useRouter()
  const profileQueryArgs = { profileId: userId }
  const postsQueryArgs = { userId }

  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated)
  const profileDataFromCache = useAppSelector(
    profileApi.endpoints.getPublicProfile.select(profileQueryArgs)
  )?.data
  const postsDataFromCache = useAppSelector(
    postApi.endpoints.getInfinitePostsByUser.select(postsQueryArgs)
  )?.data
  const hasProfileDataInCache = Boolean(profileDataFromCache)
  const hasPostsDataInCache = Boolean(postsDataFromCache?.pages?.length)
  const meQueryState = useAppSelector(state => {
    const queries = Object.values(state[baseApi.reducerPath].queries) as MeQueryCacheEntry[]

    return queries.find(query => query.endpointName === 'me')
  })
  const { hasAuthHint, authUserIdHint } = useAuthSessionHintContext()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

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
  const isAuthenticatedUi = isHydrated && isAuthenticated
  const isAuthResolving =
    hasAuthHint &&
    !isAuthenticatedUi &&
    (!meQueryState || meQueryState.status === 'pending' || meQueryState.status === 'uninitialized')
  const shouldShowAuthActionSkeleton = isHydrated && !isAuthenticatedUi && isAuthResolving
  const isOwnProfile = isAuthenticatedUi && profile.id === (meUserId ?? authUserIdHint)
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
    isAuthenticated: isAuthenticatedUi,
    shouldShowAuthActionSkeleton,
    authActionSkeletonVariant,
    profileInfoActions,
    loadMorePostsHandler,
  }
}

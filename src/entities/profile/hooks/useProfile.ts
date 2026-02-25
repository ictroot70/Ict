'use client'
import { APP_ROUTES } from '@/shared/constant'

import { useMeQuery } from '@/features/auth'
import { useParams, useRouter } from 'next/navigation'
import { useInitializeProfile } from '@/entities/profile/hooks'

import { type PaginatedPosts, useGetPostsByUserInfiniteQuery } from '@/entities/posts/api'
import { type PublicProfileData, useGetPublicProfileQuery } from '@/entities/profile/api'

export const useProfile = (
  profileDataServer: PublicProfileData,
  postsDataServer: PaginatedPosts
) => {
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)
  const router = useRouter()

  const { data: user } = useMeQuery()
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
    router.push(APP_ROUTES.PROFILE.EDIT)
  }

  const handleSendMessage = () => {
    router.push(APP_ROUTES.MESSENGER.DIALOGUE(profile.id))
  }

  const handleFollow = async () => {
    // TODO: implement follow logic
    console.log('Follow user:', profile.id)
  }

  const handleUnfollow = async () => {
    // TODO: implement unfollow logic
    console.log('Unfollow user:', profile.id)
  }

  const isAuthenticated = !!user
  const isOwnProfile = profile.id === user?.userId

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
    profileInfoActions,
    loadMorePostsHandler,
  }
}

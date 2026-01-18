'use client'
import s from './Profile.module.scss'
import { useParams } from 'next/navigation'

import { useMeQuery } from '@/features/auth'
import { useInitializeProfile } from '@/entities/profile/hooks'
import { useGetPublicProfileQuery, PublicProfileData } from '@/entities/profile/api'
import { PaginatedPosts, useGetPostsByUserInfiniteQuery } from '@/entities/posts/api'

import { InfiniteScrollTrigger, Loading } from '@/shared/composites'
import { ProfileInfo } from './ProfileInfo'
import { ProfilePosts } from './ProfilePosts'

type Props = {
  profileDataServer: PublicProfileData
  postsDataServer: PaginatedPosts
}

export function Profile({ profileDataServer, postsDataServer }: Props) {
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)

  const { data: user } = useMeQuery()
  const { isInit } = useInitializeProfile(userId, profileDataServer, postsDataServer)

  const { data: profileData, isLoading: isProfileLoading } = useGetPublicProfileQuery(
    { profileId: userId },
    { skip: !userId || !isInit }
  )

  const {
    data: postsData,
    isLoading: isPostsLoading,
    isFetching: isFetchingPosts,
    fetchNextPage,
    hasNextPage,
  } = useGetPostsByUserInfiniteQuery({ userId: userId }, { skip: !userId || !isInit })

  const isLoading = isProfileLoading || isPostsLoading

  const profile = profileData || profileDataServer
  const posts = postsData?.pages?.flatMap(page => page.items || []) || postsDataServer?.items || []

  const loadMorePostsHandler = () => {
    if (hasNextPage && !isFetchingPosts) {
      fetchNextPage()
    }
  }

  if (isLoading) {
    return <Loading />
  }

  const isAuthenticated = !!user
  const isOwnProfile = profile.id === user?.userId

  return (
    <>
      <div className={s.profile}>
        <ProfileInfo profile={profile} isAuth={isAuthenticated} isOwnProfile={isOwnProfile} />
        <ProfilePosts posts={posts} isOwnProfile={isOwnProfile} />
      </div>
      <InfiniteScrollTrigger hasNextPage={hasNextPage} onLoadMore={loadMorePostsHandler} />
    </>
  )
}

'use client'

import s from './Profile.module.scss'

import { useParams } from 'next/navigation'

import { useMeQuery } from '@/features/auth'
import { useGetPublicProfileQuery } from '@/entities/profile/api'
import { useGetPostsByUserInfiniteQuery } from '@/entities/posts/api'

import { Loading, InfiniteScrollTrigger } from '@/shared/composites'
import { ProfileInfo, ProfilePosts } from '@/entities/profile/ui'

export const Profile = () => {
  const { id } = useParams<{ id: string }>()
  const userId = Number(id)

  const { data: user, isLoading: isAuthLoading } = useMeQuery()
  const { data: profile, isLoading: isProfileLoading } = useGetPublicProfileQuery(
    { profileId: userId },
    { skip: !id }
  )
  const {
    data: postsData,
    isLoading: isPostsLoading,
    isFetching: isFetchingPosts,
    fetchNextPage,
    hasNextPage,
  } = useGetPostsByUserInfiniteQuery({ userId: userId }, { skip: !profile })

  const isLoading = isAuthLoading || isProfileLoading || isPostsLoading

  const posts = postsData?.pages.flatMap(page => page.items) || []

  const loaderMorePosts = () => {
    if (hasNextPage && !isFetchingPosts) fetchNextPage()
  }

  if (isLoading) {
    return <Loading />
  }

  if (!profile) {
    return null
  }

  const isAuthenticated = !!user
  const isOwnProfile = profile.id === user?.userId

  return (
    <>
      <div className={s.profile}>
        <ProfileInfo profile={profile} isAuth={isAuthenticated} isOwnProfile={isOwnProfile} />
        <ProfilePosts posts={posts} isOwnProfile={isOwnProfile} />
      </div>

      <InfiniteScrollTrigger hasNextPage={hasNextPage} onLoadMore={loaderMorePosts} />
    </>
  )
}

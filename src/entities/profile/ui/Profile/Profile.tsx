'use client'

import {
  PaginatedResponse,
  postApi,
  PostViewModel,
  useGetPostsByUserInfiniteQuery,
} from '@/entities/posts/api'
import { useGetPublicProfileQuery } from '@/entities/profile/api'
import { useMeQuery } from '@/features/auth'
import { useAppStore } from '@/lib/hooks'
import { InfiniteScrollTrigger, Loading } from '@/shared/composites'
import { InfiniteData } from '@reduxjs/toolkit/query'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { profileApi, PublicProfileData } from '../../api'
import s from './Profile.module.scss'
import { ProfileInfo } from './ProfileInfo'
import { ProfilePosts } from './ProfilePosts'
import { useInitializeProfile } from '../../hooks'

type Props = {
  profileDataServer: PublicProfileData
  postsDataServer: PaginatedResponse<PostViewModel>
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
  } = useGetPostsByUserInfiniteQuery(
    { userId: userId },
    {
      skip: !userId || !isInit,
    }
  )

  const posts = useMemo(() => {
    if (postsData?.pages) {
      return postsData.pages.flatMap(page => page.items || [])
    }
    return postsDataServer?.items || []
  }, [postsData, postsDataServer])

  const profile = profileData || profileDataServer

  const isLoading = isProfileLoading || isPostsLoading

  const loadMorePosts = useCallback(() => {
    if (hasNextPage && !isFetchingPosts) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingPosts, fetchNextPage])

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
      <InfiniteScrollTrigger hasNextPage={hasNextPage} onLoadMore={loadMorePosts} />
    </>
  )
}

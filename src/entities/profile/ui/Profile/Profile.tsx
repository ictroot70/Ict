'use client'
import s from './Profile.module.scss'

import { PaginatedPosts } from '@/entities/posts/api'
import { PublicProfileData } from '@/entities/profile/api'
import { useProfile } from '@/entities/profile/hooks'

import { InfiniteScrollTrigger, Loading } from '@/shared/composites'
import { ProfileInfo } from './ProfileInfo'
import { ProfilePosts } from './ProfilePosts'

type Props = {
  profileDataServer: PublicProfileData
  postsDataServer: PaginatedPosts
}

export function Profile({ profileDataServer, postsDataServer }: Props) {
  const {
    posts,
    userId,
    profile,
    isLoading,
    hasNextPage,
    isOwnProfile,
    isAuthenticated,
    profileInfoActions,
    loadMorePostsHandler,
  } = useProfile(profileDataServer, postsDataServer)

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      <div className={s.profile}>
        <ProfileInfo
          profile={profile}
          isAuth={isAuthenticated}
          isOwnProfile={isOwnProfile}
          {...profileInfoActions}
        />
        <ProfilePosts posts={posts} isOwnProfile={isOwnProfile} userId={userId} />
      </div>
      <InfiniteScrollTrigger hasNextPage={hasNextPage} onLoadMore={loadMorePostsHandler} />
    </>
  )
}

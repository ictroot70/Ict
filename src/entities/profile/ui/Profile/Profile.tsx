'use client'
import { PaginatedPosts } from '@/entities/posts/api'
import { PublicProfileData } from '@/entities/profile/api'
import { useProfile } from '@/entities/profile/hooks'
import { InfiniteScrollTrigger } from '@/shared/composites'

import s from './Profile.module.scss'

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
    hasNextPage,
    isOwnProfile,
    isAuthenticated,
    shouldShowAuthActionSkeleton,
    authActionSkeletonVariant,
    profileInfoActions,
    loadMorePostsHandler,
  } = useProfile(profileDataServer, postsDataServer)

  return (
    <>
      <div className={s.profile}>
        <ProfileInfo
          profile={profile}
          isAuth={isAuthenticated}
          shouldShowAuthActionSkeleton={shouldShowAuthActionSkeleton}
          authActionSkeletonVariant={authActionSkeletonVariant}
          isOwnProfile={isOwnProfile}
          {...profileInfoActions}
        />
        <ProfilePosts posts={posts} isOwnProfile={isOwnProfile} userId={userId} />
      </div>
      <InfiniteScrollTrigger hasNextPage={hasNextPage} onLoadMore={loadMorePostsHandler} />
    </>
  )
}

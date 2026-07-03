'use client'

import type { PaginatedPosts, PostViewModel } from '@/entities/posts/api'
import type { PostOpenSource } from '@/shared/constant'

import {
  PostModalAuthState,
  RenderPostLikeAction,
} from '@/entities/posts/ui/PostModal/postModalLikeAction.types'
import { PublicProfileData } from '@/entities/profile/api'
import { useProfile } from '@/entities/profile/hooks'
import { InfiniteScrollTrigger, Loading } from '@/shared/composites'

import s from './Profile.module.scss'

import { ProfileInfo } from './ProfileInfo'
import { ProfilePosts } from './ProfilePosts'

export type ProfileProps = {
  profileDataServer: PublicProfileData
  postsDataServer: PaginatedPosts
  initialPostIdServer?: null | number
  initialPostDataServer?: null | PostViewModel
  initialPostSourceServer?: PostOpenSource
  postModalAuthState?: PostModalAuthState
  renderPostLikeAction?: RenderPostLikeAction
  resolvedUserId: number
}

export function Profile({
  profileDataServer,
  postsDataServer,
  initialPostIdServer = null,
  initialPostDataServer = null,
  initialPostSourceServer = 'direct',
  postModalAuthState,
  renderPostLikeAction,
  resolvedUserId,
}: Readonly<ProfileProps>) {
  const {
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
  } = useProfile(profileDataServer, postsDataServer, resolvedUserId)

  if (isLoading) {
    return <Loading />
  }

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
        <ProfilePosts
          posts={posts}
          isOwnProfile={isOwnProfile}
          userId={userId}
          initialPostIdServer={initialPostIdServer}
          initialPostDataServer={initialPostDataServer}
          initialPostSourceServer={initialPostSourceServer}
          postModalAuthState={postModalAuthState}
          renderPostLikeAction={renderPostLikeAction}
        />
      </div>
      <InfiniteScrollTrigger hasNextPage={hasNextPage} onLoadMore={loadMorePostsHandler} />
    </>
  )
}

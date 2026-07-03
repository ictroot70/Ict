'use client'

import {
  FOLLOWERS_FEED_QUERY_ARGS,
  type PostViewModel,
  useGetFollowersFeedInfiniteQuery,
} from '@/entities/posts/api'
import { useFollowUserState } from '@/entities/users/hooks/useFollowUserState'
import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { InfiniteScrollTrigger, Loading, LinearProgress } from '@/shared/composites'
import { showToastAlert } from '@/shared/lib'

import s from './Feed.module.scss'

import { useFeedActions } from '../model'
import { FeedEmptyState } from './FeedEmptyState'
import { FeedPost } from './FeedPost'

type FeedCurrentUser = {
  userId: number
  userName: string
}

type FeedPostItemProps = {
  currentUser?: FeedCurrentUser
  onCopyLink: () => void
  post: PostViewModel
}

function FeedPostItem({ currentUser, onCopyLink, post }: FeedPostItemProps) {
  const { handleToggleFollow, isFollowing, isFollowPending } = useFollowUserState(
    post.userName,
    post.ownerId,
    currentUser?.userId,
    { enabled: Boolean(currentUser && currentUser.userId !== post.ownerId) }
  )

  const handleFollowClick = () => {
    void handleToggleFollow().catch(() => {
      showToastAlert({
        message: isFollowing ? 'Failed to unfollow user' : 'Failed to follow user',
        type: 'error',
      })
    })
  }

  return (
    <FeedPost
      post={post}
      isFollowing={isFollowing}
      isFollowPending={isFollowPending}
      onToggleFollow={handleFollowClick}
      onCopyLink={onCopyLink}
      currentUser={currentUser}
    />
  )
}

export function Feed() {
  const { copyPostLink } = useFeedActions()
  const { user } = useAuthUiState()
  const { data, isLoading, isError, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useGetFollowersFeedInfiniteQuery(FOLLOWERS_FEED_QUERY_ARGS)

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  if (isLoading) {
    return <Loading />
  }

  if (isError) {
    return <div>Failed to load posts</div>
  }

  const posts = Array.from(
    new Map((data?.pages.flatMap(page => page.items) ?? []).map(post => [post.id, post])).values()
  )
  const currentUser = user ? { userId: user.userId, userName: user.name } : undefined

  if (posts.length === 0) {
    return <FeedEmptyState />
  }

  return (
    <>
      <LinearProgress active={isFetchingNextPage} />

      <div className={s.list}>
        {posts.map(post => (
          <FeedPostItem
            key={post.id}
            post={post}
            currentUser={currentUser}
            onCopyLink={() => copyPostLink(post.ownerId, post.id)}
          />
        ))}
      </div>
      <InfiniteScrollTrigger hasNextPage={hasNextPage} onLoadMore={handleLoadMore} />
    </>
  )
}

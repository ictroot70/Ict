'use client'

import { FOLLOWERS_FEED_QUERY_ARGS, useGetFollowersFeedInfiniteQuery } from '@/entities/posts/api'
import { InfiniteScrollTrigger, Loading, LinearProgress } from '@/shared/composites'

import s from './Feed.module.scss'

import { useFeedActions } from '../model'
import { FeedEmptyState } from './FeedEmptyState'
import { FeedPost } from './FeedPost'

export function Feed() {
  const { copyPostLink, isFollowing, isFollowPending, toggleFollow } = useFeedActions()
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

  if (posts.length === 0) {
    return <FeedEmptyState />
  }

  return (
    <>
      <LinearProgress active={isFetchingNextPage} />

      <div className={s.list}>
        {posts.map(post => (
          <FeedPost
            key={post.id}
            post={post}
            isFollowing={isFollowing(post.ownerId)}
            isFollowPending={isFollowPending(post.ownerId)}
            onToggleFollow={() => toggleFollow(post.ownerId)}
            onCopyLink={() => copyPostLink(post.ownerId, post.id)}
          />
        ))}
      </div>
      <InfiniteScrollTrigger hasNextPage={hasNextPage} onLoadMore={handleLoadMore} />
    </>
  )
}

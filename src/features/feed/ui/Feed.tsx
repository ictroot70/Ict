'use client'

import { useGetFollowersFeedInfiniteQuery } from '@/entities/posts/api'
import { InfiniteScrollTrigger, Loading, LinearProgress } from '@/shared/composites'

import { FeedEmptyState } from './FeedEmptyState'

export function Feed() {
  const { data, isLoading, isError, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useGetFollowersFeedInfiniteQuery({ pageSize: 10 })

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

  const posts = data?.pages.flatMap(page => page.items) ?? []

  if (posts.length === 0) {
    return <FeedEmptyState />
  }

  return (
    <>
      <LinearProgress active={isFetchingNextPage} />

      <div>
        {posts.map(post => (
          <div key={post.id}>{post.description || post.userName}</div>
        ))}
      </div>
      <InfiniteScrollTrigger hasNextPage={hasNextPage} onLoadMore={handleLoadMore} />
    </>
  )
}

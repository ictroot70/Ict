'use client'

import { useGetFollowersFeedInfiniteQuery } from '@/entities/posts/api'
import { Loading } from '@/shared/composites'

import { FeedEmptyState } from './FeedEmptyState'

export function Feed() {
  const { data, isLoading, isError } = useGetFollowersFeedInfiniteQuery({ pageSize: 10 })

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
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.description || post.userName}</div>
      ))}
    </div>
  )
}

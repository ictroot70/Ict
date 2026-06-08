'use client'

import { useCallback, useMemo } from 'react'

import { PaginatedCommentsResponse } from '@/entities/posts/api/posts.types'
import { COMMENTS_PAGE_SIZE } from '@/entities/posts/lib/comment-likes'
import { sortComments } from '@/entities/posts/lib/sort-comments'

import { useGetPostCommentsInfiniteQuery } from '../api/postCommentsApi'

export const usePostComments = (
  postId: number | undefined,
  enabled = true,
  currentUserId?: number
) => {
  const skip = !enabled || !postId || postId <= 0

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isLoading, isError } =
    useGetPostCommentsInfiniteQuery({ postId: postId ?? 0, pageSize: COMMENTS_PAGE_SIZE }, { skip })

  const comments = useMemo(
    () =>
      sortComments(
        data?.pages.flatMap((page: PaginatedCommentsResponse) => page.items) ?? [],
        currentUserId
      ),
    [currentUserId, data]
  )

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  return {
    comments,
    loadMore,
    hasNextPage: Boolean(hasNextPage),
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    totalCount: data?.pages[0]?.totalCount ?? 0,
  }
}

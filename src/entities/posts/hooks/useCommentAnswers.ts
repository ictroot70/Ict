'use client'

import { useCallback, useEffect, useMemo } from 'react'

import { PaginatedAnswersResponse } from '@/entities/posts/api/posts.types'
import { COMMENTS_PAGE_SIZE } from '@/entities/posts/lib/comment-likes'
import { sortAnswers } from '@/entities/posts/lib/sort-comments'

import { useGetCommentAnswersInfiniteQuery } from '../api/postCommentsApi'

export const useCommentAnswers = (postId: number, commentId: number, enabled = false) => {
  const queryArg = { postId, commentId, pageSize: COMMENTS_PAGE_SIZE }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useGetCommentAnswersInfiniteQuery(queryArg, {
    skip: !enabled,
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  })

  useEffect(() => {
    if (!enabled || isFetching) {
      return
    }

    const hasCachedPages = Boolean(data?.pages?.length)

    if (!hasCachedPages) {
      void refetch()
    }
  }, [data?.pages?.length, enabled, isFetching, refetch])

  const answers = useMemo(
    () => sortAnswers(data?.pages.flatMap((page: PaginatedAnswersResponse) => page.items) ?? []),
    [data]
  )

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  return {
    answers,
    loadMore,
    hasNextPage: Boolean(hasNextPage),
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    totalCount: data?.pages[0]?.totalCount ?? 0,
  }
}

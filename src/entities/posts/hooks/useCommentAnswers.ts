'use client'

import { useCallback, useMemo } from 'react'

import { useGetCommentAnswersInfiniteQuery } from '@/entities/posts/api/postApi'
import { COMMENTS_PAGE_SIZE } from '@/entities/posts/lib/comment-likes'

export const useCommentAnswers = (postId: number, commentId: number, enabled = false) => {
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isLoading, isError } =
    useGetCommentAnswersInfiniteQuery(
      { postId, commentId, pageSize: COMMENTS_PAGE_SIZE },
      { skip: !enabled }
    )

  const answers = useMemo(() => data?.pages.flatMap(page => page.items) ?? [], [data])

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

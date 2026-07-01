import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import {
  useCreateCommentMutation,
  useGetPostCommentsInfiniteQuery,
} from '@/entities/posts/api/postCommentsApi'
import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { showToastAlert } from '@/shared/lib'
import {
  COMMENT_CONTENT_MAX,
  type CommentFormData,
  type CommentsViewModel,
} from '@/shared/types/comments'

import { COMMENTS_PAGE_SIZE } from '../lib'

type UsePostCommentsParams = {
  postId?: number
  enabled?: boolean
}

export const usePostComments = ({ postId, enabled = true }: UsePostCommentsParams) => {
  const [createComment, { isLoading: isCreateCommentLoading }] = useCreateCommentMutation()
  const { user } = useAuthUiState()

  const resolvedPostId = postId ?? 0
  const isValidPostId = Number.isInteger(resolvedPostId) && resolvedPostId > 0

  const {
    control: commentControl,
    handleSubmit: handleCommentSubmit,
    reset: resetComment,
    watch: watchComment,
  } = useForm<CommentFormData>({
    defaultValues: { comment: '' },
  })

  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
  } = useGetPostCommentsInfiniteQuery(
    {
      postId: resolvedPostId,
      pageSize: COMMENTS_PAGE_SIZE,
      sortDirection: 'desc',
    },
    {
      skip: !enabled || !isValidPostId,
    }
  )

  const comments: CommentsViewModel[] = commentsData?.pages.flatMap(page => page.items) ?? []

  const handlePublish = async (data: CommentFormData) => {
    const trimmed = data.comment.trim()
    const isCommentValid = trimmed.length > 0 && trimmed.length <= COMMENT_CONTENT_MAX

    if (!enabled || !user?.userId || !isCommentValid || !isValidPostId || isCreateCommentLoading) {
      return false
    }

    resetComment()

    try {
      await createComment({
        postId: resolvedPostId,
        body: { content: trimmed },
      }).unwrap()

      return true
    } catch {
      showToastAlert({ message: 'Failed to publish comment', type: 'error' })

      return false
    }
  }

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  useEffect(() => {
    resetComment()
  }, [resolvedPostId, resetComment])

  const totalCount = commentsData?.pages[0]?.totalCount ?? 0

  return {
    comments,
    totalCount,
    commentControl,
    handleCommentSubmit,
    watchComment,
    handlePublish,
    isCommentPublishing: isCreateCommentLoading,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    loadMore,
    commentMaxLength: COMMENT_CONTENT_MAX,
  }
}

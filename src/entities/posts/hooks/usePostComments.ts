import type { CommentFormData, CommentsViewModel } from '@/shared/types/comments'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { useCreateCommentMutation } from '@/entities/posts/api'
import {
  useCreateCommentAnswerMutation,
  useGetPostCommentsInfiniteQuery,
} from '@/entities/posts/api/postCommentsApi'
import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { showToastAlert } from '@/shared/lib'
import { buildReplyMentionPrefix, COMMENT_CONTENT_MAX } from '@/shared/types'

import { COMMENTS_PAGE_SIZE } from '../lib'

type UsePostCommentsParams = {
  postId?: number
  enabled?: boolean
}

type ReplyTarget = {
  commentId: number
  userName: string
}

export const usePostComments = ({ postId, enabled = true }: UsePostCommentsParams) => {
  const [createComment, { isLoading: isCreateCommentLoading }] = useCreateCommentMutation()
  const [createAnswer, { isLoading: isCreateAnswerLoading }] = useCreateCommentAnswerMutation()
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null)
  const { user } = useAuthUiState()

  const resolvedPostId = postId ?? 0
  const hasPostId = Number.isInteger(resolvedPostId) && resolvedPostId > 0

  const {
    control: commentControl,
    handleSubmit: handleCommentSubmit,
    reset: resetComment,
    setFocus: setCommentFocus,
    setValue: setCommentValue,
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
      skip: !enabled || !hasPostId,
    }
  )

  const comments: CommentsViewModel[] = commentsData?.pages.flatMap(page => page.items) ?? []
  const isCommentPublishing = isCreateCommentLoading || isCreateAnswerLoading

  const handlePublish = async (data: CommentFormData) => {
    const trimmed = data.comment.trim()
    const isCommentValid = trimmed.length > 0 && trimmed.length <= COMMENT_CONTENT_MAX

    if (!enabled || !user?.userId || !isCommentValid || !hasPostId || isCommentPublishing) {
      return false
    }

    try {
      if (replyTarget) {
        await createAnswer({
          postId: resolvedPostId,
          commentId: replyTarget.commentId,
          content: trimmed,
        }).unwrap()

        setReplyTarget(null)
      } else {
        await createComment({
          postId: resolvedPostId,
          body: { content: trimmed },
        }).unwrap()
      }

      resetComment()

      return true
    } catch {
      showToastAlert({
        message: replyTarget ? 'Failed to publish reply' : 'Failed to publish comment',
        type: 'error',
      })

      return false
    }
  }

  const handleStartReply = (target: ReplyTarget) => {
    const mentionPrefix = buildReplyMentionPrefix(target.userName)

    setReplyTarget(target)
    setCommentValue('comment', mentionPrefix, { shouldDirty: true, shouldTouch: true })
    setCommentFocus('comment')
  }

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  useEffect(() => {
    setReplyTarget(null)
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
    handleStartReply,
    replyTarget,
    isReplyPublishing: Boolean(replyTarget && isCreateAnswerLoading),
    isCommentPublishing,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    loadMore,
    commentMaxLength: COMMENT_CONTENT_MAX,
  }
}

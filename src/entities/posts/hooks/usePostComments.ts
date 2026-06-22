import type { CommentThreadItem } from '../types/comments'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { useCreateCommentMutation, useGetPostCommentsQuery } from '@/entities/posts/api'
import { useGetPublicProfileQuery } from '@/entities/profile'
import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { showToastAlert } from '@/shared/lib'
import { CommentFormData, CommentsViewModel } from '@/shared/types'

type UsePostCommentsParams = {
  postId?: number
  enabled?: boolean
}

const COMMENT_MAX_LENGTH = 300
const COMMENT_AVATAR_WIDTH = 45
const FALLBACK_USER_NAME = 'UserName'

const mapCommentToThreadItem = (comment: CommentsViewModel): CommentThreadItem => {
  const author = comment.from as CommentsViewModel['from'] & { username?: string }

  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    userName: author.userName ?? author.username ?? FALLBACK_USER_NAME,
    avatar: author.avatars?.[0]?.url,
    isOptimistic: false,
  }
}

export const usePostComments = ({ postId, enabled = true }: UsePostCommentsParams) => {
  const [optimisticComments, setOptimisticComments] = useState<CommentThreadItem[]>([])
  const [createComment, { isLoading: isCreateCommentLoading }] = useCreateCommentMutation()
  const { user } = useAuthUiState()
  const { data: currentUserProfile, isLoading: isCurrentUserProfileLoading } =
    useGetPublicProfileQuery({ profileId: user?.userId ?? 0 }, { skip: !enabled || !user?.userId })

  const currentUserName = user?.name ?? currentUserProfile?.userName ?? FALLBACK_USER_NAME

  const preferredAvatar = currentUserProfile?.avatars.find(
    avatar => avatar.width === COMMENT_AVATAR_WIDTH
  )

  const currentUserAvatar = preferredAvatar?.url ?? currentUserProfile?.avatars[0]?.url

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
    isLoading: isCommentsLoading,
    isError: isCommentsError,
  } = useGetPostCommentsQuery(
    {
      postId: resolvedPostId,
      pageSize: 12,
      pageNumber: 1,
      sortDirection: 'desc',
    },
    {
      skip: !enabled || !isValidPostId,
    }
  )
  const serverComments = commentsData?.items.map(mapCommentToThreadItem) ?? []

  const serverCommentIds = new Set(serverComments.map(comment => comment.id))

  const visibleOptimisticComments = optimisticComments.filter(
    comment => !serverCommentIds.has(comment.id)
  )

  const comments = [...visibleOptimisticComments, ...serverComments]

  const handlePublish = async (data: CommentFormData) => {
    const trimmed = data.comment.trim()

    const isCommentValid = trimmed.length > 0 && trimmed.length <= COMMENT_MAX_LENGTH

    if (
      !enabled ||
      !user?.userId ||
      !isCommentValid ||
      !isValidPostId ||
      isCreateCommentLoading ||
      isCurrentUserProfileLoading
    ) {
      return
    }

    const optimisticId = `local-comment-${Date.now()}`

    const optimisticComment: CommentThreadItem = {
      id: optimisticId,
      content: trimmed,
      createdAt: new Date().toISOString(),
      userName: currentUserName,
      avatar: currentUserAvatar,
      isOptimistic: true,
    }

    setOptimisticComments(prev => [optimisticComment, ...prev])
    resetComment()

    try {
      const createdComment = await createComment({
        postId: resolvedPostId,
        body: { content: trimmed },
      }).unwrap()

      setOptimisticComments(prev =>
        prev.map(comment =>
          comment.id === optimisticId ? mapCommentToThreadItem(createdComment) : comment
        )
      )
    } catch {
      setOptimisticComments(prev => prev.filter(comment => comment.id !== optimisticId))
      showToastAlert({ message: 'Failed to publish comment', type: 'error' })
    }
  }

  useEffect(() => {
    setOptimisticComments([])
    resetComment()
  }, [resolvedPostId, resetComment])

  const totalCount = (commentsData?.totalCount ?? 0) + visibleOptimisticComments.length

  const isCommentPublishing = isCreateCommentLoading || isCurrentUserProfileLoading

  return {
    comments,
    totalCount,
    commentControl,
    handleCommentSubmit,
    watchComment,
    handlePublish,
    isCommentPublishing,
    isCommentsLoading,
    isCommentsError,
    commentMaxLength: COMMENT_MAX_LENGTH,
  }
}

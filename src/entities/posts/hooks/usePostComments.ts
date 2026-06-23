import type { CommentFormData, CommentsViewModel } from '@/shared/types'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { useCreateCommentMutation } from '@/entities/posts/api'
import { useGetPostCommentsInfiniteQuery } from '@/entities/posts/api/postCommentsApi'
import { useGetPublicProfileQuery } from '@/entities/profile'
import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { showToastAlert } from '@/shared/lib'

type UsePostCommentsParams = {
  postId?: number
  enabled?: boolean
  currentUserId?: number
}

const COMMENT_MAX_LENGTH = 300
const COMMENT_AVATAR_WIDTH = 45
const FALLBACK_USER_NAME = 'UserName'

export const usePostComments = ({
  postId,
  enabled = true,
  currentUserId,
}: UsePostCommentsParams) => {
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
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
  } = useGetPostCommentsInfiniteQuery(
    {
      postId: resolvedPostId,
      pageSize: 12,
      sortDirection: 'desc',
    },
    {
      skip: !enabled || !isValidPostId,
    }
  )

  const comments: CommentsViewModel[] = commentsData?.pages.flatMap(page => page.items) ?? []

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

    resetComment()

    try {
      await createComment({
        postId: resolvedPostId,
        body: { content: trimmed },
      }).unwrap()
    } catch {
      showToastAlert({ message: 'Failed to publish comment', type: 'error' })
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

  const isCommentPublishing = isCreateCommentLoading || isCurrentUserProfileLoading

  return {
    comments,
    totalCount,
    commentControl,
    handleCommentSubmit,
    watchComment,
    handlePublish,
    isCommentPublishing,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    loadMore,
    commentMaxLength: COMMENT_MAX_LENGTH,
  }
}

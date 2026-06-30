import { useCallback } from 'react'

import { useCreateCommentAnswerMutation } from '@/entities/posts/api/postCommentsApi'
import { showToastAlert } from '@/shared/lib'
import { ensureReplyMention } from '@/shared/types/comments'

type Props = {
  postId: number
  commentId: number
  replyToUserName: string
  currentUserName?: string
  currentUserAvatar?: string
  onBeforeSubmit?: () => void
}

export const useCreateCommentAnswerReply = ({
  postId,
  commentId,
  replyToUserName,
  currentUserName,
  currentUserAvatar,
  onBeforeSubmit,
}: Props) => {
  const [createAnswer, { isLoading: isSubmitting }] = useCreateCommentAnswerMutation()

  const submitReply = useCallback(
    async (content: string) => {
      const contentWithMention = ensureReplyMention(content, replyToUserName)

      onBeforeSubmit?.()

      try {
        await createAnswer({
          postId,
          commentId,
          content: contentWithMention,
          authorName: currentUserName,
          authorAvatar: currentUserAvatar,
        }).unwrap()
      } catch {
        showToastAlert({ message: 'Failed to publish reply', type: 'error' })
      }
    },
    [
      commentId,
      createAnswer,
      currentUserAvatar,
      currentUserName,
      onBeforeSubmit,
      postId,
      replyToUserName,
    ]
  )

  return {
    submitReply,
    isSubmitting,
  }
}

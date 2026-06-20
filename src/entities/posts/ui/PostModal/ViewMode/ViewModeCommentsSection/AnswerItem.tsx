'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useCreateCommentAnswerMutation } from '@/entities/posts/api/postCommentsApi'
import { useCommentLikeToggle } from '@/entities/posts/hooks'
import { useTimeAgo } from '@/entities/users/hooks/useTimeAgo'
import { ControlledInput } from '@/features/formControls'
import { Avatar } from '@/shared/composites'
import {
  AnswersViewModel,
  getCommentAuthorName,
  getCommentAvatarUrl,
  ensureReplyMention,
} from '@/shared/types/comments'
import { Button, Typography } from '@/shared/ui'

import s from '../ViewMode.module.scss'

import { CommentContentText } from './CommentContentText'
import { CommentLikeButton } from './CommentLikeButton'
import { CommentMetaActions } from './CommentMetaActions'

interface ReplyFormData {
  content: string
}

interface AnswerItemProps {
  postId: number
  answer: AnswersViewModel
  isAuthenticated: boolean
  currentUserName?: string
  currentUserAvatar?: string
}

export const AnswerItem: React.FC<AnswerItemProps> = ({
  postId,
  answer,
  isAuthenticated,
  currentUserName,
  currentUserAvatar,
}) => {
  const [isReplying, setIsReplying] = useState(false)

  const timeAgo = useTimeAgo(answer.createdAt)
  const { toggleAnswerLike } = useCommentLikeToggle(postId)
  const authorName = getCommentAuthorName(answer.from)

  const [createAnswer, { isLoading: isSubmitting }] = useCreateCommentAnswerMutation()

  const replyForm = useForm<ReplyFormData>({
    defaultValues: { content: '' },
  })

  const handleStartReply = () => setIsReplying(true)

  const handleCancelReply = () => {
    setIsReplying(false)
    replyForm.reset()
  }

  const handleSubmitReply = replyForm.handleSubmit(async data => {
    if (!data.content.trim()) {
      return
    }

    const contentWithMention = ensureReplyMention(data.content.trim(), authorName)

    try {
      await createAnswer({
        postId,
        commentId: answer.commentId,
        content: contentWithMention,
        authorName: currentUserName,
        authorAvatar: currentUserAvatar,
      }).unwrap()

      handleCancelReply()
    } catch {
      // Error is handled by optimistic update rollback in RTK Query
    }
  })

  return (
    <div className={s.answerBlock}>
      <div className={s.comment}>
        <Avatar size={32} image={getCommentAvatarUrl(answer.from)} alt={authorName} />
        <div className={s.commentBody}>
          <Typography variant={'regular_14'} color={'light'} className={s.commentText}>
            <strong>{authorName}</strong> <CommentContentText content={answer.content} />
          </Typography>
          <CommentMetaActions
            timeAgo={timeAgo}
            isAuthenticated={isAuthenticated}
            likeCount={answer.likeCount}
            showAnswerButton={!isReplying}
            onAnswer={handleStartReply}
          />
        </div>
        <CommentLikeButton
          isLiked={answer.isLiked}
          likeCount={answer.likeCount}
          isAuthenticated={isAuthenticated}
          onToggle={() => toggleAnswerLike(answer.commentId, answer.id, answer.isLiked)}
        />
      </div>

      {isReplying && (
        <form onSubmit={handleSubmitReply} className={s.replyContainer}>
          <div className={s.inputWrapper}>
            <ControlledInput
              name={'content'}
              control={replyForm.control}
              inputType={'text'}
              placeholder={`Reply to @${authorName}...`}
              className={s.inlineInput}
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          <div className={s.replyActions}>
            <Button
              variant={'text'}
              onClick={handleCancelReply}
              type={'button'}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant={'primary'}
              type={'submit'}
              disabled={!replyForm.watch('content')?.trim() || isSubmitting}
            >
              Reply
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

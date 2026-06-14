'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useCommentLikeToggle } from '@/entities/posts/hooks'
import { useTimeAgo } from '@/entities/users/hooks/useTimeAgo'
import { Avatar } from '@/shared/composites'
import {
  AnswerFormSchema,
  answerFormSchema,
  AnswersViewModel,
  buildReplyMentionPrefix,
  getCommentAuthorName,
  getCommentAvatarUrl,
} from '@/shared/types/comments'
import { Typography } from '@/shared/ui'
import { zodResolver } from '@hookform/resolvers/zod'

import s from '../ViewMode.module.scss'

import { AnswerInputForm } from './AnswerInputForm'
import { CommentContentText } from './CommentContentText'
import { CommentLikeButton } from './CommentLikeButton'
import { CommentMetaActions } from './CommentMetaActions'

interface AnswerItemProps {
  postId: number
  answer: AnswersViewModel
  isAuthenticated: boolean
  isSubmitting: boolean
  onPublishReply: (content: string, replyToUserName: string) => Promise<void>
}

export const AnswerItem: React.FC<AnswerItemProps> = ({
  postId,
  answer,
  isAuthenticated,
  isSubmitting,
  onPublishReply,
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false)
  const timeAgo = useTimeAgo(answer.createdAt)
  const { toggleAnswerLike } = useCommentLikeToggle(postId)
  const authorName = getCommentAuthorName(answer.from)

  const {
    control: answerControl,
    handleSubmit: handleAnswerSubmit,
    reset: resetAnswer,
    watch: watchAnswer,
  } = useForm<AnswerFormSchema>({
    defaultValues: { answer: '' },
    resolver: zodResolver(answerFormSchema),
    mode: 'onChange',
  })

  const handleToggleReply = () => {
    if (!showReplyInput) {
      resetAnswer({ answer: buildReplyMentionPrefix(authorName) })
    }
    setShowReplyInput(prev => !prev)
  }

  const handlePublishAnswer = async ({ answer: content }: AnswerFormSchema) => {
    const trimmedContent = content.trim()

    if (!trimmedContent) {
      return
    }

    resetAnswer()
    setShowReplyInput(false)

    try {
      await onPublishReply(trimmedContent, authorName)
    } catch {
      resetAnswer({ answer: trimmedContent })
      setShowReplyInput(true)
    }
  }

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
            onAnswer={handleToggleReply}
            likeCount={answer.likeCount}
          />
        </div>
        <CommentLikeButton
          isLiked={answer.isLiked}
          likeCount={answer.likeCount}
          isAuthenticated={isAuthenticated}
          onToggle={() => toggleAnswerLike(answer.commentId, answer.id, answer.isLiked)}
        />
      </div>

      {showReplyInput && isAuthenticated && (
        <AnswerInputForm
          control={answerControl}
          handleSubmit={handleAnswerSubmit}
          watch={watchAnswer}
          onSubmit={handlePublishAnswer}
          isSubmitting={isSubmitting}
          className={s.nestedReplyInputForm}
        />
      )}
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useCreateAnswerMutation } from '@/entities/posts/api/postCommentsApi'
import { useCommentAnswers, useCommentLikeToggle } from '@/entities/posts/hooks'
import { useTimeAgo } from '@/entities/users/hooks/useTimeAgo'
import { InfiniteScrollTrigger, Avatar } from '@/shared/composites'
import { showToastAlert } from '@/shared/lib'
import {
  AnswerFormSchema,
  answerFormSchema,
  CommentsViewModel,
  buildReplyMentionPrefix,
  ensureReplyMention,
  getCommentAuthorName,
  getCommentAvatarUrl,
} from '@/shared/types/comments'
import { UserBase } from '@/shared/types/user/models'
import { Button, Typography } from '@/shared/ui'
import { zodResolver } from '@hookform/resolvers/zod'

import s from '../ViewMode.module.scss'

import { AnswerInputForm } from './AnswerInputForm'
import { AnswerItem } from './AnswerItem'
import { CommentContentText } from './CommentContentText'
import { CommentLikeButton } from './CommentLikeButton'
import { CommentMetaActions } from './CommentMetaActions'

interface CommentItemProps {
  postId: number
  comment: CommentsViewModel
  isAuthenticated: boolean
  currentUser?: UserBase
}

export const CommentItem: React.FC<CommentItemProps> = ({
  postId,
  comment,
  isAuthenticated,
  currentUser,
}) => {
  const [showAnswers, setShowAnswers] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const timeAgo = useTimeAgo(comment.createdAt)
  const { toggleCommentLike } = useCommentLikeToggle(postId)
  const {
    answers,
    loadMore,
    hasNextPage,
    isLoading: isAnswersLoading,
  } = useCommentAnswers(postId, comment.id, showAnswers)
  const [createAnswer, { isLoading: isCreatingAnswer }] = useCreateAnswerMutation()

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

  const answerCount = comment.answerCount
  const hasAnswers = answerCount > 0 || answers.length > 0
  const authorName = getCommentAuthorName(comment.from)

  const publishAnswer = async (rawContent: string, replyToUserName?: string) => {
    const content = replyToUserName
      ? ensureReplyMention(rawContent, replyToUserName)
      : rawContent.trim()

    setShowAnswers(true)

    await createAnswer({
      postId,
      commentId: comment.id,
      body: { content },
      optimisticFrom: currentUser,
    }).unwrap()
  }

  const handleToggleAnswers = () => {
    setShowAnswers(prev => !prev)
  }

  const handleToggleReply = () => {
    if (!showReplyInput) {
      // ✅ Устанавливаем mention с именем автора комментария
      resetAnswer({ answer: buildReplyMentionPrefix(authorName) })
      setShowAnswers(true)
    }
    setShowReplyInput(prev => !prev)
  }

  const handlePublishAnswer = async ({ answer }: AnswerFormSchema) => {
    const trimmedAnswer = answer

    resetAnswer()
    setShowReplyInput(false)

    try {
      await publishAnswer(trimmedAnswer)
    } catch {
      resetAnswer({ answer: trimmedAnswer })
      setShowReplyInput(true)
      showToastAlert({ message: 'Failed to publish answer', type: 'error' })
    }
  }

  const handlePublishReplyToAnswer = async (content: string, replyToUserName: string) => {
    try {
      await publishAnswer(content, replyToUserName)
    } catch {
      showToastAlert({ message: 'Failed to publish answer', type: 'error' })
      throw new Error('Failed to publish answer')
    }
  }

  const handleToggleLike = () => {
    toggleCommentLike(comment.id, comment.isLiked)
  }

  return (
    <div className={s.commentBlock}>
      <div className={s.comment}>
        <Avatar size={32} image={getCommentAvatarUrl(comment.from)} alt={authorName} />
        <div className={s.commentBody}>
          <Typography variant={'regular_14'} color={'light'} className={s.commentText}>
            <strong>{authorName}</strong> <CommentContentText content={comment.content} />
          </Typography>
          <CommentMetaActions
            timeAgo={timeAgo}
            isAuthenticated={isAuthenticated}
            onAnswer={handleToggleReply}
            likeCount={comment.likeCount}
          />
        </div>
        <CommentLikeButton
          isLiked={comment.isLiked}
          likeCount={comment.likeCount}
          isAuthenticated={isAuthenticated}
          onToggle={handleToggleLike}
        />
      </div>

      {showReplyInput && isAuthenticated && (
        <AnswerInputForm
          control={answerControl}
          handleSubmit={handleAnswerSubmit}
          watch={watchAnswer}
          onSubmit={handlePublishAnswer}
          isSubmitting={isCreatingAnswer}
        />
      )}
      {hasAnswers && (
        <div className={s.answersToggleContainer}>
          <div className={s.answersLine} />
          <Button variant={'text'} className={s.viewRepliesButton} onClick={handleToggleAnswers}>
            {showAnswers ? `Hide Answers (${answerCount})` : `View Answers (${answerCount})`}
          </Button>
        </div>
      )}
      {showAnswers && (
        <div className={s.replies}>
          {isAnswersLoading && answers.length === 0 && (
            <Typography variant={'small_text'} className={s.commentTimestamp}>
              Loading answers...
            </Typography>
          )}
          {answers.map(answer => (
            <AnswerItem
              key={answer.id}
              postId={postId}
              answer={answer}
              isAuthenticated={isAuthenticated}
              isSubmitting={isCreatingAnswer}
              onPublishReply={handlePublishReplyToAnswer}
            />
          ))}
          <InfiniteScrollTrigger hasNextPage={hasNextPage} onLoadMore={loadMore} />
        </div>
      )}
    </div>
  )
}

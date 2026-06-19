'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useCreateCommentAnswerMutation } from '@/entities/posts/api/postCommentsApi'
import { useCommentAnswers, useCommentLikeToggle } from '@/entities/posts/hooks'
import { useTimeAgo } from '@/entities/users/hooks/useTimeAgo'
import { ControlledInput } from '@/features/formControls'
import { InfiniteScrollTrigger, Avatar } from '@/shared/composites'
import {
  CommentsViewModel,
  getCommentAuthorName,
  getCommentAvatarUrl,
  ensureReplyMention,
} from '@/shared/types/comments'
import { Button, Typography } from '@/shared/ui'

import s from '../ViewMode.module.scss'

import { AnswerItem } from './AnswerItem'
import { CommentContentText } from './CommentContentText'
import { CommentLikeButton } from './CommentLikeButton'
import { CommentMetaActions } from './CommentMetaActions'

interface ReplyFormData {
  content: string
}

interface CommentItemProps {
  postId: number
  comment: CommentsViewModel
  isAuthenticated: boolean
  currentUserName?: string
  currentUserAvatar?: string
}

export const CommentItem: React.FC<CommentItemProps> = ({
  postId,
  comment,
  isAuthenticated,
  currentUserName,
  currentUserAvatar,
}) => {
  const [showAnswers, setShowAnswers] = useState(false)
  const [isReplying, setIsReplying] = useState(false)

  const timeAgo = useTimeAgo(comment.createdAt)
  const { toggleCommentLike } = useCommentLikeToggle(postId)
  const [createAnswer, { isLoading: isSubmitting }] = useCreateCommentAnswerMutation()

  const {
    answers,
    loadMore,
    hasNextPage,
    isLoading: isAnswersLoading,
  } = useCommentAnswers(postId, comment.id, showAnswers)

  const replyForm = useForm<ReplyFormData>({
    defaultValues: { content: '' },
  })

  const answerCount = comment.answerCount
  const hasAnswers = answerCount > 0 || answers.length > 0
  const authorName = getCommentAuthorName(comment.from)

  const handleToggleAnswers = () => setShowAnswers(prev => !prev)
  const handleToggleLike = () => toggleCommentLike(comment.id, comment.isLiked)

  const handleStartReply = () => setIsReplying(true)

  const handleCancelReply = () => {
    setIsReplying(false)
    replyForm.reset()
  }

  const handleSubmitReply = replyForm.handleSubmit(async data => {
    if (!data.content.trim()) {
      return
    }

    try {
      const contentWithMention = ensureReplyMention(data.content.trim(), authorName)

      await createAnswer({
        postId,
        commentId: comment.id,
        content: contentWithMention,
        authorName: currentUserName,
        authorAvatar: currentUserAvatar,
      }).unwrap()

      handleCancelReply()

      if (!showAnswers) {
        setShowAnswers(true)
      }
    } catch (error) {
      console.error('Failed to send reply:', error)
    }
  })

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
            likeCount={comment.likeCount}
            showAnswerButton={!isReplying}
            onAnswer={handleStartReply}
          />
        </div>
        <CommentLikeButton
          isLiked={comment.isLiked}
          likeCount={comment.likeCount}
          isAuthenticated={isAuthenticated}
          onToggle={handleToggleLike}
        />
      </div>

      {isReplying && (
        <form onSubmit={handleSubmitReply} className={s.replyContainer}>
          <div className={s.inputWrapper}>
            <ControlledInput
              name={'content'}
              control={replyForm.control}
              inputType={'text'}
              placeholder={`Ответ @${authorName}...`}
              className={s.inlineInput}
              disabled={isSubmitting}
            />
          </div>
          <div className={s.replyActions}>
            <Button
              variant={'text'}
              onClick={handleCancelReply}
              type={'button'}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button
              variant={'primary'}
              type={'submit'}
              disabled={!replyForm.watch('content')?.trim() || isSubmitting}
            >
              Ответить
            </Button>
          </div>
        </form>
      )}

      {hasAnswers && (
        <div className={s.answersToggleContainer}>
          <div className={s.answersLine} />
          <Button variant={'text'} className={s.viewRepliesButton} onClick={handleToggleAnswers}>
            {showAnswers ? `Скрыть ответы (${answerCount})` : `Посмотреть ответы (${answerCount})`}
          </Button>
        </div>
      )}

      {showAnswers && (
        <div className={s.replies}>
          {isAnswersLoading && answers.length === 0 && (
            <Typography variant={'small_text'} className={s.commentTimestamp}>
              Загрузка ответов...
            </Typography>
          )}
          {answers.map(answer => (
            <AnswerItem
              key={answer.id}
              postId={postId}
              answer={answer}
              isAuthenticated={isAuthenticated}
              currentUserName={currentUserName}
              currentUserAvatar={currentUserAvatar}
            />
          ))}
          <InfiniteScrollTrigger hasNextPage={hasNextPage} onLoadMore={loadMore} />
        </div>
      )}
    </div>
  )
}

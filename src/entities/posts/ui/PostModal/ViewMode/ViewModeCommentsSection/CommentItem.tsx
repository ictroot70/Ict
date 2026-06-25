'use client'

import React, { useState } from 'react'

import { useCreateCommentAnswerMutation } from '@/entities/posts/api/postCommentsApi'
import { useCommentAnswers, useCommentLikeToggle } from '@/entities/posts/hooks'
import { useReplyForm } from '@/entities/posts/hooks/useReplyForm'
import { useTimeAgo } from '@/entities/users/hooks/useTimeAgo'
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
import { ReplyForm } from './ReplyForm'

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

  const timeAgo = useTimeAgo(comment.createdAt)
  const { toggleCommentLike, isCommentLocked } = useCommentLikeToggle(postId)
  const [createAnswer, { isLoading: isSubmitting }] = useCreateCommentAnswerMutation()
  const {
    answers,
    loadMore,
    hasNextPage,
    isLoading: isAnswersLoading,
  } = useCommentAnswers(postId, comment.id, showAnswers)
  const { isReplying, replyForm, handleStartReply, handleCancelReply, handleSubmitReply } =
    useReplyForm()

  const answerCount = comment.answerCount
  const displayedAnswers = answers
  const hasAnswers = answerCount > 0 || displayedAnswers.length > 0
  const authorName = getCommentAuthorName(comment.from)

  const handleToggleAnswers = () => setShowAnswers(prev => !prev)
  const handleToggleLike = () => toggleCommentLike(comment.id, comment.isLiked)

  const onSubmitReply = async (content: string) => {
    const contentWithMention = ensureReplyMention(content, authorName)

    if (!showAnswers) {
      setShowAnswers(true)
    }

    try {
      await createAnswer({
        postId,
        commentId: comment.id,
        content: contentWithMention,
        authorName: currentUserName,
        authorAvatar: currentUserAvatar,
      }).unwrap()
    } catch (error) {
      console.error('Failed to create answer:', error)
    }
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
            showAnswerButton={!isReplying}
            likeCount={comment.likeCount}
            onAnswer={handleStartReply}
          />
        </div>
        <CommentLikeButton
          isLiked={comment.isLiked}
          isAuthenticated={isAuthenticated}
          onToggle={handleToggleLike}
          disabled={isCommentLocked(comment.id)}
        />
      </div>

      {isReplying && (
        <ReplyForm
          replyForm={replyForm}
          isSubmitting={isSubmitting}
          authorName={authorName}
          onSubmit={handleSubmitReply(onSubmitReply)}
          onCancel={handleCancelReply}
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
          {isAnswersLoading && displayedAnswers.length === 0 && (
            <Typography variant={'small_text'} className={s.commentTimestamp}>
              Loading Answers...
            </Typography>
          )}
          {displayedAnswers.map(answer => (
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

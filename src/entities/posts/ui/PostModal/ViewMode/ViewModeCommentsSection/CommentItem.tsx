'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useCreateAnswerMutation } from '@/entities/posts/api/postApi'
import { useCommentAnswers, useCommentLikeToggle } from '@/entities/posts/hooks'
import { useTimeAgo } from '@/entities/users/hooks/useTimeAgo'
import { ControlledInput } from '@/features/formControls'
import { InfiniteScrollTrigger, Avatar } from '@/shared/composites'
import {
  AnswerFormSchema,
  answerFormSchema,
  CommentsViewModel,
  COMMENT_CONTENT_MAX,
  getCommentAuthorName,
  getCommentAvatarUrl,
} from '@/shared/types/comments'
import { Button, Typography } from '@/shared/ui'
import { zodResolver } from '@hookform/resolvers/zod'

import s from '../ViewMode.module.scss'

import { AnswerItem } from './AnswerItem'
import { CommentLikeButton } from './CommentLikeButton'

interface CommentItemProps {
  postId: number
  comment: CommentsViewModel
  isAuthenticated: boolean
}

export const CommentItem: React.FC<CommentItemProps> = ({ postId, comment, isAuthenticated }) => {
  const [showAnswers, setShowAnswers] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const timeAgo = useTimeAgo(comment.createdAt)
  const { toggleCommentLike, isCommentLikeLoading } = useCommentLikeToggle(postId)
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

  const handleViewReplies = () => {
    setShowAnswers(true)
  }

  const handleToggleReply = () => {
    setShowReplyInput(prev => !prev)
  }

  const handlePublishAnswer = async ({ answer }: AnswerFormSchema) => {
    await createAnswer({
      postId,
      commentId: comment.id,
      body: { content: answer.trim() },
    }).unwrap()

    setShowAnswers(true)
    setShowReplyInput(false)
    resetAnswer()
  }

  return (
    <div className={s.commentBlock}>
      <div className={s.comment}>
        <Avatar
          size={36}
          image={getCommentAvatarUrl(comment.from)}
          alt={getCommentAuthorName(comment.from)}
        />
        <div className={s.commentBody}>
          <Typography variant={'regular_14'} color={'light'}>
            <strong>{getCommentAuthorName(comment.from)}</strong> {comment.content}
          </Typography>
          <div className={s.commentMeta}>
            <Typography variant={'small_text'} className={s.commentTimestamp}>
              {timeAgo}
            </Typography>
            {isAuthenticated && (
              <Button variant={'text'} className={s.replyButton} onClick={handleToggleReply}>
                Reply
              </Button>
            )}
          </div>
        </div>
        <CommentLikeButton
          isLiked={comment.isLiked}
          likeCount={comment.likeCount}
          isAuthenticated={isAuthenticated}
          isLoading={isCommentLikeLoading}
          onToggle={() => toggleCommentLike(comment.id, comment.isLiked)}
        />
      </div>

      {showReplyInput && isAuthenticated && (
        <form onSubmit={handleAnswerSubmit(handlePublishAnswer)} className={s.replyInputForm}>
          <ControlledInput
            name={'answer'}
            control={answerControl}
            inputType={'text'}
            placeholder={'Write a reply...'}
            className={s.input}
            maxLength={COMMENT_CONTENT_MAX}
          />
          <Button
            variant={'text'}
            type={'submit'}
            disabled={!watchAnswer('answer')?.trim() || isCreatingAnswer}
          >
            Publish
          </Button>
        </form>
      )}

      {comment.answerCount > 0 && !showAnswers && (
        <Button variant={'text'} className={s.viewRepliesButton} onClick={handleViewReplies}>
          View all {comment.answerCount} replies
        </Button>
      )}

      {showAnswers && (
        <div className={s.replies}>
          {isAnswersLoading && answers.length === 0 && (
            <Typography variant={'small_text'} className={s.commentTimestamp}>
              Loading replies...
            </Typography>
          )}
          {answers.map(answer => (
            <AnswerItem
              key={answer.id}
              postId={postId}
              commentId={comment.id}
              answer={answer}
              isAuthenticated={isAuthenticated}
            />
          ))}
          <InfiniteScrollTrigger hasNextPage={hasNextPage} onLoadMore={loadMore} />
        </div>
      )}
    </div>
  )
}

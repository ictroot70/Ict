'use client'

import React from 'react'

import { useCreateCommentAnswerMutation } from '@/entities/posts/api/postCommentsApi'
import { useCommentLikeToggle } from '@/entities/posts/hooks'
import { useReplyForm } from '@/entities/posts/hooks/useReplyForm'
import { useTimeAgo } from '@/entities/users/hooks/useTimeAgo'
import { Avatar } from '@/shared/composites'
import {
  AnswersViewModel,
  getCommentAuthorName,
  getCommentAvatarUrl,
  ensureReplyMention,
} from '@/shared/types/comments'
import { Typography } from '@/shared/ui'

import s from '../ViewMode.module.scss'

import { CommentContentText } from './CommentContentText'
import { CommentLikeButton } from './CommentLikeButton'
import { CommentMetaActions } from './CommentMetaActions'
import { ReplyForm } from './ReplyForm'

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
  const timeAgo = useTimeAgo(answer.createdAt)
  const { toggleAnswerLike } = useCommentLikeToggle(postId)
  const [createAnswer, { isLoading: isSubmitting }] = useCreateCommentAnswerMutation()
  const { isReplying, replyForm, handleStartReply, handleCancelReply, handleSubmitReply } =
    useReplyForm()

  const authorName = getCommentAuthorName(answer.from)

  const onSubmitReply = async (content: string) => {
    const contentWithMention = ensureReplyMention(content, authorName)

    await createAnswer({
      postId,
      commentId: answer.commentId,
      content: contentWithMention,
      authorName: currentUserName,
      authorAvatar: currentUserAvatar,
    }).unwrap()
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
        <ReplyForm
          replyForm={replyForm}
          isSubmitting={isSubmitting}
          authorName={authorName}
          onSubmit={handleSubmitReply(onSubmitReply)}
          onCancel={handleCancelReply}
        />
      )}
    </div>
  )
}

'use client'

import React from 'react'

import { useCommentLikeToggle } from '@/entities/posts/hooks'
import { useTimeAgo } from '@/entities/users/hooks/useTimeAgo'
import { Avatar } from '@/shared/composites'
import {
  AnswersViewModel,
  getCommentAuthorName,
  getCommentAvatarUrl,
} from '@/shared/types/comments'
import { Typography } from '@/shared/ui'

import s from '../ViewMode.module.scss'

import { CommentLikeButton } from './CommentLikeButton'

interface AnswerItemProps {
  postId: number
  commentId: number
  answer: AnswersViewModel
  isAuthenticated: boolean
}

export const AnswerItem: React.FC<AnswerItemProps> = ({
  postId,
  commentId,
  answer,
  isAuthenticated,
}) => {
  const timeAgo = useTimeAgo(answer.createdAt)
  const { toggleAnswerLike, isAnswerLikeLoading } = useCommentLikeToggle(postId)

  return (
    <div className={s.comment}>
      <Avatar
        size={36}
        image={getCommentAvatarUrl(answer.from)}
        alt={getCommentAuthorName(answer.from)}
      />
      <div className={s.commentBody}>
        <Typography variant={'regular_14'} color={'light'}>
          <strong>{getCommentAuthorName(answer.from)}</strong> {answer.content}
        </Typography>
        <Typography variant={'small_text'} className={s.commentTimestamp}>
          {timeAgo}
        </Typography>
      </div>
      <CommentLikeButton
        isLiked={answer.isLiked}
        likeCount={answer.likeCount}
        isAuthenticated={isAuthenticated}
        isLoading={isAnswerLikeLoading}
        onToggle={() => toggleAnswerLike(commentId, answer.id, answer.isLiked)}
      />
    </div>
  )
}

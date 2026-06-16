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

import { CommentContentText } from './CommentContentText'
import { CommentLikeButton } from './CommentLikeButton'
import { CommentMetaActions } from './CommentMetaActions'

interface AnswerItemProps {
  postId: number
  answer: AnswersViewModel
  isAuthenticated: boolean
}

export const AnswerItem: React.FC<AnswerItemProps> = ({ postId, answer, isAuthenticated }) => {
  const timeAgo = useTimeAgo(answer.createdAt)
  const { toggleAnswerLike } = useCommentLikeToggle(postId)
  const authorName = getCommentAuthorName(answer.from)

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
            showAnswerButton={false}
          />
        </div>
        <CommentLikeButton
          isLiked={answer.isLiked}
          likeCount={answer.likeCount}
          isAuthenticated={isAuthenticated}
          onToggle={() => toggleAnswerLike(answer.commentId, answer.id, answer.isLiked)}
        />
      </div>
    </div>
  )
}

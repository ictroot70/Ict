'use client'

import React from 'react'

import { Button, HeartFilled, HeartOutline, Typography } from '@/shared/ui'

import s from '../ViewMode.module.scss'

const LIKE_ACTIVE_COLOR = '#ED4956'

interface CommentLikeButtonProps {
  isLiked: boolean
  likeCount: number
  isAuthenticated: boolean
  onToggle: () => void
}

const formatLikeCount = (count: number): string => {
  if (count === 1) {
    return '1 like'
  }

  return `${count.toLocaleString()} likes`
}

export const CommentLikeButton: React.FC<CommentLikeButtonProps> = ({
  isLiked,
  likeCount,
  isAuthenticated,
  onToggle,
}) => {
  return (
    <div className={s.commentLikeWrapper}>
      {isAuthenticated && (
        <Button
          variant={'text'}
          className={s.commentLikeButton}
          onClick={onToggle}
          aria-label={isLiked ? 'Unlike' : 'Like'}
          aria-pressed={isLiked}
        >
          {isLiked ? (
            <HeartFilled size={16} color={LIKE_ACTIVE_COLOR} />
          ) : (
            <HeartOutline size={16} color={'white'} />
          )}
        </Button>
      )}
      {likeCount > 0 && (
        <Typography variant={'small_text'} className={s.likeCount}>
          {formatLikeCount(likeCount)}
        </Typography>
      )}
    </div>
  )
}

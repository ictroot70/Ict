'use client'

import React from 'react'

import { Button, HeartOutline, Typography } from '@/shared/ui'

import s from '../ViewMode.module.scss'

interface CommentLikeButtonProps {
  isLiked: boolean
  likeCount: number
  isAuthenticated: boolean
  isLoading?: boolean
  onToggle: () => void
}

export const CommentLikeButton: React.FC<CommentLikeButtonProps> = ({
  isLiked,
  likeCount,
  isAuthenticated,
  isLoading = false,
  onToggle,
}) => {
  return (
    <div className={s.commentLikeWrapper}>
      {isAuthenticated && (
        <Button
          variant={'text'}
          className={s.commentLikeButton}
          onClick={onToggle}
          disabled={isLoading}
          aria-label={isLiked ? 'Unlike' : 'Like'}
          aria-pressed={isLiked}
        >
          <HeartOutline size={16} color={isLiked ? 'var(--color-danger-500)' : 'white'} />
        </Button>
      )}
      {likeCount > 0 && (
        <Typography variant={'small_text'} className={s.likeCount}>
          {likeCount}
        </Typography>
      )}
    </div>
  )
}

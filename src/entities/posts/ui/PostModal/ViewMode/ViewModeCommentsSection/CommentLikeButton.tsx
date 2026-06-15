'use client'

import React from 'react'

import { Button, HeartFilled, HeartOutline } from '@/shared/ui'

import s from '../ViewMode.module.scss'

interface CommentLikeButtonProps {
  isLiked: boolean
  likeCount: number
  isAuthenticated: boolean
  onToggle: () => void
}

export const CommentLikeButton: React.FC<CommentLikeButtonProps> = ({
  isLiked,
  isAuthenticated,
  onToggle,
}) => {
  if (!isAuthenticated) {
    return null
  }

  return (
    <Button
      variant={'text'}
      className={s.commentLikeButton}
      onClick={onToggle}
      aria-label={isLiked ? 'Unlike' : 'Like'}
      aria-pressed={isLiked}
    >
      {isLiked ? (
        <HeartFilled size={16} color={'var(--color-danger-500)'} />
      ) : (
        <HeartOutline size={16} color={'var(--color-light-100)'} />
      )}
    </Button>
  )
}

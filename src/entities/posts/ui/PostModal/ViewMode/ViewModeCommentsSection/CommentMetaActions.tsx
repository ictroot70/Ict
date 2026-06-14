'use client'

import React from 'react'

import { Button, Typography } from '@/shared/ui'

import s from '../ViewMode.module.scss'

interface CommentMetaActionsProps {
  timeAgo: string
  isAuthenticated: boolean
  onAnswer?: () => void
  showAnswerButton?: boolean
  likeCount?: number
}

export const CommentMetaActions: React.FC<CommentMetaActionsProps> = ({
  timeAgo,
  isAuthenticated,
  onAnswer,
  showAnswerButton = true,
  likeCount = 0,
}) => {
  return (
    <div className={s.commentMeta}>
      <Typography variant={'small_text'} className={s.commentTimestamp}>
        {timeAgo}
      </Typography>

      {likeCount > 0 && (
        <Typography variant={'small_text'} className={s.commentTimestamp}>
          Like: {likeCount}
        </Typography>
      )}

      {isAuthenticated && showAnswerButton && onAnswer && (
        <Button variant={'text'} className={s.replyButton} onClick={onAnswer}>
          Answer
        </Button>
      )}
    </div>
  )
}

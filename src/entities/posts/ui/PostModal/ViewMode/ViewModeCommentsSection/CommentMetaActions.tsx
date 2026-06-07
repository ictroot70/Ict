'use client'

import React from 'react'

import { Button, Typography } from '@/shared/ui'

import s from '../ViewMode.module.scss'

interface CommentMetaActionsProps {
  timeAgo: string
  isAuthenticated: boolean
  onAnswer?: () => void
  showAnswerButton?: boolean
}

export const CommentMetaActions: React.FC<CommentMetaActionsProps> = ({
  timeAgo,
  isAuthenticated,
  onAnswer,
  showAnswerButton = true,
}) => {
  return (
    <div className={s.commentMeta}>
      <Typography variant={'small_text'} className={s.commentTimestamp}>
        {timeAgo}
      </Typography>
      {isAuthenticated && showAnswerButton && onAnswer && (
        <Button variant={'text'} className={s.replyButton} onClick={onAnswer}>
          Answer
        </Button>
      )}
    </div>
  )
}

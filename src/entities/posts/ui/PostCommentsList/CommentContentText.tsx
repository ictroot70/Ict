'use client'

import React from 'react'

import { parseReplyMention } from '@/shared/types/comments'

import s from './PostCommentsList.module.scss'

interface CommentContentTextProps {
  content: string
}

export const CommentContentText: React.FC<CommentContentTextProps> = ({ content }) => {
  const { mention, text } = parseReplyMention(content)

  if (!mention) {
    return <>{content}</>
  }

  return (
    <>
      <span className={s.mention}>@{mention} </span>
      {text}
    </>
  )
}

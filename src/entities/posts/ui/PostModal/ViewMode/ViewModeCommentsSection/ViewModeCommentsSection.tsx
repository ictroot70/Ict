import type { CommentThreadItem } from '@/entities/posts/hooks/usePostModal'

import React from 'react'

import { Avatar } from '@/shared/composites'
import { Button, HeartOutline, Separator, Typography } from '@/shared/ui'

import s from '../ViewMode.module.scss'

interface CommentsSectionProps {
  postData: {
    avatar: string
    userName: string
    description: string
  }
  comments: CommentThreadItem[]
}

export const ViewModeCommentsSection: React.FC<CommentsSectionProps> = ({ postData, comments }) => {
  const formatCommentDate = (date: string) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))

  return (
    <>
      <Separator />
      <div className={s.comments}>
        <div className={s.comment}>
          <Avatar size={36} image={postData.avatar} />
          <div>
            <Typography variant={'regular_14'} color={'light'} className={s.description}>
              <strong>{postData.userName}</strong> {postData.description}
            </Typography>
            <Typography variant={'small_text'} className={s.commentTimestamp}>
              2 minutes ago
            </Typography>
          </div>
        </div>

        {comments.map(comment => (
          <div className={s.commentThread} key={comment.id}>
            <div className={s.comment}>
              <Avatar size={36} image={comment.avatar || ''} />
              <div className={s.commentContent}>
                <Typography variant={'regular_14'} color={'light'}>
                  <strong>{comment.userName}</strong> {comment.content}
                </Typography>
                <div className={s.commentMeta}>
                  <Typography variant={'small_text'} className={s.commentTimestamp}>
                    {formatCommentDate(comment.createdAt)}
                  </Typography>
                </div>
              </div>
              <Button variant={'text'} className={s.commentLikeButton}>
                <HeartOutline size={16} color={'white'} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

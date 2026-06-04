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
    createdAt: string
  }
  comments: CommentThreadItem[]
}

export const ViewModeCommentsSection: React.FC<CommentsSectionProps> = ({ postData, comments }) => {
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
          <div className={s.comment} key={comment.id}>
            <Avatar size={36} image={postData.avatar} />
            <div>
              <Typography variant={'regular_14'} color={'light'}>
                <strong>{comment.userName}</strong> {comment.content}
              </Typography>
              <Typography variant={'small_text'} className={s.commentTimestamp}>
                {comment.createdAt}
              </Typography>
            </div>
            <Button variant={'text'} className={s.commentLikeButton}>
              <HeartOutline size={16} color={'white'} />
            </Button>
          </div>
        ))}
      </div>
    </>
  )
}

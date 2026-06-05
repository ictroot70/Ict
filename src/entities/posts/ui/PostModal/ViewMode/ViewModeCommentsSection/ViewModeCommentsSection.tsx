import type { CommentThreadItem } from '@/entities/posts/hooks/usePostModal'

import React, { useState } from 'react'

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
  handleReplyPublish: (commentId: number | string, content: string) => void
  commentMaxLength: number
}

export const ViewModeCommentsSection: React.FC<CommentsSectionProps> = ({
  postData,
  comments,
  handleReplyPublish,
  commentMaxLength,
}) => {
  const [activeReplyCommentId, setActiveReplyCommentId] = useState<number | string | null>(null)
  const [replyText, setReplyText] = useState('')

  const trimmedReplyText = replyText.trim()
  const isReplyInvalid = trimmedReplyText.length === 0 || trimmedReplyText.length > commentMaxLength

  const handleAnswerClick = (commentId: number | string) => {
    setActiveReplyCommentId(prev => (prev === commentId ? null : commentId))
    setReplyText('')
  }

  const handleReplySubmit = (commentId: number | string) => {
    if (isReplyInvalid) {
      return
    }

    handleReplyPublish(commentId, trimmedReplyText)
    setReplyText('')
    setActiveReplyCommentId(null)
  }

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
              <Avatar size={36} image={comment.avatar ?? postData.avatar} />
              <div className={s.commentContent}>
                <Typography variant={'regular_14'} color={'light'}>
                  <strong>{comment.userName}</strong> {comment.content}
                </Typography>
                <div className={s.commentMeta}>
                  <Typography variant={'small_text'} className={s.commentTimestamp}>
                    {comment.createdAt}
                  </Typography>
                  <Button
                    variant={'text'}
                    className={s.answerButton}
                    onClick={() => handleAnswerClick(comment.id)}
                  >
                    Answer
                  </Button>
                </div>
              </div>
              <Button variant={'text'} className={s.commentLikeButton}>
                <HeartOutline size={16} color={'white'} />
              </Button>
            </div>

            {comment.answers.map(answer => (
              <div className={s.answer} key={answer.id}>
                <Avatar size={32} image={answer.avatar ?? postData.avatar} />
                <div>
                  <Typography variant={'regular_14'} color={'light'}>
                    <strong>{answer.userName}</strong> {answer.content}
                  </Typography>
                  <Typography variant={'small_text'} className={s.commentTimestamp}>
                    {answer.createdAt}
                  </Typography>
                </div>
              </div>
            ))}

            {activeReplyCommentId === comment.id && (
              <div className={s.replyForm}>
                <input
                  value={replyText}
                  onChange={event => setReplyText(event.target.value)}
                  maxLength={commentMaxLength}
                  placeholder={'Add answer'}
                  className={s.replyInput}
                />
                <Button
                  variant={'text'}
                  type={'button'}
                  disabled={isReplyInvalid}
                  onClick={() => handleReplySubmit(comment.id)}
                >
                  Publish
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

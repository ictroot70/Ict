'use client'

import React from 'react'

import { useTimeAgo } from '@/entities/users/hooks/useTimeAgo'
import { InfiniteScrollTrigger, Avatar } from '@/shared/composites'
import { CommentsViewModel } from '@/shared/types/comments'
import { Button, Separator, Typography } from '@/shared/ui'

import s from '../ViewMode.module.scss'

import { CommentItem } from './CommentItem'

interface CommentsSectionProps {
  postData: {
    avatar: string
    userName: string
    description: string
    createdAt: string
  }
  postId: number
  isAuthenticated: boolean
  comments: CommentsViewModel[]
  loadMore: () => void
  hasNextPage: boolean
  isLoading: boolean
  isFetchingNextPage: boolean
  isError: boolean
  totalCount: number
  expandedAnswersCommentId: number | null
  onAnswer: (target: { commentId: number; userName: string }) => void
}

export const ViewModeCommentsSection: React.FC<CommentsSectionProps> = ({
  postData,
  postId,
  isAuthenticated,
  comments,
  loadMore,
  hasNextPage,
  isLoading,
  isFetchingNextPage,
  isError,
  totalCount,
  expandedAnswersCommentId,
  onAnswer,
}) => {
  const descriptionTimeAgo = useTimeAgo(postData.createdAt)

  return (
    <>
      <Separator />
      <div className={s.comments}>
        <div className={s.comment}>
          <Avatar size={32} image={postData.avatar} alt={postData.userName} />
          <div className={s.commentBody}>
            <Typography variant={'regular_14'} color={'light'} className={s.description}>
              <strong>{postData.userName}</strong> {postData.description}
            </Typography>
            <Typography variant={'small_text'} className={s.commentTimestamp}>
              {descriptionTimeAgo}
            </Typography>
          </div>
        </div>

        {isLoading && (
          <Typography variant={'small_text'} className={s.commentTimestamp}>
            Loading comments...
          </Typography>
        )}

        {isError && (
          <Typography variant={'small_text'} className={s.commentTimestamp}>
            Failed to load comments
          </Typography>
        )}

        {!isLoading &&
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              postId={postId}
              comment={comment}
              isAuthenticated={isAuthenticated}
              shouldShowAnswers={expandedAnswersCommentId === comment.id}
              onAnswer={onAnswer}
            />
          ))}

        {hasNextPage && (
          <>
            <InfiniteScrollTrigger hasNextPage={hasNextPage} onLoadMore={loadMore} />
            {!isFetchingNextPage && totalCount > comments.length && (
              <Button variant={'text'} className={s.loadMoreButton} onClick={loadMore}>
                Load more comments
              </Button>
            )}
          </>
        )}
      </div>
    </>
  )
}

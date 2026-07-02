'use client'

import React from 'react'

import { useTimeAgo } from '@/entities/users/hooks/useTimeAgo'
import { InfiniteScrollTrigger, Avatar } from '@/shared/composites'
import { CommentsViewModel } from '@/shared/types/comments'
import { Button, Separator, Typography } from '@/shared/ui'

import s from '../ViewMode.module.scss'

import { CommentItem } from './CommentItem'

interface CommentsSectionProps {
  auth: {
    isAuthenticated: boolean
  }
  comments: {
    expandedAnswersCommentId: number | null
    handleStartReply: (target: { commentId: number; userName: string }) => void
    hasNextPage: boolean
    isError: boolean
    isFetchingNextPage: boolean
    isLoading: boolean
    items: CommentsViewModel[]
    loadMore: () => void
    totalCount: number
  }
  postData: {
    avatar: string
    userName: string
    description: string
    createdAt: string
  }
  postId: number
}

export const ViewModeCommentsSection: React.FC<CommentsSectionProps> = ({
  auth,
  comments,
  postData,
  postId,
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

        {comments.isLoading && (
          <Typography variant={'small_text'} className={s.commentTimestamp}>
            Loading comments...
          </Typography>
        )}

        {comments.isError && (
          <Typography variant={'small_text'} className={s.commentTimestamp}>
            Failed to load comments
          </Typography>
        )}

        {!comments.isLoading &&
          comments.items.map(comment => (
            <CommentItem
              key={comment.id}
              postId={postId}
              comment={comment}
              isAuthenticated={auth.isAuthenticated}
              shouldShowAnswers={comments.expandedAnswersCommentId === comment.id}
              onAnswer={comments.handleStartReply}
            />
          ))}

        {comments.hasNextPage && (
          <>
            <InfiniteScrollTrigger
              hasNextPage={comments.hasNextPage}
              onLoadMore={comments.loadMore}
            />
            {!comments.isFetchingNextPage && comments.totalCount > comments.items.length && (
              <Button variant={'text'} className={s.loadMoreButton} onClick={comments.loadMore}>
                Load more comments
              </Button>
            )}
          </>
        )}
      </div>
    </>
  )
}

'use client'

import type { CommentsViewModel } from '@/shared/types/comments'

import { forwardRef } from 'react'

import { CommentItem } from '@/entities/posts/ui/PostModal/ViewMode/ViewModeCommentsSection/CommentItem'
import { InfiniteScrollTrigger, LinearProgress } from '@/shared/composites'
import { Typography } from '@/shared/ui'

import s from './FeedPostCommentsPanel.module.scss'

type ReplyTarget = {
  commentId: number
  userName: string
}

type Props = {
  comments: CommentsViewModel[]
  expandedAnswersCommentId: number | null
  hasNextPage: boolean
  id: string
  isAuthenticated: boolean
  isError: boolean
  isFetchingNextPage: boolean
  isLoading: boolean
  loadMore: () => void
  onAnswer: (target: ReplyTarget) => void
  postId: number
}

export const FeedPostCommentsPanel = forwardRef<HTMLDivElement, Props>(
  (
    {
      comments,
      expandedAnswersCommentId,
      hasNextPage,
      id,
      isAuthenticated,
      isError,
      isFetchingNextPage,
      isLoading,
      loadMore,
      onAnswer,
      postId,
    },
    ref
  ) => (
    <div ref={ref} id={id} className={s.commentsPanel} aria-label={'Post comments'}>
      <LinearProgress active={isFetchingNextPage} />

      {isLoading && (
        <Typography variant={'small_text'} className={s.commentsState}>
          Loading comments...
        </Typography>
      )}

      {isError && (
        <Typography variant={'small_text'} className={s.commentsState}>
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

      <InfiniteScrollTrigger hasNextPage={hasNextPage} onLoadMore={loadMore} />
    </div>
  )
)

FeedPostCommentsPanel.displayName = 'FeedPostCommentsPanel'

'use client'

import type { CommentsViewModel } from '@/shared/types/comments'

import { forwardRef } from 'react'

import { PostCommentsList } from '@/entities/posts/ui/PostCommentsList'
import { LinearProgress } from '@/shared/composites'

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

      <PostCommentsList
        comments={comments}
        expandedAnswersCommentId={expandedAnswersCommentId}
        hasNextPage={hasNextPage}
        isAuthenticated={isAuthenticated}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
        loadMore={loadMore}
        onAnswer={onAnswer}
        postId={postId}
      />
    </div>
  )
)

FeedPostCommentsPanel.displayName = 'FeedPostCommentsPanel'

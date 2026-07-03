'use client'

import type { CommentsViewModel } from '@/shared/types/comments'

import { InfiniteScrollTrigger } from '@/shared/composites'
import { Button, Typography } from '@/shared/ui'

import s from './PostCommentsList.module.scss'

import { CommentItem } from './CommentItem'

type ReplyTarget = {
  commentId: number
  userName: string
}

type Props = {
  comments: CommentsViewModel[]
  expandedAnswersCommentId: number | null
  hasNextPage: boolean
  isAuthenticated: boolean
  isError: boolean
  isFetchingNextPage: boolean
  isLoading: boolean
  loadMore: () => void
  onAnswer: (target: ReplyTarget) => void
  postId: number
  showLoadMoreButton?: boolean
  totalCount?: number
}

export function PostCommentsList({
  comments,
  expandedAnswersCommentId,
  hasNextPage,
  isAuthenticated,
  isError,
  isFetchingNextPage,
  isLoading,
  loadMore,
  onAnswer,
  postId,
  showLoadMoreButton = false,
  totalCount = 0,
}: Props) {
  return (
    <div className={s.commentsList}>
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

      {hasNextPage && (
        <>
          <InfiniteScrollTrigger hasNextPage={hasNextPage} onLoadMore={loadMore} />
          {showLoadMoreButton && !isFetchingNextPage && totalCount > comments.length && (
            <Button variant={'text'} className={s.loadMoreButton} onClick={loadMore}>
              Load more comments
            </Button>
          )}
        </>
      )}
    </div>
  )
}

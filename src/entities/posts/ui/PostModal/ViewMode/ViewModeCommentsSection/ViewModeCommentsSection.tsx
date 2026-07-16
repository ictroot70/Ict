'use client'

import React from 'react'

import { usePostComments } from '@/entities/posts/hooks'
import { useTimeAgo } from '@/entities/users/hooks/useTimeAgo'
import { InfiniteScrollTrigger, Avatar, Skeleton } from '@/shared/composites'
import { Button, Separator, Typography } from '@/shared/ui'

import s from '../ViewMode.module.scss'

import { CommentItem } from './CommentItem'

const COMMENTS_SKELETON_ROWS = [
  {
    textClassName: s.commentSkeletonTextLong,
    metaClassName: s.commentSkeletonMetaLong,
  },
  {
    textClassName: s.commentSkeletonTextMedium,
    metaClassName: s.commentSkeletonMetaMedium,
  },
  {
    textClassName: s.commentSkeletonTextShort,
    metaClassName: s.commentSkeletonMetaShort,
  },
]

const CommentsSkeleton = () => (
  <div className={s.commentsSkeleton} aria-label={'Loading comments'}>
    {COMMENTS_SKELETON_ROWS.map(({ textClassName, metaClassName }, index) => (
      <div className={s.comment} key={index}>
        <Skeleton className={s.commentSkeletonAvatar} />
        <div className={s.commentBody}>
          <Skeleton className={`${s.commentSkeletonText} ${textClassName}`} />
          <Skeleton className={`${s.commentSkeletonMeta} ${metaClassName}`} />
        </div>
        <Skeleton className={s.commentSkeletonLikeButton} />
      </div>
    ))}
  </div>
)

interface CommentsSectionProps {
  postData: {
    avatar: string
    userName: string
    description: string
    createdAt: string
  }
  postId: number
  isAuthenticated: boolean
  currentUserName?: string
  currentUserAvatar?: string
  enabled: boolean
}

export const ViewModeCommentsSection: React.FC<CommentsSectionProps> = ({
  postData,
  postId,
  isAuthenticated,
  currentUserName,
  currentUserAvatar,
  enabled,
}) => {
  const descriptionTimeAgo = useTimeAgo(postData.createdAt)
  const { comments, loadMore, hasNextPage, isLoading, isFetchingNextPage, isError, totalCount } =
    usePostComments({ postId, enabled })

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

        {isLoading && <CommentsSkeleton />}

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
              currentUserName={currentUserName}
              currentUserAvatar={currentUserAvatar}
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

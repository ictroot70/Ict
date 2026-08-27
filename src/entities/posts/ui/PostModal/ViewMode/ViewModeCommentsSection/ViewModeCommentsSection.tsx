'use client'

import React from 'react'

import { PostCommentsList } from '@/entities/posts/ui/PostCommentsList'
import { useTimeAgo } from '@/entities/users/hooks/useTimeAgo'
import { Avatar } from '@/shared/composites'
import { CommentsViewModel } from '@/shared/types/comments'
import { Separator, Typography } from '@/shared/ui'

import s from '../ViewMode.module.scss'

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

        <PostCommentsList
          comments={comments.items}
          expandedAnswersCommentId={comments.expandedAnswersCommentId}
          hasNextPage={comments.hasNextPage}
          isAuthenticated={auth.isAuthenticated}
          isError={comments.isError}
          isFetchingNextPage={comments.isFetchingNextPage}
          isLoading={comments.isLoading}
          loadMore={comments.loadMore}
          onAnswer={comments.handleStartReply}
          postId={postId}
          showLoadMoreButton
          totalCount={comments.totalCount}
        />
      </div>
    </>
  )
}

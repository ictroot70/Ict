'use client'

import type { PostViewModel } from '@/entities/posts/api'

import { Control, UseFormHandleSubmit, UseFormWatch } from 'react-hook-form'

import { CommentFormData, PostVariant } from '@/shared/types'
import { CommentsViewModel } from '@/shared/types/comments'
import { Separator } from '@/shared/ui'

import s from './ViewMode.module.scss'

import { RenderPostLikeAction } from '../postModalLikeAction.types'
import { ViewModeCommentsSection } from './ViewModeCommentsSection/ViewModeCommentsSection'
import { ViewModePhotoSection } from './ViewModePhotoSection/ViewModePhotoSection'
import { ViewModePostFooter } from './ViewModePostFooter/ViewModePostFooter'
import { ViewModePostHeader } from './ViewModePostHeader/ViewModePostHeader'

interface ViewModeProps {
  postData: PostViewModel
  variant: PostVariant
  handleEditPost: () => void
  handleDeletePost: () => void
  onCopyLink: () => void
  onFollow: () => void
  isFollowing: boolean
  isFollowPending: boolean
  commentControl: Control<CommentFormData>
  handleCommentSubmit: UseFormHandleSubmit<CommentFormData>
  watchComment: UseFormWatch<CommentFormData>
  handlePublish: (data: CommentFormData) => Promise<boolean>
  formattedCreatedAt: string
  isAuthLoading: boolean
  isCreateCommentLoading: boolean
  isReplyPublishing: boolean
  isAuthenticated: boolean
  comments: CommentsViewModel[]
  commentsTotalCount: number
  loadMoreComments: () => void
  hasNextCommentsPage: boolean
  isFetchingNextCommentsPage: boolean
  isCommentsLoading: boolean
  isCommentsError: boolean
  expandedAnswersCommentId: number | null
  commentMaxLength: number
  handleStartReply: (target: { commentId: number; userName: string }) => void
  renderPostLikeAction?: RenderPostLikeAction
}

export const ViewMode = ({
  postData,
  variant,
  handleEditPost,
  handleDeletePost,
  onCopyLink,
  onFollow,
  isFollowing,
  isFollowPending,
  commentControl,
  handleCommentSubmit,
  watchComment,
  handlePublish,
  formattedCreatedAt,
  isAuthLoading,
  isCreateCommentLoading,
  isReplyPublishing,
  isAuthenticated,
  comments,
  commentsTotalCount,
  loadMoreComments,
  hasNextCommentsPage,
  isFetchingNextCommentsPage,
  isCommentsLoading,
  isCommentsError,
  expandedAnswersCommentId,
  commentMaxLength,
  handleStartReply,
  renderPostLikeAction,
}: ViewModeProps) => {
  const postDataForChildren = {
    avatar: postData.avatarOwner,
    userName: postData.userName,
    description: postData.description ?? '',
    createdAt: postData.createdAt,
  }

  return (
    <div className={s.viewMode} onClick={e => e.stopPropagation()}>
      <ViewModePhotoSection postData={postData} />

      <div className={s.postSideBar}>
        <ViewModePostHeader
          postData={postDataForChildren}
          variant={variant}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
          onFollow={onFollow}
          isFollowing={isFollowing}
          isFollowPending={isFollowPending}
          onCopyLink={onCopyLink}
          isAuthLoading={isAuthLoading}
        />

        <ViewModeCommentsSection
          postData={postDataForChildren}
          postId={postData.id}
          isAuthenticated={isAuthenticated}
          comments={comments}
          loadMore={loadMoreComments}
          hasNextPage={hasNextCommentsPage}
          isLoading={isCommentsLoading}
          isFetchingNextPage={isFetchingNextCommentsPage}
          isError={isCommentsError}
          totalCount={commentsTotalCount}
          expandedAnswersCommentId={expandedAnswersCommentId}
          onAnswer={handleStartReply}
        />

        <Separator />

        <ViewModePostFooter
          variant={variant}
          postId={postData.id}
          ownerId={postData.ownerId}
          isLiked={postData.isLiked}
          likesCount={postData.likesCount}
          avatarWhoLikes={postData.avatarWhoLikes}
          renderPostLikeAction={renderPostLikeAction}
          formattedCreatedAt={formattedCreatedAt}
          commentControl={commentControl}
          handleCommentSubmit={handleCommentSubmit}
          watchComment={watchComment}
          handlePublish={handlePublish}
          isAuthLoading={isAuthLoading}
          isCreateCommentLoading={isCreateCommentLoading}
          isReplyPublishing={isReplyPublishing}
          commentMaxLength={commentMaxLength}
        />
      </div>
    </div>
  )
}

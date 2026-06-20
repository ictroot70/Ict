'use client'

import type { PostViewModel } from '@/entities/posts/api'

import { Control, UseFormHandleSubmit, UseFormWatch } from 'react-hook-form'

import { CommentFormData, PostVariant } from '@/shared/types'
import { Separator } from '@/shared/ui'

import s from './ViewMode.module.scss'

import { RenderPostLikeAction } from '../postModalLikeAction.types'
import { ViewModeCommentsSection } from './ViewModeCommentsSection/ViewModeCommentsSection'
import { ViewModePhotoSection } from './ViewModePhotoSection/ViewModePhotoSection'
import { ViewModePostFooter } from './ViewModePostFooter/ViewModePostFooter'
import { ViewModePostHeader } from './ViewModePostHeader/ViewModePostHeader'

interface ViewModeProps {
  onClose: () => void
  postData: PostViewModel
  variant: PostVariant
  handleEditPost: () => void
  handleDeletePost: () => void
  onCopyLink: () => void
  isEditing?: boolean
  comments?: string[]
  commentControl: Control<CommentFormData>
  handleCommentSubmit: UseFormHandleSubmit<CommentFormData>
  watchComment: UseFormWatch<CommentFormData>
  handlePublish: (data: CommentFormData) => void
  formattedCreatedAt: string
  isAuthLoading: boolean
  isAuthenticated: boolean
  isOwnProfile?: boolean
  commentsEnabled?: boolean
  currentUserId?: number
  currentUserName?: string
  currentUserAvatar?: string
  renderPostLikeAction?: RenderPostLikeAction
}

export const ViewMode = ({
  postData,
  variant,
  handleEditPost,
  handleDeletePost,
  onCopyLink,
  commentControl,
  handleCommentSubmit,
  watchComment,
  handlePublish,
  formattedCreatedAt,
  isAuthLoading,
  isAuthenticated,
  commentsEnabled = true,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  renderPostLikeAction,
}: ViewModeProps) => {
  const handleFollow = () => {}

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
          onFollow={handleFollow}
          onCopyLink={onCopyLink}
          isAuthLoading={isAuthLoading}
        />

        <ViewModeCommentsSection
          postData={postDataForChildren}
          postId={postData.id}
          isAuthenticated={isAuthenticated}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserAvatar={currentUserAvatar}
          enabled={commentsEnabled}
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
        />
      </div>
    </div>
  )
}

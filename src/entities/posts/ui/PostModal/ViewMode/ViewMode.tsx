import { Control, UseFormHandleSubmit, UseFormWatch } from 'react-hook-form'

import { CommentFormData, PostModalData, PostVariant } from '@/shared/types'
import { Separator } from '@/shared/ui'

import s from './ViewMode.module.scss'

import { ViewModeCommentsSection } from './ViewModeCommentsSection/ViewModeCommentsSection'
import { ViewModePhotoSection } from './ViewModePhotoSection/ViewModePhotoSection'
import { ViewModePostFooter } from './ViewModePostFooter/ViewModePostFooter'
import { ViewModePostHeader } from './ViewModePostHeader/ViewModePostHeader'

interface ViewModeProps {
  onClose: () => void
  postData: PostModalData
  postId: number
  variant: PostVariant
  handleEditPost: () => void
  handleDeletePost: () => void
  onCopyLink: () => void
  isEditing?: boolean
  commentControl: Control<CommentFormData>
  handleCommentSubmit: UseFormHandleSubmit<CommentFormData>
  watchComment: UseFormWatch<CommentFormData>
  handlePublish: (data: CommentFormData) => void
  formattedCreatedAt: string
  isAuthLoading: boolean
  isAuthenticated: boolean
  isOwnProfile: boolean
  currentUserId?: number
  isPublishingComment: boolean
  commentMaxLength: number
  commentsEnabled: boolean
  isPostLikeLoading: boolean
  onTogglePostLike: () => void
}

export const ViewMode = ({
  postData,
  postId,
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
  currentUserId,
  isPublishingComment,
  commentMaxLength,
  commentsEnabled,
  isPostLikeLoading,
  onTogglePostLike,
}: ViewModeProps) => {
  const handleFollow = () => {
    console.log('handleFollow')
  }

  return (
    <div className={s.viewMode} onClick={e => e.stopPropagation()}>
      <ViewModePhotoSection postData={postData} />

      <div className={s.postSideBar}>
        <ViewModePostHeader
          postData={postData}
          variant={variant}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
          onFollow={handleFollow}
          onCopyLink={onCopyLink}
          isAuthLoading={isAuthLoading}
        />

        <ViewModeCommentsSection
          postData={postData}
          postId={postId}
          isAuthenticated={isAuthenticated}
          currentUserId={currentUserId}
          enabled={commentsEnabled}
        />

        <Separator />

        <ViewModePostFooter
          variant={variant}
          postData={postData}
          formattedCreatedAt={formattedCreatedAt}
          commentControl={commentControl}
          handleCommentSubmit={handleCommentSubmit}
          watchComment={watchComment}
          handlePublish={handlePublish}
          isAuthLoading={isAuthLoading}
          isPublishingComment={isPublishingComment}
          isPostLikeLoading={isPostLikeLoading}
          commentMaxLength={commentMaxLength}
          onTogglePostLike={onTogglePostLike}
        />
      </div>
    </div>
  )
}

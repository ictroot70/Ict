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
  variant: PostVariant
  handleEditPost: () => void
  handleDeletePost: () => void
  onCopyLink: () => void
  onFollow: () => void
  isFollowing: boolean
  isFollowPending: boolean
  isEditing?: boolean
  comments: string[]
  commentControl: Control<CommentFormData>
  handleCommentSubmit: UseFormHandleSubmit<CommentFormData>
  watchComment: UseFormWatch<CommentFormData>
  handlePublish: (data: CommentFormData) => void
  formattedCreatedAt: string
  isAuthLoading: boolean
  isAuthenticated: boolean
  isOwnProfile: boolean
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
  comments,
  commentControl,
  handleCommentSubmit,
  watchComment,
  handlePublish,
  formattedCreatedAt,
  isAuthLoading,
}: ViewModeProps) => {
  return (
    <div className={s.viewMode} onClick={e => e.stopPropagation()}>
      <ViewModePhotoSection postData={postData} />

      <div className={s.postSideBar}>
        <ViewModePostHeader
          postData={postData}
          variant={variant}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
          onFollow={onFollow}
          isFollowing={isFollowing}
          isFollowPending={isFollowPending}
          onCopyLink={onCopyLink}
          isAuthLoading={isAuthLoading}
        />

        <ViewModeCommentsSection postData={postData} comments={comments} />

        <Separator />

        <ViewModePostFooter
          variant={variant}
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

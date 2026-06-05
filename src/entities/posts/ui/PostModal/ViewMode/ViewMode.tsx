import type { CommentThreadItem } from '@/entities/posts/hooks/usePostModal'

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
  isEditing?: boolean
  comments: CommentThreadItem[]
  commentControl: Control<CommentFormData>
  handleCommentSubmit: UseFormHandleSubmit<CommentFormData>
  watchComment: UseFormWatch<CommentFormData>
  handlePublish: (data: CommentFormData) => void
  formattedCreatedAt: string
  isAuthLoading: boolean
  isCreateCommentLoading: boolean
  isAuthenticated: boolean
  isOwnProfile: boolean
  commentMaxLength: number
  handleReplyPublish: (commentId: number | string, content: string) => void
}

export const ViewMode = ({
  postData,
  variant,
  handleEditPost,
  handleDeletePost,
  onCopyLink,
  comments,
  commentControl,
  handleCommentSubmit,
  watchComment,
  handlePublish,
  formattedCreatedAt,
  isAuthLoading,
  isCreateCommentLoading,
  commentMaxLength,
  handleReplyPublish,
}: ViewModeProps) => {
  const handleFollow = () => {}

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
          comments={comments}
          handleReplyPublish={handleReplyPublish}
          commentMaxLength={commentMaxLength}
        />

        <Separator />

        <ViewModePostFooter
          variant={variant}
          formattedCreatedAt={formattedCreatedAt}
          commentControl={commentControl}
          handleCommentSubmit={handleCommentSubmit}
          watchComment={watchComment}
          handlePublish={handlePublish}
          isAuthLoading={isAuthLoading}
          isCreateCommentLoading={isCreateCommentLoading}
          commentMaxLength={commentMaxLength}
        />
      </div>
    </div>
  )
}

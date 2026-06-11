import type { CommentThreadItem } from '@/entities/posts/hooks/usePostModal'

import { Control, UseFormHandleSubmit, UseFormWatch } from 'react-hook-form'

import { CommentFormData, PostVariant, PostViewModel } from '@/shared/types'
import { Separator } from '@/shared/ui'

import s from './ViewMode.module.scss'

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
}: ViewModeProps) => {
  const handleFollow = () => {}

  // ViewModePostHeader и ViewModeCommentsSection используют поле avatar,
  // в PostViewModel оно называется avatarOwner
  const postDataForChildren = {
    avatar: postData.avatarOwner,
    userName: postData.userName,
    description: postData.description ?? '',
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

        <ViewModeCommentsSection postData={postDataForChildren} comments={comments} />

        <Separator />

        <ViewModePostFooter
          variant={variant}
          postId={postData.id}
          ownerId={postData.ownerId}
          isLiked={postData.isLiked}
          likesCount={postData.likesCount}
          avatarWhoLikes={postData.avatarWhoLikes}
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

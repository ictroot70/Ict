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
  isEditing?: boolean
  comments: string[]
  commentControl: any
  handleCommentSubmit: any
  watchComment: (field: string) => string
  handlePublish: (data: CommentFormData) => void
  formattedCreatedAt: string
  isAuthenticated: boolean
  isOwnProfile: boolean
}

export const ViewMode = ({
  postData,
  variant,
  handleEditPost,
  handleDeletePost,
  comments,
  commentControl,
  handleCommentSubmit,
  watchComment,
  handlePublish,
  formattedCreatedAt,
}: ViewModeProps) => {
  const handleFollow = () => {}

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
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
          onCopyLink={handleCopyLink}
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
        />
      </div>
    </div>
  )
}

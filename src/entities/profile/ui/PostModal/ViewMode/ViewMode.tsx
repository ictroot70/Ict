import { Separator } from '@ictroot/ui-kit'
import { CommentFormData, PostModalData, PostVariant } from '@/shared/types'
import s from './ViewMode.module.scss'
import { ViewModePhotoSection } from './ViewModePhotoSection/ViewModePhotoSection'
import { ViewModePostHeader } from './ViewModePostHeader/ViewModePostHeader'
import { ViewModeCommentsSection } from './ViewModeCommentsSection/ViewModeCommentsSection'
import { ViewModePostFooter } from './ViewModePostFooter/ViewModePostFooter'


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
  onClose,
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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleFollow = () => console.log('Follow functionality')

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      console.log('Link copied to clipboard')
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  return (
    <div className={s.modalOverlay} onClick={handleOverlayClick}>
      <div className={s.viewMode} onClick={(e) => e.stopPropagation()}>
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

          <ViewModeCommentsSection
            postData={postData}
            comments={comments}
          />

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
    </div>
  )
}
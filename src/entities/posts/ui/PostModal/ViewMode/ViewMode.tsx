import { PostModalData, PostVariant } from '@/shared/types'

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
  formattedCreatedAt: string
  isAuthLoading: boolean
  isAuthenticated: boolean
  isOwnProfile: boolean
  commentsEnabled: boolean
}

export const ViewMode = ({
  postData,
  postId,
  variant,
  handleEditPost,
  handleDeletePost,
  onCopyLink,
  formattedCreatedAt,
  isAuthLoading,
  isAuthenticated,
  isOwnProfile,
  commentsEnabled,
}: ViewModeProps) => {
  const handleFollow = () => { }

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
          enabled={commentsEnabled}
        />

        <ViewModePostFooter
          variant={variant}
          postData={postData}
          formattedCreatedAt={formattedCreatedAt}
          isAuthLoading={isAuthLoading}
        />
      </div>
    </div>
  )
}

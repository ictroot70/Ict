
'use client'

import s from './Profile.module.scss'
import { Typography } from '@/shared/ui'
import { Avatar } from '@/shared/composites'
import { ProfileActions } from './ProfileActions/ProfileActions'
import { ProfileType } from '../../api'
import { useProfileData } from '../../hooks/useProfileData'
import { PostViewModel } from '@/entities/posts/api'
import { ProfilePosts } from './ProfilePosts/ProfilePosts'
import { DeletePostModal } from '../DeletePostModal'
import { useDeletePostLogic } from './hooks/useDeletePostLogic'
import { useEditPostLogic } from './hooks/useEditPostLogic'
import { useState } from 'react'

interface Props {
  profile: ProfileType
  posts?: PostViewModel[]
  isOwnProfile?: boolean
  isAuthenticated?: boolean
  onFollow?: () => void
  onMessage?: () => void
  onRefetchPosts?: () => void
}

export const Profile: React.FC<Props> = ({
  profile,
  posts,
  isOwnProfile = false,
  isAuthenticated = false,
  onFollow,
  onMessage,
  onRefetchPosts,
}) => {
  const { userName, aboutMe, avatars, followers, following, publications, isFollowing } =
    useProfileData(profile)

  const [deletingFromModal, setDeletingFromModal] = useState(false)

  const { isDeleteModalOpen, selectedPostId, isDeleting, handleDeletePost, handleConfirmDelete, handleCancelDelete } =
    useDeletePostLogic(profile.id, onRefetchPosts)

  const { editingPostId, handleEditPost } = useEditPostLogic(profile.id, onRefetchPosts)

  const statsData = [
    { label: 'Following', value: following },
    { label: 'Followers', value: followers },
    { label: 'Publications', value: publications },
  ]

  const modalVariant: 'public' | 'myPost' | 'userPost' = !isAuthenticated
    ? 'public'
    : isOwnProfile
      ? 'myPost'
      : 'userPost'

  const handleDeleteFromModal = (postId: string) => {
    console.log(`Profile: удаление из модалки, пост ${postId}`)
    setDeletingFromModal(true)
    handleDeletePost(postId)
  }

  const handleConfirmDeleteWrapper = () => {
    console.log('Profile: подтверждение удаления')
    handleConfirmDelete()
    if (deletingFromModal) {
      setDeletingFromModal(false)
    }
  }

  const handleCancelDeleteWrapper = () => {
    console.log('Profile: отмена удаления')
    handleCancelDelete()
    setDeletingFromModal(false)
  }

  return (
    <>
      <div className={s.profile}>
        <div className={s.profileDetails}>
          <Avatar size={204} image={avatars[0]?.url} />
          <div className={s.profileInfo}>
            <div className={s.profileInfoHeader}>
              <Typography variant="h1">{userName}</Typography>
              <ProfileActions
                isAuthenticated={isAuthenticated}
                isOwnProfile={isOwnProfile}
                onFollow={onFollow}
                onMessage={onMessage}
                isFollowing={isFollowing}
              />
            </div>
            <ul className={s.profileStats}>
              {statsData.map(({ label, value }, index) => (
                <li key={index} className={s.profileStatsItem}>
                  <Typography variant="bold_14">{value}</Typography>
                  <Typography variant="regular_14">{label}</Typography>
                </li>
              ))}
            </ul>
            <Typography variant="regular_16" className={s.profileAbout}>
              {aboutMe || 'No information has been added yet.'}
            </Typography>
          </div>
        </div>

        <div className={s.profileSectionPosts}>
          <ProfilePosts
            posts={posts}
            isOwnProfile={isOwnProfile}
            modalVariant={modalVariant}
            onEditPost={isOwnProfile ? handleEditPost : undefined}
            onDeletePost={isOwnProfile ? handleDeleteFromModal : undefined}
            isEditing={editingPostId}
            profileId={profile.id}
          />
        </div>
      </div>

      <DeletePostModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDeleteWrapper}
        onConfirm={handleConfirmDeleteWrapper}
        isLoading={isDeleting}
      />
    </>
  )
}
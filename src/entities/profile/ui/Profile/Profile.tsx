'use client'
import React from 'react'

import { Avatar } from '@/shared/composites'
import { PostViewModel } from '@/shared/types'
import { Typography } from '@/shared/ui'

import s from './Profile.module.scss'

import { ProfileType } from '../../api'
import { useProfileData } from '../../hooks/useProfileData'
import { DeletePostModal } from '../DeletePostModal'
import { ProfileActions } from './ProfileActions/ProfileActions'
import { ProfilePosts } from './ProfilePosts/ProfilePosts'
import { useDeletePostLogic } from './hooks/useDeletePostLogic'
import { useEditPostLogic } from './hooks/useEditPostLogic'

interface ProfileProps {
  profile: ProfileType
  posts?: PostViewModel[]
  isOwnProfile?: boolean
  isAuthenticated?: boolean
  onFollow?: () => void
  onMessage?: () => void
  onRefetchPosts?: () => void
}

export const Profile: React.FC<ProfileProps> = ({
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

  const {
    isDeleteModalOpen,
    selectedPostId,
    isDeleting,
    handleDeletePost,
    handleConfirmDelete,
    handleCancelDelete,
  } = useDeletePostLogic(profile.id, onRefetchPosts)

  const { editingPostId, handleEditPost } = useEditPostLogic(profile.id, onRefetchPosts)

  const stats = [
    { label: 'Following', value: following },
    { label: 'Followers', value: followers },
    { label: 'Publications', value: publications },
  ]

  let modalVariant: 'public' | 'myPost' | 'userPost'

  if (!isAuthenticated) {
    modalVariant = 'public'
  } else if (isOwnProfile) {
    modalVariant = 'myPost'
  } else {
    modalVariant = 'userPost'
  }

  return (
    <>
      <div className={s.profile}>
        <div className={s.profile__details}>
          <Avatar size={204} image={avatars[0]?.url} />
          <div className={s.profile__info}>
            <div className={s.profile__header}>
              <Typography variant={'h1'}>{userName}</Typography>
              <ProfileActions
                isAuthenticated={isAuthenticated}
                isOwnProfile={isOwnProfile}
                onFollow={onFollow}
                onMessage={onMessage}
                isFollowing={isFollowing}
              />
            </div>
            <ul className={s.profile__stats}>
              {stats.map(({ label, value }) => (
                <li key={label} className={s.profile__statsItem}>
                  <Typography variant={'bold_14'}>{value}</Typography>
                  <Typography variant={'regular_14'}>{label}</Typography>
                </li>
              ))}
            </ul>
            <Typography variant={'regular_16'} className={s.profile__about}>
              {aboutMe || 'No information has been added yet.'}
            </Typography>
          </div>
        </div>

        <div className={s.profile__section}>
          <ProfilePosts
            posts={posts}
            isOwnProfile={isOwnProfile}
            modalVariant={modalVariant}
            onEditPost={isOwnProfile ? handleEditPost : undefined}
            onDeletePost={isOwnProfile ? handleDeletePost : undefined}
            isEditing={editingPostId}
            profileId={profile.id}
          />
        </div>
      </div>

      <DeletePostModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  )
}

'use client'
import React from 'react'

import { PostViewModel, PublicProfileResponse } from '@/shared/types'

import { Avatar } from '@/shared/composites'
import { Typography } from '@/shared/ui'

import s from './Profile.module.scss'

import { ProfileActions } from './ProfileActions/ProfileActions'
import { ProfilePosts } from './ProfilePosts/ProfilePosts'
import { ProfileBio } from './ProfileBio/ProfileBio'
import { ProfileStats } from './ProfileStats/ProfileStats'

import { DeletePostModal } from '../DeletePostModal'
import { useDeletePostLogic } from './hooks/useDeletePostLogic'
import { useEditPostLogic } from './hooks/useEditPostLogic'


interface ProfileProps {
  profile: PublicProfileResponse
  posts?: PostViewModel[]
  isOwnProfile?: boolean
}

export const Profile: React.FC<ProfileProps> = ({
  profile,
  posts,
  isOwnProfile = false,
}) => {
  const { userName, aboutMe, avatars, isFollowing, userMetadata } = profile

  const {
    isDeleteModalOpen,
    isDeleting,
    handleConfirmDelete,
    handleCancelDelete,
    handleDeletePost
  } = useDeletePostLogic(profile.id)

  const { editingPostId, handleEditPost } = useEditPostLogic(profile.id)



  return (
    <>
      <div className={s.profile}>
        <div className={s.profile__details}>
          <Avatar size={204} image={avatars[0]?.url} />
          <div className={s.profile__info}>
            <div className={s.profile__header}>
              <Typography variant={'h1'}>{userName}</Typography>
              <ProfileActions
                isOwnProfile={isOwnProfile}
                isFollowing={isFollowing}
              />
            </div>
            <ProfileStats stats={userMetadata} />
            <ProfileBio aboutMe={aboutMe} />


          </div>
        </div>

        <div className={s.profile__section}>
          <ProfilePosts
            posts={posts}
            isOwnProfile={isOwnProfile}
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

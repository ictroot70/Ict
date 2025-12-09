'use client'
import React from 'react'

import s from './Profile.module.scss'

import { useAuth } from '@/features/posts/utils/useAuth'
import { useProfileData } from '../../hooks/useProfileData'

import { Typography } from '@/shared/ui'
import { Avatar, Loading } from '@/shared/composites'

import { ProfileActions } from './ProfileActions/ProfileActions'
import { ProfilePosts } from './ProfilePosts/ProfilePosts'
import { ProfileBio } from './ProfileBio/ProfileBio'
import { ProfileStats } from './ProfileStats/ProfileStats'


export const Profile = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { profile, posts, isLoading: isProfileDataLoading } = useProfileData()

  const isLoading = isAuthLoading || isProfileDataLoading

  if (isLoading) {
    return <Loading />
  }

  if (!profile) {
    return <div>User not found</div>
  }

  const { id, userName, avatars, userMetadata, isFollowing, aboutMe } = profile
  const isOwnProfile = id === user?.userId

  return (
    <>
      <div className={s.profile}>
        <div className={s.profile__details}>
          <Avatar size={204} image={avatars[0]?.url} />
          <div className={s.profile__info}>
            <div className={s.profile__header}>
              <Typography variant={'h1'}>{userName}</Typography>
              {isAuthenticated && <ProfileActions
                isOwnProfile={isOwnProfile}
                isFollowing={isFollowing}
              />}
            </div>
            <ProfileStats stats={userMetadata} />
            <ProfileBio aboutMe={aboutMe} />
          </div>
        </div>

        <div className={s.profile__section}>
          <ProfilePosts
            posts={posts}
            isOwnProfile={isOwnProfile}
          />
        </div>
      </div>
    </>
  )
}

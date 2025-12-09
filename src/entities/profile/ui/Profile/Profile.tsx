'use client'
import React from 'react'

import s from './Profile.module.scss'

import { useAuth } from '@/features/posts/utils/useAuth'
import { Typography } from '@/shared/ui'
import { Avatar, Loading } from '@/shared/composites'
import { ProfileActions, ProfilePosts, ProfileBio, ProfileStats, useProfileData } from '@/entities/profile'


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
        <div className={s.details}>
          <Avatar size={204} image={avatars[0]?.url} />
          <div className={s.info}>
            <div className={s.header}>
              <Typography variant={'h1'}>{userName}</Typography>
              {isAuthenticated && <ProfileActions
                isOwnProfile={isOwnProfile}
                isFollowing={isFollowing}
              />}
            </div>
            <ProfileStats stats={userMetadata} />
            <ProfileBio message={aboutMe} />
          </div>
        </div>

        <div className={s.section}>
          <ProfilePosts
            posts={posts}
            isOwnProfile={isOwnProfile}
          />
        </div>
      </div>
    </>
  )
}

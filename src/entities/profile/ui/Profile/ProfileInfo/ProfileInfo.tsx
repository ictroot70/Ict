'use client'
import s from './ProfileInfo.module.scss'

import { Avatar } from '@/shared/composites'
import { Typography } from '@/shared/ui'
import { APP_ROUTES } from '@/shared/constant'

import { useRouter } from 'next/navigation'
import { type PublicProfileData } from '@/entities/profile/api'
import { ProfileActions } from '../ProfileActions'
import { ProfileStats } from '../ProfileStats'
import { ProfileBio } from '../ProfileBio'

type Props = {
  profile: PublicProfileData
  isAuth: boolean
  isOwnProfile: boolean
}

export function ProfileInfo({ profile, isAuth, isOwnProfile }: Props) {
  const router = useRouter()
  const { id, userName, avatars, userMetadata, isFollowing, aboutMe } = profile

  const handleFollow = () => {}
  const handleUnfollow = () => {}
  const handleEditProfile = () => {
    router.push(`${APP_ROUTES.PROFILE.EDIT}`)
  }
  const handleSendMessage = () => {
    if (!id) return
    router.push(`${APP_ROUTES.MESSENGER.DIALOGUE(id)}`)
  }

  return (
    <div className={s.info}>
      <Avatar size={204} image={avatars[0]?.url} />
      <div className={s.details}>
        <div className={s.header}>
          <Typography variant={'h1'}>{userName}</Typography>
          {isAuth && (
            <ProfileActions
              isFollowing={isFollowing}
              isOwnProfile={isOwnProfile}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
              onEditProfile={handleEditProfile}
              onSendMessage={handleSendMessage}
            />
          )}
        </div>
        <ProfileStats stats={userMetadata} />
        <ProfileBio message={aboutMe} />
      </div>
    </div>
  )
}

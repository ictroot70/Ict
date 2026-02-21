import s from './ProfileInfo.module.scss'

import { Avatar } from '@/shared/composites'
import { Typography } from '@/shared/ui'

import { type PublicProfileData } from '@/entities/profile/api'
import { ProfileActions } from '../ProfileActions'
import { ProfileStats } from '../ProfileStats'
import { ProfileBio } from '../ProfileBio'

type Props = {
  profile: PublicProfileData
  isAuth: boolean
  isOwnProfile: boolean
  onFollow?: () => void
  onUnfollow?: () => void
  onEditProfile?: () => void
  onSendMessage?: () => void
}

export function ProfileInfo({
  isAuth,
  profile,
  isOwnProfile,
  onFollow,
  onUnfollow,
  onEditProfile,
  onSendMessage,
}: Props) {
  const { userName, avatars, userMetadata, isFollowing, aboutMe } = profile

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
              onFollow={onFollow}
              onUnfollow={onUnfollow}
              onEditProfile={onEditProfile}
              onSendMessage={onSendMessage}
            />
          )}
        </div>
        <ProfileStats stats={userMetadata} />
        <ProfileBio message={aboutMe} />
      </div>
    </div>
  )
}

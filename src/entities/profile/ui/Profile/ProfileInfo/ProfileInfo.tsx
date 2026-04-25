import { type PublicProfileData } from '@/entities/profile/api'
import { Avatar } from '@/shared/composites'
import { Skeleton } from '@/shared/composites/Skeleton'
import { Typography } from '@/shared/ui'

import s from './ProfileInfo.module.scss'

import { ProfileActions } from '../ProfileActions'
import { ProfileBio } from '../ProfileBio'
import { ProfileStats } from '../ProfileStats'

type Props = {
  profile: PublicProfileData
  isAuth: boolean
  shouldShowAuthActionSkeleton: boolean
  authActionSkeletonVariant: 'double' | 'single'
  isOwnProfile: boolean
  onFollow?: () => void
  onUnfollow?: () => void
  onEditProfile?: () => void
  onSendMessage?: () => void
}

export function ProfileInfo({
  isAuth,
  shouldShowAuthActionSkeleton,
  authActionSkeletonVariant,
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
          {shouldShowAuthActionSkeleton && (
            <div className={s.actionsSkeleton}>
              {authActionSkeletonVariant === 'single' ? (
                <Skeleton className={s.actionButtonSkeletonSingle} />
              ) : (
                <>
                  <Skeleton className={s.actionButtonSkeletonPrimary} />
                  <Skeleton className={s.actionButtonSkeletonSecondary} />
                </>
              )}
            </div>
          )}
        </div>
        <ProfileStats stats={userMetadata} />
        <ProfileBio message={aboutMe} />
      </div>
    </div>
  )
}

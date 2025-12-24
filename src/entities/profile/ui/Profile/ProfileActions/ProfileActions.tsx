import React from 'react'
import s from './ProfileActions.module.scss'
import { Button } from '@/shared/ui'

interface Props {
  isOwnProfile: boolean
  isFollowing: boolean
  onFollow: () => void
  onUnfollow: () => void
  onEditProfile: () => void
  onSendMessage: () => void
}

export const ProfileActions: React.FC<Props> = ({
  isOwnProfile,
  isFollowing,
  onFollow,
  onUnfollow,
  onEditProfile,
  onSendMessage,
}) => {
  const followButtonText = isFollowing ? 'Unfollow' : 'Follow'
  const followButtonVariant = isFollowing ? 'outlined' : 'primary'
  const handleFollowClick = isFollowing ? onUnfollow : onFollow

  if (isOwnProfile) {
    return (
      <Button variant={'secondary'} onClick={onEditProfile}>
        Profile Settings
      </Button>
    )
  }

  return (
    <div className={s.actions}>
      <Button
        variant={followButtonVariant}
        onClick={handleFollowClick}
        className={isFollowing ? s.btnUnfollow : ''}
      >
        {followButtonText}
      </Button>

      <Button variant={'secondary'} onClick={onSendMessage}>
        Send Message
      </Button>
    </div>
  )
}

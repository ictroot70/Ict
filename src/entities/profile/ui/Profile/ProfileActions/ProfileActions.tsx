import React from 'react'

import { APP_ROUTES } from '@/shared/constant'
import { Button } from '@ictroot/ui-kit'
import Link from 'next/link'

import s from './ProfileActions.module.scss'

interface Props {
  isOwnProfile: boolean
  onEdit?: () => void
  onFollow?: () => void
  onMessage?: () => void
  isFollowing?: boolean
  onUnfollow?: () => void
  isLoading?: boolean
}

export const ProfileActions: React.FC<Props> = ({
  isOwnProfile,
  onFollow,
  onMessage,
  isFollowing = false,
  onUnfollow,
  isLoading = false,
}) => {
  if (isOwnProfile) {
    return (
      <Button variant={'secondary'} as={Link} href={APP_ROUTES.PROFILE.EDIT}>
        Profile Settings
      </Button>
    )
  }

  return (
    <div className={s.actions}>
      {isFollowing ? (
        <Button
          variant={'outlined'}
          onClick={onUnfollow}
          disabled={isLoading}
          className={s.btnOutlined}
        >
          Unfollow
        </Button>
      ) : (
        <Button onClick={onFollow} disabled={isLoading}>
          Follow
        </Button>
      )}
      <Button variant={'secondary'} onClick={onMessage} disabled={isLoading}>
        Send Message
      </Button>
    </div>
  )
}

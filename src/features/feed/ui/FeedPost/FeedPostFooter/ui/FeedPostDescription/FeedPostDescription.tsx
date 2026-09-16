'use client'

import { Avatar } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant/app-routes'
import { Button, Typography } from '@/shared/ui'
import Link from 'next/link'

import s from './FeedPostDescription.module.scss'

type Props = {
  avatarOwner: string
  descriptionText: string
  isExpanded: boolean
  isLong: boolean
  onToggle: () => void
  ownerId: number
  userName: string
}

export function FeedPostDescription({
  avatarOwner,
  descriptionText,
  isExpanded,
  isLong,
  onToggle,
  ownerId,
  userName,
}: Props) {
  return (
    <div className={s.description}>
      <Avatar image={avatarOwner} size={36} alt={`${userName} avatar`} />

      <Typography variant={'regular_14'} className={s.descriptionText}>
        <Link href={APP_ROUTES.PROFILE.ID(ownerId)}>
          <strong>{userName}</strong>
        </Link>
        <span>{descriptionText}</span>
        {isLong && (
          <Button
            variant={'text'}
            type={'button'}
            className={s.descriptionToggle}
            onClick={onToggle}
          >
            {isExpanded ? 'Hide' : 'Show more'}
          </Button>
        )}
      </Typography>
    </div>
  )
}

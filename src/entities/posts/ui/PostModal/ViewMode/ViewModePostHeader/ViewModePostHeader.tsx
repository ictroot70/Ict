'use client'

import React from 'react'

import { Avatar } from '@/shared/composites'
import { PostVariant } from '@/shared/types'
import { Typography } from '@/shared/ui'

import s from '../ViewMode.module.scss'

import PostActions from '../../PostActions/PostActions'

interface PostHeaderProps {
  postData: {
    avatar: string
    userName: string
  }
  variant: PostVariant
  onEdit: () => void
  onDelete: () => void
  onFollow: () => void
  onCopyLink: () => void
}

export const ViewModePostHeader: React.FC<PostHeaderProps> = ({
  postData,
  variant,
  onEdit,
  onDelete,
  onFollow,
  onCopyLink,
}) => {
  let actions = null

  if (variant === 'myPost') {
    actions = <PostActions variant={'myPost'} onEdit={onEdit} onDelete={onDelete} />
  } else if (variant === 'userPost') {
    actions = <PostActions variant={'userPost'} onFollow={onFollow} onCopyLink={onCopyLink} />
  }

  return (
    <div className={s.postHeader}>
      <div className={s.username}>
        <Avatar size={36} image={postData.avatar} />
        <Typography variant={'h3'} color={'light'}>
          {postData.userName}
        </Typography>
      </div>

      {actions}
    </div>
  )
}

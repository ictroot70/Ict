'use client'

import React from 'react'

import { Avatar, Skeleton } from '@/shared/composites'
import { PostVariant } from '@/shared/types'
import { Typography } from '@/shared/ui'

import s from '../ViewMode.module.scss'

import PostActions from '../../PostActions/PostActions'

interface PostHeaderProps {
  actions: {
    handleCopyLink: () => void
  }
  auth: {
    isLoading: boolean
  }
  description: {
    handleEdit: () => void
  }
  follow: {
    handleFollow: () => void
    isFollowing: boolean
    isPending: boolean
  }
  onDelete: () => void
  post: {
    variant: PostVariant
  }
  postData: {
    avatar: string
    userName: string
  }
}

export const ViewModePostHeader: React.FC<PostHeaderProps> = ({
  actions,
  auth,
  description,
  follow,
  onDelete,
  post,
  postData,
}) => {
  let renderedActions = null

  if (auth.isLoading) {
    renderedActions = <Skeleton className={s.actionsSkeleton} aria-hidden />
  } else if (post.variant === 'myPost') {
    renderedActions = (
      <PostActions variant={'myPost'} onEdit={description.handleEdit} onDelete={onDelete} />
    )
  } else if (post.variant === 'userPost') {
    renderedActions = (
      <PostActions
        variant={'userPost'}
        onFollow={follow.handleFollow}
        isFollowing={follow.isFollowing}
        isFollowPending={follow.isPending}
        onCopyLink={actions.handleCopyLink}
      />
    )
  }

  return (
    <div className={s.postHeader}>
      <div className={s.username}>
        <Avatar size={36} image={postData.avatar} />
        <Typography variant={'h3'} color={'light'}>
          {postData.userName}
        </Typography>
      </div>

      {renderedActions}
    </div>
  )
}

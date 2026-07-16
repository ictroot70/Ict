'use client'

import { Avatar, Skeleton } from '@/shared/composites'
import { Typography } from '@/shared/ui'

import s from './FeedPostLikesSummary.module.scss'

type Props = {
  avatarUrls: string[]
  isLoading?: boolean
  likesCount: number
}

export function FeedPostLikesSummary({ avatarUrls, isLoading = false, likesCount }: Props) {
  const skeletonAvatarCount = Math.min(Math.max(likesCount, 1), 3)

  if (isLoading) {
    return (
      <div className={s.likes} aria-hidden={'true'}>
        <div className={s.likeAvatars}>
          {Array.from({ length: skeletonAvatarCount }, (_, index) => (
            <Skeleton className={s.likeAvatarSkeleton} key={index} />
          ))}
        </div>
        <Skeleton className={s.likesTextSkeleton} />
      </div>
    )
  }

  return (
    <div className={s.likes}>
      {avatarUrls.length > 0 && (
        <div className={s.likeAvatars} aria-hidden={'true'}>
          {avatarUrls.map((avatar, index) => (
            <Avatar className={s.likeAvatar} image={avatar} size={24} key={`${avatar}-${index}`} />
          ))}
        </div>
      )}
      <Typography variant={'regular_14'}>
        <span className={s.countComments}>{likesCount.toLocaleString('ru-RU')}</span>
        <span>&quot;</span>
        <strong>Like</strong>
        <span>&quot;</span>
      </Typography>
    </div>
  )
}

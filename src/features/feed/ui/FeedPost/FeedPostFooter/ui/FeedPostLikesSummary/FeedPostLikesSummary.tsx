'use client'

import { Avatar } from '@/shared/composites'
import { Typography } from '@/shared/ui'

import s from './FeedPostLikesSummary.module.scss'

type Props = {
  avatarUrls: string[]
  likesCount: number
}

export function FeedPostLikesSummary({ avatarUrls, likesCount }: Props) {
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

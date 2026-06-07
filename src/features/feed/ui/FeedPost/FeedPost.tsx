'use client'

import { PostViewModel } from '@/entities/posts/api'
import { useTimeAgo } from '@/entities/users/hooks/useTimeAgo'
import { Avatar, Carousel } from '@/shared/composites'
import { Typography } from '@/shared/ui'

import s from './FeedPost.module.scss'

type Props = {
  post: PostViewModel
}

export function FeedPost({ post }: Props) {
  const { avatarOwner, userName, createdAt, images, description } = post

  const timeAgo = useTimeAgo(createdAt)

  return (
    <article className={s.post}>
      <header className={s.header}>
        <Avatar image={avatarOwner} size={36} alt={`${userName} avatar`} />
        <Typography variant={'bold_14'}>{userName}</Typography>
        <span className={s.separator} aria-hidden={'true'} />
        <Typography variant={'small_text'} className={s.time}>
          {timeAgo}
        </Typography>
      </header>

      <div className={s.media}>
        <Carousel slides={images} />
      </div>

      <Typography variant={'regular_14'}>{description}</Typography>
    </article>
  )
}

'use client'

import { PostViewModel } from '@/entities/posts/api'
import { useTimeAgo } from '@/entities/users/hooks/useTimeAgo'
import { Avatar, Carousel } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant/app-routes'
import { Typography } from '@/shared/ui'
import Link from 'next/dist/client/link'

import s from './FeedPost.module.scss'

import { FeedPostActions } from './FeedPostActions'
import { FeedPostFooter } from './FeedPostFooter'

type Props = {
  isFollowing: boolean
  isFollowPending: boolean
  onCopyLink: () => void
  onToggleFollow: () => void
  post: PostViewModel
}

export function FeedPost({
  isFollowing,
  isFollowPending,
  onCopyLink,
  onToggleFollow,
  post,
}: Props) {
  const { avatarOwner, ownerId, userName, createdAt, images } = post

  const timeAgo = useTimeAgo(createdAt)

  return (
    <article className={s.post}>
      <header className={s.header}>
        <Avatar image={avatarOwner} size={36} alt={`${userName} avatar`} />
        <Link href={APP_ROUTES.PROFILE.ID(ownerId)} className={s.authorLink}>
          <Typography variant={'bold_14'}>{userName}</Typography>
        </Link>
        <span className={s.separator} aria-hidden={'true'} />
        <Typography variant={'small_text'} className={s.time}>
          {timeAgo}
        </Typography>
        <div className={s.menu}>
          <FeedPostActions
            isFollowing={isFollowing}
            isPending={isFollowPending}
            onCopyLink={onCopyLink}
            onToggleFollow={onToggleFollow}
          />
        </div>
      </header>

      <div className={s.media}>
        <Carousel slides={images} />
      </div>

      <FeedPostFooter post={post} />
    </article>
  )
}

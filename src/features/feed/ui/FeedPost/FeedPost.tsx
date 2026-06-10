'use client'

import { PostViewModel } from '@/entities/posts/api'
import { useTimeAgo } from '@/entities/users/hooks/useTimeAgo'
import { Avatar, Carousel } from '@/shared/composites'
import { Typography } from '@/shared/ui'

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
  const { avatarOwner, userName, createdAt, images } = post

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

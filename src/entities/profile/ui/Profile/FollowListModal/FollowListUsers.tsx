import type { UserFollowingFollowersViewModel } from '@/shared/types'

import type { RefObject } from 'react'

import { Avatar, InfiniteScrollTrigger } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant'
import { Button, Typography } from '@/shared/ui'
import Link from 'next/link'

import s from './FollowListModal.module.scss'

type Props = {
  currentUserId?: number
  hasNextPage: boolean
  isLoadingMore: boolean
  listRootRef: RefObject<HTMLDivElement | null>
  onClose: () => void
  onLoadMore: () => void
  onToggleFollow: (user: UserFollowingFollowersViewModel) => void
  pendingUserId: null | number
  users: UserFollowingFollowersViewModel[]
}

export const FollowListUsers = ({
  currentUserId,
  hasNextPage,
  isLoadingMore,
  listRootRef,
  onClose,
  onLoadMore,
  onToggleFollow,
  pendingUserId,
  users,
}: Props) => (
  <div className={s.list} ref={listRootRef}>
    {users.map(user => (
      <div key={user.userId} className={s.userRow}>
        <Link className={s.userLink} href={APP_ROUTES.PROFILE.ID(user.userId)} onClick={onClose}>
          <Avatar
            className={s.avatar}
            image={user.avatars?.[0]?.url}
            alt={user.userName}
            size={48}
          />
          <span className={s.userInfo}>
            <Typography className={s.userName} variant={'bold_14'}>
              {user.userName}
            </Typography>
          </span>
        </Link>
        {user.userId !== currentUserId && (
          <Button
            className={s.followButton}
            disabled={pendingUserId === user.userId}
            variant={user.isFollowing ? 'outlined' : 'primary'}
            onClick={() => onToggleFollow(user)}
          >
            {user.isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
        )}
      </div>
    ))}
    {isLoadingMore && (
      <Typography className={s.loadingMore} variant={'regular_14'}>
        Loading more...
      </Typography>
    )}
    <InfiniteScrollTrigger
      hasNextPage={hasNextPage}
      onLoadMore={onLoadMore}
      rootRef={listRootRef}
    />
  </div>
)

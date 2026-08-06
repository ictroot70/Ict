import type { UserFollowingFollowersViewModel } from '@/shared/types'

import type { RefObject } from 'react'

import { Avatar, InfiniteScrollTrigger } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant'
import { Button, Typography } from '@/shared/ui'
import Link from 'next/link'

import s from './FollowListModal.module.scss'

type FollowListMode = 'followers' | 'following'

type Props = {
  canDeleteFollowers: boolean
  currentUserId?: number
  hasNextPage: boolean
  isLoadingMore: boolean
  listRootRef: RefObject<HTMLDivElement | null>
  mode: FollowListMode
  onClose: () => void
  onDeleteFollower: (user: UserFollowingFollowersViewModel) => void
  onLoadMore: () => void
  onToggleFollow: (user: UserFollowingFollowersViewModel) => void
  pendingUserId: null | number
  users: UserFollowingFollowersViewModel[]
}

export const FollowListUsers = ({
  canDeleteFollowers,
  currentUserId,
  hasNextPage,
  isLoadingMore,
  listRootRef,
  mode,
  onClose,
  onDeleteFollower,
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
        {mode === 'followers' && currentUserId !== undefined && (
          <div className={s.followersActions}>
            {!user.isFollowing && user.userId !== currentUserId ? (
              <Button
                className={s.followButton}
                disabled={pendingUserId !== null}
                variant={'primary'}
                onClick={() => onToggleFollow(user)}
              >
                Follow
              </Button>
            ) : (
              <span className={s.actionPlaceholder} />
            )}
            {canDeleteFollowers && (
              <Button
                className={s.deleteButton}
                disabled={pendingUserId !== null}
                variant={'text'}
                onClick={() => onDeleteFollower(user)}
              >
                Delete
              </Button>
            )}
          </div>
        )}
        {mode === 'following' && currentUserId !== undefined && user.userId !== currentUserId && (
          <Button
            className={s.followingButton}
            disabled={pendingUserId !== null}
            variant={'outlined'}
            onClick={() => onToggleFollow(user)}
          >
            Unfollow
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

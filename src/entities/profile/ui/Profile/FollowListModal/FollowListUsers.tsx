import type { FollowListUsersActions, FollowListUsersState } from './followListModal.types'

import { Avatar, InfiniteScrollTrigger } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant'
import { Button, Typography } from '@/shared/ui'
import Link from 'next/link'

import s from './FollowListModal.module.scss'

type Props = {
  actions: FollowListUsersActions
  state: FollowListUsersState
}

export const FollowListUsers = ({ actions, state }: Props) => (
  <div className={s.list} ref={state.listRootRef}>
    {state.users.map(user => {
      const canShowFollowingUnfollow =
        state.mode === 'following' &&
        state.currentUserId !== undefined &&
        user.userId !== state.currentUserId &&
        user.isFollowing

      return (
        <div key={user.userId} className={s.userRow}>
          <Link
            className={s.userLink}
            href={APP_ROUTES.PROFILE.ID(user.userId)}
            onClick={actions.onClose}
          >
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
          {state.mode === 'followers' && state.currentUserId !== undefined && (
            <div className={s.followersActions}>
              {!user.isFollowing && user.userId !== state.currentUserId ? (
                <Button
                  className={s.followButton}
                  disabled={state.pendingUserId !== null}
                  variant={'primary'}
                  onClick={() => actions.onToggleFollow(user)}
                >
                  Follow
                </Button>
              ) : (
                <span className={s.actionPlaceholder} />
              )}
              {state.canDeleteFollowers && (
                <Button
                  className={s.deleteButton}
                  disabled={state.pendingUserId !== null}
                  variant={'text'}
                  onClick={() => actions.onDeleteFollower(user)}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
          {canShowFollowingUnfollow && (
            <Button
              className={s.followingButton}
              disabled={state.pendingUserId !== null}
              variant={'outlined'}
              onClick={() => actions.onToggleFollow(user)}
            >
              Unfollow
            </Button>
          )}
        </div>
      )
    })}
    {state.isLoadingMore && (
      <Typography className={s.loadingMore} variant={'regular_14'}>
        Loading more...
      </Typography>
    )}
    <InfiniteScrollTrigger
      hasNextPage={state.hasNextPage}
      onLoadMore={actions.onLoadMore}
      rootRef={state.listRootRef}
    />
  </div>
)

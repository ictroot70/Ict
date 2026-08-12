import type { FollowListMode } from './followListModal.types'
import type { UserFollowingFollowersViewModel } from '@/shared/types'

import type { RefObject } from 'react'

import { FollowListFeedback } from './FollowListFeedback'
import { FollowListUsers } from './FollowListUsers'

const EMPTY_TEXT_BY_MODE = { followers: 'No followers yet', following: 'No following yet' } as const

type Props = {
  canDeleteFollowers: boolean
  currentUserId?: number
  debouncedSearch: string
  hasNextPage: boolean
  isError: boolean
  isInitialLoading: boolean
  isLoadingMore: boolean
  listRootRef: RefObject<HTMLDivElement | null>
  mode: FollowListMode
  onClose: () => void
  onDeleteFollower: (user: UserFollowingFollowersViewModel) => void
  onLoadMore: () => void
  onRetry: () => void
  onToggleFollow: (user: UserFollowingFollowersViewModel) => void
  pendingUserId: null | number
  users: UserFollowingFollowersViewModel[]
}

export const FollowListBody = ({
  canDeleteFollowers,
  currentUserId,
  debouncedSearch,
  hasNextPage,
  isError,
  isInitialLoading,
  isLoadingMore,
  listRootRef,
  mode,
  onClose,
  onDeleteFollower,
  onLoadMore,
  onRetry,
  onToggleFollow,
  pendingUserId,
  users,
}: Props) => {
  if (isInitialLoading) {
    return <FollowListFeedback type={'loading'} />
  }

  if (isError) {
    return <FollowListFeedback type={'error'} onRetry={onRetry} />
  }

  if (!users.length) {
    const emptyText = debouncedSearch.trim() ? 'No users found' : EMPTY_TEXT_BY_MODE[mode]

    return <FollowListFeedback type={'empty'} emptyText={emptyText} />
  }

  return (
    <FollowListUsers
      canDeleteFollowers={canDeleteFollowers}
      currentUserId={currentUserId}
      hasNextPage={hasNextPage}
      isLoadingMore={isLoadingMore}
      listRootRef={listRootRef}
      mode={mode}
      pendingUserId={pendingUserId}
      users={users}
      onClose={onClose}
      onDeleteFollower={onDeleteFollower}
      onLoadMore={onLoadMore}
      onToggleFollow={onToggleFollow}
    />
  )
}

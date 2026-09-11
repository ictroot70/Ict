import type { UserFollowingFollowersViewModel } from '@/shared/types'

import type { RefObject } from 'react'

export type FollowListMode = 'following' | 'followers'

export type FollowListUsersActions = {
  onClose: () => void
  onDeleteFollower: (user: UserFollowingFollowersViewModel) => void
  onLoadMore: () => void
  onToggleFollow: (user: UserFollowingFollowersViewModel) => void
}

export type FollowListUsersState = {
  canDeleteFollowers: boolean
  currentUserId?: number
  hasNextPage: boolean
  isLoadingMore: boolean
  listRootRef: RefObject<HTMLDivElement | null>
  mode: FollowListMode
  pendingUserId: null | number
  users: UserFollowingFollowersViewModel[]
}

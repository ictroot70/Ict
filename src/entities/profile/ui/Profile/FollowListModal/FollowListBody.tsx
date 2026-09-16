import type { FollowListUsersActions, FollowListUsersState } from './followListModal.types'

import { FollowListFeedback } from './FollowListFeedback'
import { FollowListUsers } from './FollowListUsers'

const EMPTY_TEXT_BY_MODE = { followers: 'No followers yet', following: 'No following yet' } as const

type Props = {
  actions: FollowListUsersActions
  debouncedSearch: string
  isError: boolean
  isInitialLoading: boolean
  onRetry: () => void
  state: FollowListUsersState
}

export const FollowListBody = ({
  actions,
  debouncedSearch,
  isError,
  isInitialLoading,
  onRetry,
  state,
}: Props) => {
  if (isInitialLoading) {
    return <FollowListFeedback type={'loading'} />
  }

  if (isError) {
    return <FollowListFeedback type={'error'} onRetry={onRetry} />
  }

  if (!state.users.length) {
    const emptyText = debouncedSearch.trim() ? 'No users found' : EMPTY_TEXT_BY_MODE[state.mode]

    return <FollowListFeedback type={'empty'} emptyText={emptyText} />
  }

  return <FollowListUsers actions={actions} state={state} />
}

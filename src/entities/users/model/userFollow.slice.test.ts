import { logout } from '@/shared/auth'
import { describe, expect, it } from 'vitest'

import { markUserUnfollowed, userFollowReducer } from './userFollow.slice'

describe('userFollowReducer', () => {
  it('clears unfollow state on logout', () => {
    const state = userFollowReducer(undefined, markUserUnfollowed(7))

    expect(state.unfollowedUserIds).toEqual([7])
    expect(userFollowReducer(state, logout()).unfollowedUserIds).toEqual([])
  })
})

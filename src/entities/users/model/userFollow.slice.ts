import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserFollowState {
  unfollowedUserIds: number[]
}

const initialState: UserFollowState = {
  unfollowedUserIds: [],
}

const userFollowSlice = createSlice({
  name: 'userFollow',
  initialState,
  reducers: {
    markUserFollowed(state, action: PayloadAction<number>) {
      state.unfollowedUserIds = state.unfollowedUserIds.filter(userId => userId !== action.payload)
    },
    markUserUnfollowed(state, action: PayloadAction<number>) {
      if (!state.unfollowedUserIds.includes(action.payload)) {
        state.unfollowedUserIds.push(action.payload)
      }
    },
  },
})

export const { markUserFollowed, markUserUnfollowed } = userFollowSlice.actions
export const userFollowReducer = userFollowSlice.reducer
export const selectUnfollowedUserIds = (state: { userFollow: UserFollowState }) =>
  state.userFollow.unfollowedUserIds

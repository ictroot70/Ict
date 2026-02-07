import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { Profile } from '../model/domain/types'

interface ProfileState {
  draft: Partial<Profile> | null
  isEditMode: boolean
}

const initialState: ProfileState = {
  draft: null,
  isEditMode: false,
}

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    startEdit(state, action: PayloadAction<Profile>) {
      state.isEditMode = true
      state.draft = action.payload
    },
    updateDraft(state, action: PayloadAction<Partial<Profile>>) {
      if (state.draft) {
        Object.assign(state.draft, action.payload)
      }
    },
    finishEdit(state) {
      state.isEditMode = false
      state.draft = null
    },
  },
})

export const ProfileSliceActions = profileSlice.actions
export const profileReducer = profileSlice.reducer

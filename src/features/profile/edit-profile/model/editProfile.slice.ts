import { ProfileUpdate, Profile } from '@/entities/profile/model/domain/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface EditProfileState {
  draft: ProfileUpdate | null
  isOpen: boolean
}

const initialState: EditProfileState = {
  draft: null,
  isOpen: false,
}

const editProfileSlice = createSlice({
  name: 'editProfile',
  initialState,
  reducers: {
    openEdit(state: EditProfileState, action: PayloadAction<Profile>) {
      state.draft = {
        userName: action.payload.userName,
        aboutMe: action.payload.aboutMe,
        firstName: action.payload.firstName,
        lastName: action.payload.lastName,
        city: action.payload.city,
        country: action.payload.country,
        region: action.payload.region,
        dateOfBirth: action.payload.dateOfBirth,
      }
      state.isOpen = true
    },

    closeEdit(state) {
      state.draft = null
      state.isOpen = false
    },

    updateField<K extends keyof ProfileUpdate>(
      state: EditProfileState,
      action: PayloadAction<{ field: K; value: ProfileUpdate[K] }>
    ) {
      if (state.draft) {
        state.draft[action.payload.field] = action.payload.value
      }
    },
  },
})

export const { openEdit, closeEdit, updateField } = editProfileSlice.actions
export const editProfileReducer = editProfileSlice.reducer

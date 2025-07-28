import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { authApi } from '@/features/auth/api/authApi'

type User = {
  userId: string
  email: string
}

interface AuthState {
  user: User | null
}

const initialState: AuthState = {
  user: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearUser: state => {
      state.user = null
    },
  },
  extraReducers: builder => {
    builder.addMatcher(
      authApi.endpoints.me.matchFulfilled,
      (state, action: PayloadAction<User>) => {
        state.user = action.payload
      }
    )
    builder.addMatcher(authApi.endpoints.logout.matchFulfilled, state => {
      state.user = null
    })
  },
})

export const { clearUser } = authSlice.actions
export const authReducer = authSlice.reducer

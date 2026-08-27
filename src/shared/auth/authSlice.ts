import { createSlice } from '@reduxjs/toolkit'

interface AuthState {
  isAuthenticated: boolean
}

const initialState: AuthState = {
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated(state) {
      state.isAuthenticated = true
    },
    logout(state) {
      state.isAuthenticated = false
    },
  },
})

export const { setAuthenticated, logout } = authSlice.actions
export const authReducer = authSlice.reducer

import { profileApi } from '@/entities/profile/api/profile.api'
import { publicUsersApi } from '@/entities/users/api'
import { authApi } from '@/features/auth'
import { Action, combineSlices, configureStore, ThunkAction } from '@reduxjs/toolkit'
import { postApi } from '@/entities/posts/api'
import { baseApi } from '@/shared/api/base-api'
console.log('API reducer paths:')
console.log('authApi:', authApi.reducerPath)
console.log('publicUsersApi:', publicUsersApi.reducerPath)
console.log('profileApi:', profileApi.reducerPath)
console.log('postApi:', postApi.reducerPath)
const apiSlices = [baseApi]
export const makeStore = () => {
  return configureStore({
    reducer: combineSlices(...apiSlices),
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat(...apiSlices.map(api => api.middleware)),
    devTools: true,
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action>

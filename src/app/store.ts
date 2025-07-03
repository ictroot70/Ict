import { Action, combineSlices, configureStore, ThunkAction } from '@reduxjs/toolkit'
import { authApi } from '@/features/auth/api/authApi'
import { publicUsersApi } from '@/entities/user/api/publicUsersApi'

export const makeStore = () => {
  return configureStore({
    reducer: combineSlices(authApi, publicUsersApi),
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat(authApi.middleware, publicUsersApi.middleware),
    devTools: true,
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action>

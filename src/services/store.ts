import { Action, combineSlices, configureStore, ThunkAction } from '@reduxjs/toolkit'
import { ictApi } from '@/services/ict.api'

export const makeStore = () => {
  return configureStore({
    reducer: combineSlices(ictApi),
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(ictApi.middleware),
    devTools: true,
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action>

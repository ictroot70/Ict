import { useDispatch, useSelector, useStore } from 'react-redux'

import { editProfileFormListenerMiddleware } from '@/features/profile/edit-profile/model/editProfileForm.listeners'
import { editProfileFormReducer } from '@/features/profile/edit-profile/model/editProfileForm.slice'
import { baseApi } from '@/shared/api/base-api'
import { authListenerMiddleware } from '@/shared/auth/authListener'
import { authReducer } from '@/shared/auth/authSlice'
import { Action, combineSlices, configureStore, ThunkAction } from '@reduxjs/toolkit'

const apiSlices = [baseApi]

export const makeStore = () => {
  return configureStore({
    reducer: combineSlices(...apiSlices, {
      auth: authReducer,
      // avatarUpload: avatarUploadReducer,
      editProfileForm: editProfileFormReducer,
    }),
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActionPaths: ['meta.arg', 'meta.baseQueryMeta', 'payload.file', 'file'],
          ignoredPaths: ['baseApi', 'avatarUpload.file'],
          warnAfter: 128,
        },
        immutableCheck: {
          warnAfter: 128,
          ignoredPaths: ['baseApi'],
        },
      })
        .concat(...apiSlices.map(api => api.middleware))
        .prepend(editProfileFormListenerMiddleware.middleware)
        .prepend(authListenerMiddleware.middleware),
    devTools: true,
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action>

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
export const useAppStore = useStore.withTypes<AppStore>()

import { useDispatch, useSelector, useStore, TypedUseSelectorHook } from 'react-redux'

import { AppDispatch, AppStore, RootState } from '@/app/store'

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppStore = useStore.withTypes<AppStore>()

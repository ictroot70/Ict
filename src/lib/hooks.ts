import { AppDispatch, AppStore, RootState } from '@/app/store'
import { useDispatch, useSelector, useStore, TypedUseSelectorHook } from 'react-redux'

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppStore = useStore.withTypes<AppStore>()

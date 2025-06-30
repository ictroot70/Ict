// lib/hooks.ts
import { useDispatch, useSelector, useStore, TypedUseSelectorHook } from 'react-redux'
import type { AppDispatch, RootState, AppStore } from '@/services/store'

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppStore = useStore.withTypes<AppStore>()

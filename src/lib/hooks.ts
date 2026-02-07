import { useDispatch, useSelector, useStore, TypedUseSelectorHook } from 'react-redux'

export const useAppDispatch: () => any = useDispatch
export const useAppSelector: TypedUseSelectorHook<any> = useSelector
export const useAppStore: () => any = useStore

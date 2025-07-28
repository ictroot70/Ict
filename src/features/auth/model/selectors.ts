import { RootState } from '@/app/store'

export const selectUser = (state: RootState) => state.auth.user

export const selectIsAuthorized = (state: RootState) => Boolean(state.auth.user)

export const selectUserId = (state: RootState) => state.auth.user?.userId ?? null

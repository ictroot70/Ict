import { useMemo } from 'react'
import { APP_ROUTES } from '@/shared/constant/app-routes'
import { useMeQuery } from '@/features/auth/api/authApi'

export const useHomeLink = () => {
  const { data: user, isLoading, isSuccess } = useMeQuery()

  return useMemo(() => {
    if (isLoading) return APP_ROUTES.ROOT
    return isSuccess && user ? APP_ROUTES.PROFILE.MY(user.userId) : APP_ROUTES.ROOT
  }, [isLoading, isSuccess, user])
}

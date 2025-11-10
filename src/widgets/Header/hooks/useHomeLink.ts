import { useMemo } from 'react'

import { useMeQuery } from '@/features/auth'
import { APP_ROUTES } from '@/shared/constant/app-routes'

export const useHomeLink = () => {
  const { data: user, isLoading, isSuccess } = useMeQuery()

  return useMemo(() => {
    if (isLoading) {
      return APP_ROUTES.ROOT
    }

    // return isSuccess && user ? APP_ROUTES.PROFILE.MY : APP_ROUTES.ROOT
  }, [isLoading, isSuccess, user])
}

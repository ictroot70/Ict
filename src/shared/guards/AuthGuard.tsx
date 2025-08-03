'use client'

import { ReactNode, useEffect } from 'react'

import { useMeQuery } from '@/features/auth'
import { Loading } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant'
import { usePathname, useRouter } from 'next/navigation'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { data, isLoading, isError, isFetching } = useMeQuery()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isError) {
      router.replace(`${APP_ROUTES.AUTH.LOGIN}?from=${encodeURIComponent(pathname)}`)
    }
  }, [isError, router, pathname])

  if (isLoading || isFetching) {
    return <Loading />
  }
  if (isError || !data) {
    return null
  }

  return <>{children}</>
}

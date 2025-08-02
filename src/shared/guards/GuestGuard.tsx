'use client'

import { useMeQuery } from '@/features/auth'
import { Loading } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

export function GuestGuard({ children }: { children: ReactNode }) {
  const { data, isLoading, isFetching } = useMeQuery()
  const router = useRouter()

  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (data) {
      setRedirecting(true)
      router.replace(APP_ROUTES.PROFILE.MY(data.userId))
    }
  }, [data, router])

  if (isLoading || isFetching || redirecting) {
    return <Loading />
  }

  return <>{children}</>
}

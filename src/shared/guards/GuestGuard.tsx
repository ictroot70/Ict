'use client'

import { ReactNode, useEffect, useState } from 'react'

import { useMeQuery } from '@/features/auth'
import { APP_ROUTES } from '@/shared/constant'
import { Loading } from '@/shared/ui'
import { useRouter } from 'next/navigation'

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

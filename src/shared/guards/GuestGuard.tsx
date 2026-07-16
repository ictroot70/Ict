'use client'

import { ReactNode, useEffect, useState } from 'react'

import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { Loading } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant'
import { useRouter } from 'next/navigation'

export function GuestGuard({ children }: { children: ReactNode }) {
  const { status, user } = useAuthUiState()
  const router = useRouter()

  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && user?.userId) {
      setRedirecting(true)
      router.replace(APP_ROUTES.PROFILE.ID(user.userId))
    }
  }, [router, status, user?.userId])

  if (status !== 'guest' || redirecting) {
    return <Loading />
  }

  return <>{children}</>
}

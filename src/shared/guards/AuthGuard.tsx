'use client'

import { ReactNode, useEffect } from 'react'
import { useSelector } from 'react-redux'

import { APP_ROUTES } from '@/shared/constant'
import { usePathname, useRouter } from 'next/navigation'

interface Props {
  children: ReactNode
}

type AuthGuardState = {
  auth: {
    isAuthenticated: boolean
  }
}

export function AuthGuard({ children }: Props) {
  const isAuthenticated = useSelector((state: AuthGuardState) => state.auth.isAuthenticated)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`${APP_ROUTES.AUTH.LOGIN}?from=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, pathname, router])

  return <>{children}</>
}

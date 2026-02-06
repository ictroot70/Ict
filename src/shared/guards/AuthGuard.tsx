'use client'

import { ReactNode, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { APP_ROUTES } from '@/shared/constant'
import { usePathname, useRouter } from 'next/navigation'
import { RootState } from '@/app/store'

interface Props {
  children: ReactNode
}

export function AuthGuard({ children }: Props) {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`${APP_ROUTES.AUTH.LOGIN}?from=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, pathname, router])

  return <>{children}</>
}

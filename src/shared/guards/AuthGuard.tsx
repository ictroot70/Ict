'use client'

import { ReactNode, useEffect } from 'react'
import { useSelector } from 'react-redux'

import { useAuthRestoreContext, useAuthSessionHintContext } from '@/shared/auth'
import { Loading } from '@/shared/composites'
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
  const { isRestoring } = useAuthRestoreContext()
  const { hasAuthHint } = useAuthSessionHintContext()
  const isAuthenticated = useSelector((state: AuthGuardState) => state.auth.isAuthenticated)
  const router = useRouter()
  const pathname = usePathname()
  const isAuthResolving = isRestoring || (!isAuthenticated && hasAuthHint)

  useEffect(() => {
    if (!isAuthResolving && !isAuthenticated) {
      router.replace(`${APP_ROUTES.AUTH.LOGIN}?from=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, isAuthResolving, pathname, router])

  if (isAuthResolving || !isAuthenticated) {
    return <Loading />
  }

  return <>{children}</>
}

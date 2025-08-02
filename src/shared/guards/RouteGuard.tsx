'use client'

import { useMeQuery } from '@/features/auth'
import { Loading } from '@/shared/composites'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useEffect, useMemo } from 'react'

type GuardMode = 'auth' | 'guest'

type RouteGuardProps = {
  children: ReactNode
  mode?: GuardMode
  guestPaths?: string[]
  loadingComponent?: ReactNode
  errorComponent?: ReactNode
  onErrorAction?: (error: unknown) => void
}

export function RouteGuard({
  children,
  mode,
  guestPaths = ['/auth'],
  loadingComponent = <Loading />,
  errorComponent = <div>Произошла ошибка. Попробуйте позже.</div>,
  onErrorAction,
}: RouteGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { data, isLoading, isError, error } = useMeQuery()

  // console.log('Auth state:', { data, isLoading, isError, error })

  const isLoggedIn = Boolean(data)
  const isInitialLoading = isLoading && !data

  const resolvedMode = useMemo<GuardMode>(() => {
    if (mode) {
      return mode
    }

    return guestPaths.some(path => pathname?.startsWith(path)) ? 'guest' : 'auth'
  }, [mode, pathname, guestPaths])

  const shouldRedirect = useMemo(() => {
    if (isInitialLoading || isError) {
      return false
    }

    return (resolvedMode === 'auth' && !isLoggedIn) || (resolvedMode === 'guest' && isLoggedIn)
  }, [isInitialLoading, isError, resolvedMode, isLoggedIn])

  useEffect(() => {
    if (isError) {
      onErrorAction?.(error)
      console.error('RouteGuard: Auth check failed', error)
    }
  }, [isError, error, onErrorAction])

  useEffect(() => {
    if (shouldRedirect) {
      // console.log('Performing redirect...', { pathname, resolvedMode })
      const redirectPath =
        resolvedMode === 'auth' ? `/auth/login?from=${encodeURIComponent(pathname)}` : '/'

      router.replace(redirectPath)
    }
  }, [shouldRedirect, resolvedMode, pathname, router])

  if (isInitialLoading) {
    // console.log('Initial loading...')

    return <>{loadingComponent}</>
  }

  if (isError) {
    // console.error('Auth error occurred')

    return <>{errorComponent}</>
  }

  if (shouldRedirect) {
    // console.log('Redirect pending...')

    return <>{loadingComponent}</>
  }

  // console.log('Rendering protected content')

  return <>{children}</>
}

import { APP_ROUTES } from '@/shared/constant'
import { logger } from '@/shared/lib/logger'
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'

import { logout } from './authSlice'

const PUBLIC_PATHS = ['/', '/auth', '/legal', '/health', '/profile']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(publicPath => {
    if (pathname === publicPath) {
      return true
    }
    if (pathname.startsWith(publicPath + '/')) {
      if (pathname.includes('/settings')) {
        return false
      }

      return true
    }

    return false
  })
}

/**
 * Redux Listener to handle logout action
 *
 * When logout() is called, automatically:
 * 1. Cleans up localStorage
 * 2. Redirect to /auth/login (ONLY for protected pages)
 *
 * This solves the infinite loading problem:
 * - When refresh token goes rotten → baseQueryWithReauth calls logout()
 * - Listener catches this and makes a redirect
 * - The user sees the login form instead of the infinite skeleton loader
 *
 * BUT: On public pages (/, /auth/*, /legal/*) redirects do NOT occur
 */
export const authListenerMiddleware = createListenerMiddleware()

authListenerMiddleware.startListening({
  matcher: isAnyOf(logout),
  effect: async (action, listenerApi) => {
    if (typeof window === 'undefined') {
      return
    }

    const currentPath = window.location.pathname

    if (isPublicPath(currentPath)) {
      logger.log('[authListener] Logout on public page, no redirect:', currentPath)

      return
    }

    const from = encodeURIComponent(currentPath + window.location.search)

    logger.log('[authListener] Redirecting to login from protected page:', currentPath)

    setTimeout(() => {
      window.location.href = `${APP_ROUTES.AUTH.LOGIN}?from=${from}`
    }, 100)
  },
})

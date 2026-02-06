import { useEffect, useRef, useState } from 'react'
import { useAppDispatch } from '@/lib/hooks'
import { authTokenStorage } from '@/shared/lib/storage/auth-token'
import { setAuthenticated, logout } from '@/shared/auth/authSlice'
import { restoreAccessToken } from '@/shared/lib/restoreAccessToken'
import { logger } from '@/shared/lib/logger'

/*
 * ALGORITHM:
 * 1. Checking if the token is in memory
 * 2. If not, → call restoreAccessToken()
 * 3. If successfully, → save the token + return shouldPrefetch=true
 * 4. If failed → dispatch(logout())
 * 5. setIsRestoring(false)
 */
export function useAuthRestore() {
  const dispatch = useAppDispatch()
  const [isRestoring, setIsRestoring] = useState(true)
  const [shouldPrefetch, setShouldPrefetch] = useState(false)
  const hasAttemptedRef = useRef(false)

  useEffect(() => {
    if (hasAttemptedRef.current) return
    hasAttemptedRef.current = true

    async function performRestore() {
      if (authTokenStorage.hasToken()) {
        logger.log('[useAuthRestore] Token already in memory, will prefetch /me')
        dispatch(setAuthenticated())
        setShouldPrefetch(true)
        setIsRestoring(false)
        return
      }

      const result = await restoreAccessToken()

      if (result.isAuthenticated && result.accessToken) {
        authTokenStorage.setAccessToken(result.accessToken)
        dispatch(setAuthenticated())
        setShouldPrefetch(true)
        logger.log('[useAuthRestore] Token restored, will prefetch /me')
      } else {
        dispatch(logout())
        logger.log('[useAuthRestore] Token restore failed')
      }

      setIsRestoring(false)
    }

    performRestore()
  }, [dispatch])

  return { isRestoring, shouldPrefetch }
}

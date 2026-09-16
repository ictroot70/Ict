'use client'

import { useEffect, useState } from 'react'

import { useAuthRestoreContext, useEffectiveAuthHint } from '@/shared/auth'

import { useAuth } from './useAuth'

type AuthUiStatus = 'authenticated' | 'guest' | 'loading'

export const useAuthUiState = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { isRestoring } = useAuthRestoreContext()
  const effectiveHasAuthHint = useEffectiveAuthHint()
  const shouldUseLoadingPhase = effectiveHasAuthHint || isRestoring
  const hasPendingAuthRequest = isLoading || isRestoring
  const [resolvedOnce, setResolvedOnce] = useState(() => {
    return isAuthenticated || !shouldUseLoadingPhase || !hasPendingAuthRequest
  })

  useEffect(() => {
    // Auth hint now arrives from client storage after hydration, so we need to re-open the
    // loading phase if it appears while the auth request is still pending.
    if (resolvedOnce && shouldUseLoadingPhase && hasPendingAuthRequest && !isAuthenticated) {
      setResolvedOnce(false)
    }
  }, [hasPendingAuthRequest, isAuthenticated, resolvedOnce, shouldUseLoadingPhase])

  useEffect(() => {
    if (resolvedOnce) {
      return
    }

    if (
      isAuthenticated ||
      !shouldUseLoadingPhase ||
      (shouldUseLoadingPhase && !hasPendingAuthRequest)
    ) {
      setResolvedOnce(true)
    }
  }, [hasPendingAuthRequest, isAuthenticated, resolvedOnce, shouldUseLoadingPhase])

  const isAuthUiLoading =
    !isAuthenticated && !resolvedOnce && shouldUseLoadingPhase && hasPendingAuthRequest
  let status: AuthUiStatus = 'guest'

  if (isAuthUiLoading) {
    status = 'loading'
  } else if (isAuthenticated) {
    status = 'authenticated'
  }

  return {
    status,
    isAuthUiLoading,
    isAuthenticatedUi: status === 'authenticated',
    user,
  }
}

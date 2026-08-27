'use client'

import { useEffect, useRef } from 'react'

import { useGoogleAuthMutation } from '@/features/auth'
import { consumeGoogleOAuthState } from '@/features/auth/lib/google-oauth-state'
import { APP_ROUTES } from '@/shared/constant'
import { showToastAlert } from '@/shared/lib'
import { useRouter, useSearchParams } from 'next/navigation'

type UseGoogleAuthOptions = {
  enabled?: boolean
  redirectUrl?: string
}

export const useGoogleAuth = ({ enabled = false, redirectUrl }: UseGoogleAuthOptions = {}) => {
  const params = useSearchParams()
  const router = useRouter()
  const code = params.get('code')
  const callbackError = params.get('error')
  const returnedState = params.get('state')
  const startedRef = useRef(false)

  const [googleAuth, { isLoading }] = useGoogleAuthMutation()

  useEffect(() => {
    if (!enabled || (!code && !callbackError) || startedRef.current) {
      return
    }

    startedRef.current = true

    if (!consumeGoogleOAuthState(returnedState) || callbackError || !code) {
      showToastAlert({
        message: 'Google authorization failed. Try again please',
        type: 'error',
        duration: 4000,
      })
      router.replace(APP_ROUTES.AUTH.LOGIN)

      return
    }

    const resolvedRedirectUrl = redirectUrl ?? window.location.origin

    void googleAuth({
      code,
      redirectUrl: resolvedRedirectUrl,
    })
      .unwrap()
      .then(() => {
        router.replace(APP_ROUTES.ROOT)
      })
      .catch(() => {
        showToastAlert({
          message: 'Google authorization failed. Try again please',
          type: 'error',
          duration: 4000,
        })
        router.replace(APP_ROUTES.AUTH.LOGIN)
      })
  }, [callbackError, code, enabled, googleAuth, redirectUrl, returnedState, router])

  return { isLoading }
}

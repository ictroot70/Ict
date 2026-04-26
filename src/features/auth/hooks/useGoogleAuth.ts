'use client'

import { useEffect, useRef } from 'react'

import { useGoogleAuthMutation } from '@/features/auth'
import { APP_ROUTES } from '@/shared/constant'
import { showToastAlert } from '@/shared/lib'
import { useRouter, useSearchParams } from 'next/navigation'

export const useGoogleAuth = () => {
  const params = useSearchParams()
  const router = useRouter()
  const code = params.get('code')
  const startedRef = useRef(false)

  const [googleAuth, { isLoading }] = useGoogleAuthMutation()

  useEffect(() => {
    if (!code || startedRef.current) {
      return
    }

    startedRef.current = true

    void googleAuth({ code })
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
  }, [code, googleAuth, router])

  return { isLoading }
}

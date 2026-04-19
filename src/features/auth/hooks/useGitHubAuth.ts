'use client'

import { useEffect, useRef, useState } from 'react'

import { useLazyGetMyProfileQuery } from '@/entities/profile'
import { useAppDispatch } from '@/lib/hooks'
import { setAuthenticated } from '@/shared/auth/authSlice'
import { APP_ROUTES } from '@/shared/constant'
import { showToastAlert } from '@/shared/lib'
import { authTokenStorage } from '@/shared/lib/storage/auth-token'
import { jwtDecode } from 'jwt-decode'
import { useRouter, useSearchParams } from 'next/navigation'

export const useGitHubAuth = () => {
  const params = useSearchParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const startedRef = useRef(false)
  const [isLoading, setIsLoading] = useState(false)
  const [triggerProfile] = useLazyGetMyProfileQuery()

  const accessToken = params.get('accessToken')

  useEffect(() => {
    if (!accessToken || startedRef.current) {
      return
    }

    startedRef.current = true
    setIsLoading(true)
    void (async () => {
      try {
        const decoded = jwtDecode<{ userId: number }>(accessToken)
        const userId = decoded?.userId

        if (!userId) {
          throw new Error('No userId in access token')
        }

        authTokenStorage.setAccessToken(accessToken)
        dispatch(setAuthenticated())

        const profile = await triggerProfile().unwrap()

        router.replace(APP_ROUTES.ROOT)
      } catch {
        showToastAlert({
          message: 'GitHub authorization failed. Try again please',
          type: 'error',
          duration: 4000,
        })
        router.replace(APP_ROUTES.AUTH.LOGIN)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [accessToken, dispatch, router, triggerProfile])

  return { isLoading }
}

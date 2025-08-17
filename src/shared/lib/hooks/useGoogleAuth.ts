'use client'

import { useEffect } from 'react'

import { useGoogleAuthMutation } from '@/features/auth'
import { APP_ROUTES } from '@/shared/constant'
import { authTokenStorage } from '@/shared/lib'
import { jwtDecode } from 'jwt-decode'
import { useRouter, useSearchParams } from 'next/navigation'

export const useGoogleAuth = () => {
  const params = useSearchParams()
  const router = useRouter()
  const code = params.get('code')

  const [googleAuth, { isLoading }] = useGoogleAuthMutation()

  useEffect(() => {
    const googleLoginHandler = async () => {
      debugger
      if (code) {
        try {
          const response = await googleAuth({ code }).unwrap()

          const decoded = jwtDecode<{ userId: string }>(response.accessToken)
          const userId = decoded?.userId

          authTokenStorage.setAccessToken(response.accessToken)
          router.replace(APP_ROUTES.PROFILE.MY(userId))
        } catch (error) {
          console.log(error)
        }
      }
    }

    if (code) {
      googleLoginHandler()
    }
  }, [code, router])

  return { isLoading }
}

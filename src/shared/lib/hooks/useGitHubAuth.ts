'use client'

import { useEffect } from 'react'

import { APP_ROUTES } from '@/shared/constant'
import { authTokenStorage } from '@/shared/lib'
import { jwtDecode } from 'jwt-decode'
import { useRouter, useSearchParams } from 'next/navigation'

export const useGitHubAuth = () => {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('accessToken')

  useEffect(() => {
    const gitHubLoginHandler = async () => {
      if (token) {
        try {
          const decoded = jwtDecode<{ userId: string }>(token)
          const userId = decoded?.userId
          authTokenStorage.setAccessToken(token)
          router.replace(APP_ROUTES.PROFILE.MY(userId))
        } catch (error) {
          console.log(error)
        }
      }
    }

    if (token) {
      gitHubLoginHandler()
    }
  }, [token, router])
}

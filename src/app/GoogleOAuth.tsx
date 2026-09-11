'use client'

import { useGoogleAuth } from '@/features/auth/hooks'
import { useSearchParams } from 'next/navigation'

export const GoogleOAuth = () => {
  const params = useSearchParams()
  const scope = params.get('scope')
  const hasOAuthResult = Boolean(params.get('code') || params.get('error'))
  const isGoogleOAuthCallback =
    hasOAuthResult &&
    (Boolean(params.get('state')) ||
      params.get('iss') === 'https://accounts.google.com' ||
      Boolean(scope?.includes('openid')) ||
      Boolean(scope?.includes('googleapis.com/auth/userinfo')))

  useGoogleAuth({
    enabled: isGoogleOAuthCallback,
  })

  return null
}

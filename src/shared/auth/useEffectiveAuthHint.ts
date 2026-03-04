'use client'

import { useEffect, useState } from 'react'

import { hasAuthSessionHint } from '@/shared/lib/storage'

import { useAuthSessionHintContext } from './authSessionHintContext'

const AUTH_SESSION_HINT_KEY = 'auth_session_hint'
const AUTH_USER_ID_HINT_KEY = 'auth_user_id_hint'

export function useEffectiveAuthHint(): boolean {
  const { hasAuthHint } = useAuthSessionHintContext()
  const [clientHasAuthHint, setClientHasAuthHint] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return hasAuthSessionHint()
  })

  useEffect(() => {
    const syncClientHint = () => {
      setClientHasAuthHint(hasAuthSessionHint())
    }

    syncClientHint()

    const handleStorage = (event: StorageEvent) => {
      if (!event.key) {
        syncClientHint()

        return
      }

      if (event.key === AUTH_SESSION_HINT_KEY || event.key === AUTH_USER_ID_HINT_KEY) {
        syncClientHint()
      }
    }

    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  return hasAuthHint || clientHasAuthHint
}

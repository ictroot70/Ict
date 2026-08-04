'use client'

import { useSyncExternalStore } from 'react'

import { authTokenStorage } from './auth-token'

const getServerSnapshot = () => null

export function useAccessToken(): string | null {
  return useSyncExternalStore(
    authTokenStorage.subscribe,
    authTokenStorage.getAccessToken,
    getServerSnapshot
  )
}

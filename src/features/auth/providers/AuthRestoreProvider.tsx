'use client'

import { ReactNode, useEffect } from 'react'

import { useMeQuery } from '@/features/auth'
import { useGetCountriesQuery } from '@/shared/api'
import { AuthRestoreContextProvider } from '@/shared/auth'
import { migrateFromLocalStorage, useAuthRestore } from '@/shared/lib'

export function AuthRestoreProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    migrateFromLocalStorage()
  }, [])

  const { isRestoring, shouldPrefetch } = useAuthRestore()

  useMeQuery(undefined, {
    skip: !shouldPrefetch,
  })

  useGetCountriesQuery(undefined, {
    skip: !shouldPrefetch,
  })

  return <AuthRestoreContextProvider value={{ isRestoring }}>{children}</AuthRestoreContextProvider>
}

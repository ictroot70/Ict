'use client'

import { ReactNode } from 'react'

import { useMeQuery } from '@/features/auth'
import { useGetCountriesQuery } from '@/shared/api'
import { Loading } from '@/shared/composites'
import { useAuthRestore, migrateFromLocalStorage } from '@/shared/lib'

export function AuthRestoreProvider({ children }: { children: ReactNode }) {
  migrateFromLocalStorage()

  const { isRestoring, shouldPrefetch } = useAuthRestore()

  const { isLoading: isMeLoading } = useMeQuery(undefined, {
    skip: !shouldPrefetch,
  })

  const { isLoading: isCountriesLoading } = useGetCountriesQuery(undefined, {
    skip: !shouldPrefetch,
  })

  if (isRestoring || (shouldPrefetch && isMeLoading)) {
    return <Loading />
  }

  return <>{children}</>
}

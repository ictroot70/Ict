'use client'

import { ReactNode } from 'react'
import { useAuthRestore, migrateFromLocalStorage } from '@/shared/lib'
import { Loading } from '@/shared/composites'
import { useMeQuery } from '@/features/auth'
import { useGetCountriesQuery } from '@/shared/api'

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

'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useMeQuery } from '@/features/auth/api/authApi'
import { Loading } from '@/shared/ui'

export const RootLayoutClient = ({ children }: { children: ReactNode }) => {
  const { isLoading } = useMeQuery()
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    if (isLoading) {
      setShowLoading(true)
    } else {
      const timeout = setTimeout(() => setShowLoading(false), 300)
      return () => clearTimeout(timeout)
    }
  }, [isLoading])

  return <main>{showLoading ? <Loading /> : children}</main>
}
